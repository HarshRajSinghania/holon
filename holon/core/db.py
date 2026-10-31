"""SQLite access + forward-only migrations.

Migrations live in holon/migrations/<db>/NNNN_name.sql and are applied in order,
each in its own transaction, recorded in `schema_migrations`.
"""

from __future__ import annotations

import hashlib
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from importlib import resources
from pathlib import Path
from typing import Iterator

BUSY_TIMEOUT_MS = 15000

# The connections `connect` opened `mode=ro`, by id. A set of ids is not a leak of objects: a
# dead connection's id is reusable, and a stale id can only make a *new* read-write connection
# look read-only, so `close` drops an id when its connection is closed and `is_read_only` never
# holds a reference (holding one would keep the connection object alive forever).
_RO_CONNS: set[int] = set()


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def connect(path: Path, readonly: bool = False) -> sqlite3.Connection:
    if readonly:
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=BUSY_TIMEOUT_MS / 1000,
                               isolation_level=None)
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path, timeout=BUSY_TIMEOUT_MS / 1000, isolation_level=None)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    conn.execute(f"PRAGMA busy_timeout={BUSY_TIMEOUT_MS}")
    if readonly:
        _RO_CONNS.add(id(conn))
    return conn


def close(conn: sqlite3.Connection) -> None:
    """Close a connection `connect` opened, dropping its read-only record.

    Without this, `_RO_CONNS` keeps an id after its connection object is collected, and a later
    connection can be handed the same id and look read-only to every write path -- the failure
    is a write that is silently skipped, which is the direction a stale flag must never point.
    """
    _RO_CONNS.discard(id(conn))
    conn.close()


def is_read_only(conn: sqlite3.Connection) -> bool:
    """Whether this connection was opened `mode=ro`.

    Measured rather than assumed, twice. `PRAGMA query_only` answers 0 for a connection opened
    with `mode=ro` -- it tracks an explicit `PRAGMA query_only=ON`, not the URI's mode -- and a
    `sqlite3.Connection` refuses new attributes outright, so the caller's choice cannot be
    carried on the connection either. What is left is the choice itself, kept where the
    distribution can see it: `connect` records the id of every connection it opened read-only,
    and `is_read_only` asks that set. A connection somebody else opened is not the
    distribution's to classify, and answers False, which is the safe direction for a write
    path: it attempts the write and sqlite refuses it as it always did.
    """
    return id(conn) in _RO_CONNS


@contextmanager
def write_txn(conn: sqlite3.Connection) -> Iterator[sqlite3.Connection]:
    """BEGIN IMMEDIATE: takes the write lock up front so claim-then-update is atomic."""
    conn.execute("BEGIN IMMEDIATE")
    try:
        yield conn
    except BaseException:
        conn.execute("ROLLBACK")
        raise
    else:
        conn.execute("COMMIT")


def has_fts5(conn: sqlite3.Connection) -> bool:
    try:
        conn.execute("CREATE VIRTUAL TABLE temp._fts5_probe USING fts5(x)")
        conn.execute("DROP TABLE temp._fts5_probe")
        return True
    except sqlite3.OperationalError:
        return False


def migration_files(db_name: str) -> list:
    pkg = resources.files("holon.migrations").joinpath(db_name)
    return sorted((p for p in pkg.iterdir() if p.name.endswith((".sql", ".py")) and p.name[0].isdigit()),
                  key=lambda p: p.name)


