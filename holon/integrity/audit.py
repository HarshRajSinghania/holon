"""The audit trail's two writing acts (G2, 2026-10-30 plan §3).

`holon/core/db.py` owns the chain's machinery — `log_event` is the only writer, `walk_chain` the
only walker — and that is where it stays. What it does not own is the two *acts* a break calls for,
because they are decisions rather than mechanics:

  * **attest** (`holon audit attest`, chair): the Chair signs, with the Chair key, that they have
    seen the chain's break and accepts the rows that follow. It is the honest act for a chain that
    cannot be healed, because the 2026-10-24 row proved healing one row's hash breaks the next
    row's `prev_hash` link — so the repair is a **recorded fact**, and the record is an
    attestation: another event, hash-chained to the head, naming the break and what was skipped.
    An operator who quarantines a break has attested to it in the trail, under the Chair key, and
    cannot later say they did not know.
  * **truncate** (`holon audit truncate --through <seq>`, chair, `--force`): the destructive act,
    for a break whose tail is worthless. The rows past the break are withdrawn, never healed, and
    the withdrawn rows stay readable in the backup tree the heartbeat already takes. It refuses
    without `--force`, and the refusal is written into the trail before it is honoured — a refusal
    that lives only in the transcript is not evidence an auditor can walk.

Both are the Chair's, and the gate is where it always is: the registry's actor class, checked when
the command runs. Neither heals a chain, and neither claims to: the messages these two commands
print name the mechanism, never a repair that does not exist.
"""
from __future__ import annotations

import sqlite3

from holon.core import db


