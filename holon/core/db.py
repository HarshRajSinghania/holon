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
class _ReadOnly(sqlite3.Connection):
    """A connection opened `mode=ro`, marked by its own class.

    The record used to be a set of ids, and that was measured wrong on 2026-11-04: CPython
    reuses the id of a collected object, so a read-only connection dropped without
    `db.close` leaves its id behind and the NEXT read-write connection inherits it and looks
    read-only to every write path. That is not theoretical — it is exactly how the suite's
    `Kernel(home, readonly=True)` cases (tests/test_isolation_redteam.py,
    tests/test_audit_attest.py, none of which close) made `tests/test_core.MemoryBehaviour`
    fail with `no such table: departments`: the poisoned write connection skipped
    `migrate`'s schema, and the direction of the failure is a *write silently skipped*, which
    is the one direction a stale flag must never point. Holding a reference in a set is the
    other wrong answer (the connection object never gets collected). A subclass is the
    identity that dies with its object and cannot be inherited by anything else.
    """
    _holon_read_only = True


class _ReadWrite(sqlite3.Connection):
    """The counterpart, so `is_read_only` is a positive check on this class and not the
    absence of a mark on some other class a future caller might pass in."""


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def connect(path: Path, readonly: bool = False) -> sqlite3.Connection:
    if readonly:
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=BUSY_TIMEOUT_MS / 1000,
                               isolation_level=None, factory=_ReadOnly)
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path, timeout=BUSY_TIMEOUT_MS / 1000, isolation_level=None,
                               factory=_ReadWrite)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    conn.execute(f"PRAGMA busy_timeout={BUSY_TIMEOUT_MS}")
    return conn


def close(conn: sqlite3.Connection) -> None:
    """Close a connection `connect` opened.

    There is no record to drop: the read-only identity is the object's class, so it dies with
    the object. That is the whole point of the change -- the id-set this replaced had to be
    pruned by hand here, and a caller who simply dropped the connection (every read-only
    `Kernel` in the suite does) left the id behind for the next write connection to inherit.
    """
    conn.close()