def checksum(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def migrate(conn: sqlite3.Connection, db_name: str) -> list[str]:
    """Apply pending migrations in order, each in its own transaction. `.sql` files are scripts;
    `.py` files define `up(conn)` for conversions SQL cannot express. Checksums are recorded so
    `holon lint` can prove no applied migration was edited."""
    conn.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT)")
    if "checksum" not in {r[1] for r in conn.execute("PRAGMA table_info(schema_migrations)")}:
        conn.execute("ALTER TABLE schema_migrations ADD COLUMN checksum TEXT")
    done = {r[0] for r in conn.execute("SELECT name FROM schema_migrations")}
    shipped = {f.name for f in migration_files(db_name)}
    unknown = sorted(done - shipped)
    if unknown:
        raise RuntimeError(f"this instance was migrated by a newer Holon (unknown {db_name} migrations: "
                           f"{', '.join(unknown)}); run the checkout that owns it, or upgrade this one")
    # migrations applied before checksums existed: adopt the shipped file as the baseline, once
    unsummed = {r[0] for r in conn.execute("SELECT name FROM schema_migrations WHERE checksum IS NULL")}
    for f in migration_files(db_name):
        if f.name in unsummed:
            conn.execute("UPDATE schema_migrations SET checksum=? WHERE name=?", (checksum(f.read_text()), f.name))
    applied = []
    fts = has_fts5(conn)
    for f in migration_files(db_name):
        if f.name in done:
            continue
        text = f.read_text()
        try:
            # Each migration runs in exactly one transaction, whether it is a .py or a .sql file,
            # and this loop owns it. A caller may arrive with a transaction already open (a
            # pre-graph instance's test setup inserts its rows and never commits), and BEGIN
            # IMMEDIATE inside a transaction is an error — so anything open is committed here.
            if conn.in_transaction:
                conn.commit()
            # Foreign keys are off for the duration, exactly as the .py branch does: a migration
            # that rebuilds a table drops the old one while another table still references it, and
            # SQLite checks that at the statement rather than at the commit (deferring them is not
            # enough — the check still fires mid-rebuild). Each migration ends with its own
            # integrity check where that matters; `PRAGMA foreign_key_check` runs in doctor.
            conn.execute("PRAGMA foreign_keys=OFF")
            if f.name.endswith(".py"):
                ns: dict = {}
                exec(compile(text, f.name, "exec"), ns)
                conn.execute("BEGIN IMMEDIATE")
                ns["up"](conn)
                conn.execute("INSERT INTO schema_migrations VALUES (?,?,?)", (f.name, now(), checksum(text)))
                conn.execute("COMMIT")
            else:
                sql = "" if ".fts." in f.name and not fts else text  # FTS is optional; search falls back to LIKE
                conn.executescript(f"BEGIN IMMEDIATE;\n{sql}\nINSERT INTO schema_migrations VALUES "
                                   f"('{f.name}', '{now()}', '{checksum(text)}');\nCOMMIT;")
            conn.execute("PRAGMA foreign_keys=ON")
        except BaseException:
            if conn.in_transaction:
                conn.execute("ROLLBACK")
            conn.execute("PRAGMA foreign_keys=ON")
            raise
        applied.append(f.name)
    return applied


def log_event(conn: sqlite3.Connection, entity: str, entity_id: str, frm: str | None, to: str | None,
              actor: str | None, note: str | None = None) -> None:
    """Append to the audit trail. Each event carries the hash of the previous one, so any edit or
    deletion breaks the chain (`holon doctor` verifies it). Call inside a write transaction.

    Measured 2026-10-28 on the live instance: B1's first two wake-dispatched bodies ended within
    the same second, and both ran this read-then-insert in autocommit — two statements, two
    transactions — so each read the same chain head and each built its own branch. The audit
    chain forked at event 1815 and `holon doctor` has flagged it since. A caller that has
    already opened a write transaction (`write_txn`) keeps its atomicity; a caller that has not
    — the dispatch path records a body that produced no envelope after its harness has already
    released the claim's transaction — takes the write lock here, so the head it reads is the
    head it extends. Two writers serialize; the chain has one head."""
    own = not conn.in_transaction
    if own:
        conn.execute("BEGIN IMMEDIATE")
    try:
        prev = conn.execute("SELECT hash FROM events WHERE hash IS NOT NULL ORDER BY seq DESC LIMIT 1").fetchone()
        prev_hash = prev[0] if prev else ""
        ts = now()
        h = event_hash(prev_hash, ts, entity, entity_id, frm, to, actor, note)
        conn.execute("INSERT INTO events (ts, entity, entity_id, from_status, to_status, actor, note, prev_hash, hash)"
                     " VALUES (?,?,?,?,?,?,?,?,?)", (ts, entity, entity_id, frm, to, actor, note, prev_hash, h))
    except BaseException:
        if own:
            conn.execute("ROLLBACK")
        raise
    else:
        if own:
            conn.execute("COMMIT")


def event_hash(prev_hash: str, ts: str, entity: str, entity_id: str, frm: str | None, to: str | None,
               actor: str | None, note: str | None) -> str:
    fields = [prev_hash, ts, entity, entity_id, frm or "", to or "", actor or "", note or ""]
    return hashlib.sha256("\x1f".join(fields).encode()).hexdigest()