class Audit:
    """The trail's own acts. The connection it is handed is the kernel's `wconn`, and the actor
    is the principal that ran the command — the Chair, because the registry says so."""

    def __init__(self, conn: sqlite3.Connection, actor: str, home=None, readonly: bool = False):
        self.conn = conn
        self.actor = actor
        self.home = home
        self.readonly = readonly

    def _write_guard(self):
        """A read-only kernel refuses a write before it touches the database, naming why: a probe
        that only reads must never be handed a statement it cannot obey, and an AttributeError
        there would look like a broken capability rather than a closed door."""
        if self.readonly:
            raise ValueError("this kernel is read-only (`mode=ro`): an attestation or a truncation "
                             "is a write, and it is refused here rather than by SQLite's own lock")

    # ── reads ─────────────────────────────────────────────────────────────
    def walk(self, stop_at_first: bool = False) -> dict:
        """Every break, not the first (G2.1): one walker, shared with `doctor`."""
        return db.walk_chain(self.conn, stop_at_first=stop_at_first)

    def last_seq(self) -> int | None:
        row = self.conn.execute("SELECT max(seq) FROM events WHERE hash IS NOT NULL").fetchone()
        return row[0]

    # ── acts ──────────────────────────────────────────────────────────────
    def attest(self, note: str | None = None) -> dict:
        """Sign that the chain's break has been seen and the rows that follow are accepted.

        The chain cannot be healed: re-computing one row's hash breaks the next row's `prev_hash`
        (2026-10-24, measured). So the honest act is an attestation, and it is written as an event
        on entity `audit` — hash-chained by `log_event`, the one writer — naming the break's seq,
        its kind, and the rows a fork stepped over. The number that is signed is the one the
        walker reports, not a count the caller passes in — and the Chair's key is what makes it
        undeniable: the registry's actor class is the gate, and the event that gate admits carries
        the Chair's name.
        """
        self._write_guard()
        w = self.walk()
        b = w["breaks"][0] if w["breaks"] else None
        if b is None:
            raise ValueError("the chain holds: there is no break to attest. `holon audit walk` "
                             "re-verified every event and found none")
        skipped = b["skipped"]
        break_at = b["seq"]
        # What is accepted is the branch the break forked away from: the rows the walker verified
        # AFTER the break. `checked` counts every row the walk visited, including the break itself,
        # so the rows after it are `checked - break_at` — a number the reader can re-derive from
        # the walk's own output (`audit walk` prints `checked`), which is the standard an
        # attestation's count has to meet: the Chair is signing a fact a second person can check.
        accepted = w["checked"] - break_at
        text = (f"chair attests: saw the break at event {break_at} ({b['reason']}: "
                f"{b['entity']}:{b['entity_id']} at {b['ts']} by {b['actor']}) and accepts the "
                f"{accepted} events that follow it; "
                + (f"{len(skipped)} event(s) were skipped and are abandoned: "
                   + ", ".join(str(s["seq"]) for s in skipped) + "; "
                   if skipped else "nothing was skipped; ")
                + "the chain is not healed — it is attested" + (f" — {note}" if note else ""))
        with db.write_txn(self.conn):
            db.log_event(self.conn, "audit", f"chain:{break_at}", None, "attested", self.actor, text)
        seq = self.last_seq()
        return {"seq": seq, "break_seq": break_at, "reason": b["reason"], "checked": w["checked"],
                "skipped": skipped, "skipped_count": len(skipped), "attested": text}

    def truncate(self, through: int | None = None, note: str | None = None, force: bool = False) -> dict:
        """Withdraw the rows past a break the Chair cannot accept.

        Refuses without `--force`, and the refusal is written into the trail first — an operator
        reading the refusal later is the evidence this command exists to produce. With `--force`
        the rows past the break are deleted from the live table; they remain readable in the backup
        the heartbeat takes (hourly), and that backup is named here rather than promised, because
        a claim about what survives is a claim someone can check. The withdrawal itself is an
        event, so the trail says what was withdrawn and by whom.
        """
        self._write_guard()
        w = self.walk()
        if not w["breaks"]:
            raise ValueError("the chain holds: there is nothing to truncate. `holon audit walk` "
                             "re-verified every event and found no break")
        b = w["breaks"][0]
        through = b["seq"] if through is None else through
        if through >= b["seq"]:
            raise ValueError(f"--through {through} is not past the first break at {b['seq']}: "
                             "a truncate withdraws the rows a break made untrustworthy, not the "
                             "break itself")
        doomed = [dict(r) for r in self.conn.execute(
            "SELECT * FROM events WHERE seq > ? ORDER BY seq", (through,))]
        if not doomed:
            raise ValueError(f"no events past seq {through} to withdraw")
        if not force:
            # Written into the trail BEFORE the refusal is raised: a refusal that exists only in
            # the transcript is not evidence, and the 2026-10-20 dropped-digest row is what
            # happens when the record is left to the caller.
            db.log_event(self.conn, "audit", f"chain:{through}", None, "refused", self.actor,
                         f"chair refused a truncation through {through}: {len(doomed)} event(s) "
                         f"past the break at {b['seq']} would be withdrawn, and `--force` was "
                         "not passed. The trail is unchanged; the rows past the break still verify")
            raise ValueError(f"a truncation withdraws {len(doomed)} event(s) past seq {through}, "
                             "including everything after the break; pass --force (a backup is "
                             "taken by the heartbeat hourly)")
        text = (f"chair withdrew {len(doomed)} event(s) past seq {through}, past the break at "
                f"{b['seq']} ({b['reason']}); the withdrawn rows stay readable in the instance's "
                "backup tree, which the heartbeat takes hourly")
        with db.write_txn(self.conn):
            self.conn.execute("DELETE FROM events WHERE seq > ?", (through,))
            db.log_event(self.conn, "audit", f"chain:{through}", None, "truncated", self.actor,
                         text + (f" — {note}" if note else ""))
        return {"withdrawn": len(doomed), "through": through, "break_seq": b["seq"],
                "survive": ("the withdrawn rows stay readable in the instance's backup tree "
                            "(taken hourly by the heartbeat), not in the live chain"),
                "note": text}