def is_read_only(conn: sqlite3.Connection) -> bool:
    """Whether this connection was opened `mode=ro`.

    Measured rather than assumed, three times. `PRAGMA query_only` answers 0 for a connection
    opened with `mode=ro` -- it tracks an explicit `PRAGMA query_only=ON`, not the URI's mode
    -- and a `sqlite3.Connection` refuses new attributes outright, so the caller's choice
    cannot be carried on the connection either. What is left is the choice itself, kept where
    the distribution can see it: `connect` opens every connection through a factory class that
    encodes it, and `is_read_only` asks the class. The first attempt was a set of ids and it
    was measured wrong -- an id is reused after its object is collected, so a read-only
    connection dropped without `db.close` bequeathed its id to the next read-write one, which
    then read as read-only and skipped its own writes. The class is the identity that dies
    with the object.

    A connection somebody else opened is not the distribution's to classify, and answers False,
    which is the safe direction for a write path: it attempts the write and sqlite refuses it as
    it always did.
    """
    return isinstance(conn, _ReadOnly)


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
    `holon lint` can prove no applied migration was edited.

    A read-only connection applies nothing and returns empty. Measured 2026-11-03 while
    validating G9: `holon --home <live> --mode ro task list` died with
    `sqlite3.OperationalError: attempt to write a readonly database`, raised from inside
    `0006_checksum_repair.py`'s `up()` -- because `--mode ro` opens both databases `mode=ro`
    but `Kernel.__init__` calls `migrate` unconditionally, and migration is definitionally
    a write. The whole point of the read-only door (the 2026-10-24 audit row: a probe of live
    state must not leave the db it probed with a fresh `-wal` and its own migration stamps)
    was defeated by the one call every construction makes. `is_read_only` is the record
    `connect` keeps for exactly this, and `readonly=True` skips `migrate` at the Kernel too
    -- but a guard here is what makes the rule hold for EVERY caller rather than the one the
    CLI happens to have: a caller that forgets gets a no-op, not a crash on its first
    statement, and a schema that is behind is reported by the caller's own reading rather
    than silently migrated under it."""
    if is_read_only(conn):
        return []
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


def _break_of(entity_id: str | None) -> int | None:
    """The break an attestation names, from its `chain:<seq>` entity_id, or None.

    `holon audit attest` records its accept as an event on entity `audit` keyed by the break's own
    seq, so the attestation is a trail row a walk can find rather than a side table that would be a
    second writer of the same fact. An `audit` row whose entity_id is not a chain reference (a
    refusal, a withdrawal, or an unrelated audit event) is not an attestation of a break and is
    skipped here, so the count an operator reads is only what was actually signed."""
    s = (entity_id or "").strip()
    if not s.startswith("chain:"):
        return None
    try:
        return int(s[6:])
    except ValueError:
        return None


def walk_chain(conn: sqlite3.Connection, stop_at_first: bool = True) -> dict:
    """Walk the audit trail's hash chain and report every break, not just the first.

    G2, 2026-10-30. `doctor` walked the chain, found the first break at seq N and **stopped** --
    so an operator holding "event 1815" had to re-derive by hand whether the break was one event
    or a thousand, whether anything after it could be trusted, and what the honest next act was.
    The ledger's own 2026-10-24 row had already proved a tampered chain cannot be healed row-by-row
    (healing one row's hash breaks the next row's `prev_hash` link), so the missing piece was never
    a repair -- it was a report. The two acts a report can name (an attestation sealing what is
    beyond repair, and a truncation withdrawing a rewritten tail) are the Chair's to authorize, and
    both are written now, in `holon/integrity/audit.py`. This docstring said "neither is written yet"
    when the walker shipped, and that sentence was false by 2026-10-31 — a reader trusting it would
    have concluded the report led nowhere and re-derived the acts by hand. Corrected in place, as
    the plan's own root-cause row was: a stale claim about one's own mechanism is the defect, not a
    detail.

    The distinction that makes the report useful, measured rather than assumed: a chain with ONE
    break whose remaining rows each verify is a single edited or removed event, while a run of
    `re-linked` rows is a tail that was rewritten. Those need different acts, so the walker
    separates them instead of returning a count.

    The two acts this walker's report leads to are **written**, in `holon/integrity/audit.py`:
    `attest` (the honest act for a chain that cannot be healed) and `truncate` (the destructive
    half, for a tail worth discarding). Both are the Chair's, and this docstring used to say they
    were still unwritten — a claim that was already false when it was made and that the next
    reader would have acted on, so it is corrected here rather than quietly left. Neither heals a
    chain, and neither claims to: healing one row's hash breaks the next row's `prev_hash`, which
    the 2026-10-24 row proved by measurement.

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

    And a break's `prev_hash` names the row it claims to follow, so the rows *between* that row
    and this one are the rows the chain stepped over. Measured 2026-10-31 against the live
    instance: the walk said "1 separate events were edited or removed" for a `re-linked` row whose
    predecessor was five rows back, which hid that **three events had been skipped and nothing
    extended them**. "One row moved" and "a fork abandoned three events" are different facts and
    the attestation the Chair signs names the second one, so the walker reports it as
    `skipped` rather than leaving an operator to count the gap by hand.

    The walker also reports the **attestations** already in the trail, because an attestation does
    not heal a break and must not read as if it did: the Chair who has seen event N's break and
    accepted the rows after it is a fact the next reader needs, in the same walk that still
    reports the break. Reading one without the other is how an operator concludes either that
    nobody ever looked, or that looking was the fix.
    """
    rows = list(conn.execute("SELECT * FROM events WHERE hash IS NOT NULL ORDER BY seq"))
    breaks: list[dict] = []
    # What the Chair has already signed, so a reader of this walk sees the break AND its
    # attestation in one place. An attestation is an event on entity 'audit' whose entity_id names
    # the break it accepts (`chain:<seq>`), and it is read from the trail rather than from a
    # column, because a column would be a second writer.
    attestations: list[dict] = [
        {"seq": a["seq"], "break_seq": _break_of(a["entity_id"]), "ts": a["ts"],
         "actor": a["actor"], "note": (a["note"] or "")[:200]}
        for a in rows if a["entity"] == "audit" and _break_of(a["entity_id"]) is not None]
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
            "attestations": attestations, "attested_seqs": [a["break_seq"] for a in attestations],
            "tail_rewritten": tail_rewritten,
            "one_edited_row": len(breaks) == 1 and kinds[0] == "edited",
            "first_break_seq": breaks[0]["seq"] if breaks else None,
            "break_count": len(breaks)}