def walk_chain(conn: sqlite3.Connection, stop_at_first: bool = True) -> dict:
    """Walk the audit trail's hash chain and report every break, not just the first.

    G2, 2026-10-30. `doctor` walked the chain, found the first break at seq N and **stopped** --
    so an operator holding "event 1815" had to re-derive by hand whether the break was one event
    or a thousand, whether anything after it could be trusted, and what the honest next act was.
    The ledger's own 2026-10-24 row had already proved a tampered chain cannot be healed row-by-row
    (healing one row's hash breaks the next row's `prev_hash` link), so the missing piece was never
    a repair -- it was a report. The two acts a report can name (an attestation sealing what is
    beyond repair, and a truncation withdrawing a rewritten tail) are the Chair's to authorize, and
    neither is written yet; this walker deliberately names no command that does not exist, because
    a message pointing at an unwritten command is the remediation class the ledger already carries.

    The distinction that makes the report useful, measured rather than assumed: a chain with ONE
    break whose remaining rows each verify is a single edited or removed event, while a run of
    `re-linked` rows is a tail that was rewritten. Those need different acts, so the walker
    separates them instead of returning a count.

    And a break's `prev_hash` names the row it claims to follow, so the rows *between* that row
    and this one are the rows the chain stepped over. Measured 2026-10-31 against the live
    instance: the walk said "1 separate events were edited or removed" for a `re-linked` row whose
    predecessor was five rows back, which hid that **three events had been skipped and nothing
    extended them**. "One row moved" and "a fork abandoned three events" are different facts and
    the attestation the Chair signs names the second one, so the walker reports it as
    `skipped` rather than leaving an operator to count the gap by hand.

    `stop_at_first` exists because doctor keeps its one-error-per-check behaviour by calling with
    it, and the same walker serves `holon audit walk`, which does not. One implementation, two
    callers: two walkers would drift the moment one learned something the other did not.
    """
    rows = list(conn.execute("SELECT * FROM events WHERE hash IS NOT NULL ORDER BY seq"))
    breaks: list[dict] = []
    checked = 0
    prev = ""
    last_ok_seq: int | None = None
    for e in rows:
        expected = event_hash(e["prev_hash"] or "", e["ts"], e["entity"], e["entity_id"],
                              e["from_status"], e["to_status"], e["actor"], e["note"])
        if e["hash"] != expected:
            # The row's own content does not produce the hash stored on it: an edited row.
            kind = "edited"
        elif e["prev_hash"] != prev:
            kind = "re-linked"      # the row is self-consistent but points at the wrong predecessor
        else:
            kind = None
        if kind:
            # The rows this one stepped over: the chain's own declared predecessor is `prev_hash`,
            # and everything between it and this row was not extended by anything that follows.
            skipped: list[dict] = []
            won = None
            if kind == "re-linked":
                won = next((r for r in rows if r["hash"] == e["prev_hash"]), None)
                if won and won["seq"] < e["seq"] - 1:
                    skipped = [dict(r, note=(r["note"] or "")[:200]) for r in rows
                               if won["seq"] < r["seq"] < e["seq"]]
            breaks.append({"seq": e["seq"], "reason": kind,
                           "entity": e["entity"], "entity_id": e["entity_id"],
                           "ts": e["ts"], "actor": e["actor"],
                           "note": (e["note"] or "")[:200],
                           # the row this one claims to follow, when the trail holds it
                           "prev_hash": e["prev_hash"], "skipped": skipped,
                           "from_seq": won["seq"] if kind == "re-linked" and won else None})
        else:
            last_ok_seq = e["seq"]
        # `prev` advances along what the ROWS say, not along what verifies: `prev_hash` is the
        # link the row itself declares, so following it is how the walk detects a later row that
        # silently re-linked. Not advancing is the failure mode this walker's first draft had --
        # one edited row then made every following row look broken too, which reports a
        # catastrophic rewrite where a single edit stands, and an operator who truncates on that
        # reading destroys a trail that only needed attesting.
        prev = e["hash"]
        checked += 1
        if breaks and stop_at_first:
            break
    # What follows the last break is what decides the honest act, and it is read from the rows
    # rather than inferred from the break count: when every row after the first break is itself
    # self-consistent, a single event was edited; when the rows after it are also broken, the
    # tail was rewritten. `re-linked` rows in a run are that rewrite.
    kinds = [b["reason"] for b in breaks]
    tail_rewritten = len(breaks) > 1 and all(k == "re-linked" for k in kinds)
    return {"checked": checked, "breaks": breaks, "last_ok_seq": last_ok_seq,
            "tail_rewritten": tail_rewritten,
            "one_edited_row": len(breaks) == 1 and kinds[0] == "edited",
            "first_break_seq": breaks[0]["seq"] if breaks else None,
            "break_count": len(breaks)}
