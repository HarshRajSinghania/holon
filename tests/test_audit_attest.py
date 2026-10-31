"""`holon audit attest` and `holon audit truncate` (G2, 2026-10-30 plan §3).

The 2026-10-24 ledger row proved a tampered chain cannot be healed row-by-row: recomputing one
row's hash breaks the next row's `prev_hash`, so the repair is a **recorded fact**, never a
rewrite of history. `holon audit walk` (2026-10-31, `d4520c8`) now names every break, its kind,
and the rows a fork stepped over — so the two acts that follow it are writes, not reads.

The honest act for a chain that cannot be healed is an **attestation**: the Chair signs, with the
Chair key, that they have seen the break at seq N and accepts the rows that follow. The
attestation is itself a hash-chained event, so it cannot be denied later — an operator who
quarantines a break has attested to it, in the trail, under their own key.

**And it heals nothing.** The break is still a break after the attestation: `holon audit walk`
reports it, and `holon doctor` still errors on it. What the attestation adds is the fact that a
person saw it and accepted it — so the finding the Chair reads names who accepted what, rather
than crying wolf forever or going quiet the moment someone looked at it.

The destructive act is a **truncation**, for a break whose tail is worthless. It refuses without
`--force`, and the refusal is written into the trail before it is honoured — not after: a refusal
that appears only in the transcript is not evidence an auditor can walk.

Both are the Chair's. Neither is an agent's, and the registry declares them `chair`.
"""
import unittest

from holon.core.db import event_hash
from tests.helpers import KernelCase


def _cli_path(cmd):
    """The registry's declared actor class for a command path, or None."""
    from holon.cli import manifest
    return next((c["actor"] for c in manifest() if c["command"] == cmd), None)


def _seed(k, n: int = 8):
    """Give the fixture a chain long enough to fork: `KernelCase.setUp` writes one event, and a
    fork's `skipped` count is the chain's depth, so a one-row fixture would silently fork nothing.
    Written through `log_event` inside one transaction — the chain's own one writer."""
    from holon.core import db
    with db.write_txn(k.wconn):
        for i in range(n):
            db.log_event(k.wconn, "task", f"seed-{i}", None, "open", "seed", f"seed row {i}")
    return k.audit.walk()["checked"]


def _fork(conn, back: int = 4):
    """Reproduce the live instance's own shape (measured 2026-10-31): the head row claims a
    predecessor `back` rows earlier, so it reads as `re-linked`, and the rows it stepped over are
    still in the table, unextended — a fork, not a tamper and not a deletion. The live row sits at
    seq 1815 claiming event 1811, which is four positions back, so it stepped over three events
    (1812, 1813, 1814) and nothing extends them.

    The head row's own hash is recomputed from its new `prev_hash`, because that is what the live
    row looks like: it was written correctly by `log_event` against the head its writer read, so
    it is self-consistent and only its *link* is wrong. A row left with a stale hash would read as
    `edited` instead, which is a different fact with a different act."""
    rows = list(conn.execute("SELECT * FROM events WHERE hash IS NOT NULL ORDER BY seq"))
    tip, older = rows[-1], rows[-(back + 1)]
    conn.execute("UPDATE events SET prev_hash=?, hash=? WHERE seq=?",
                 (older["hash"], event_hash(older["hash"], tip["ts"], tip["entity"], tip["entity_id"],
                                            tip["from_status"], tip["to_status"], tip["actor"],
                                            tip["note"]), tip["seq"]))
    conn.commit()
    return tip["seq"]


class AuditAttestIsTheChairsRecordedAct(KernelCase):
    def test_attest_is_chair_only(self):
        """Signing an audit chain's break is the Chair's hand: the registry must declare `chair`."""
        self.assertEqual(_cli_path("audit attest"), "chair")

    def test_truncate_is_chair_only(self):
        self.assertEqual(_cli_path("audit truncate"), "chair")

    def test_an_attestation_is_a_recorded_fact_and_not_a_repair(self):
        """The honest act is a recorded fact, not a rewrite: the attestation lands as a hash-chained
        event carrying the break it accepts, and the chain is STILL broken afterwards. An
        attestation that silently healed the find would be the 2026-10-24 lie in the other
        direction — a message claiming a change that did not happen."""
        _seed(self.k)
        tip = _fork(self.k.wconn)
        res = self.k.audit.attest(note="fork observed 2026-10-31")
        row = self.k.wconn.execute("SELECT * FROM events WHERE seq=?", (res["seq"],)).fetchone()
        self.assertEqual(row["entity"], "audit")
        self.assertEqual(row["actor"], "chair")
        self.assertIn(str(tip), row["note"])
        self.assertIn("fork observed", row["note"])
        # the attestation is chained to the head, so a later walk cannot deny it
        walk = self.k.audit.walk()
        self.assertEqual([b["seq"] for b in walk["breaks"]], [tip], "the break is still a break")
        self.assertEqual([a["seq"] for a in walk["attestations"]], [res["seq"]])

    def test_the_attestation_names_the_rows_the_fork_abandoned(self):
        """Measured 2026-10-31 on the live instance: the report said "1 separate event" for a
        `re-linked` row whose predecessor was five rows back, hiding that three events had been
        abandoned. The attestation the Chair signs names the second number, so it is read from the
        walker's `skipped` rather than from a count the caller passes in."""
        _seed(self.k)
        # the chain as it stands before the fork, so the assertion names what WAS stepped over:
        # `_fork` makes the tip claim the row four positions back, so the rows stepped over are
        # the three BEFORE the tip — not the last three rows, which include the tip itself.
        before = list(self.k.wconn.execute(
            "SELECT seq FROM events WHERE hash IS NOT NULL ORDER BY seq"))
        tip = _fork(self.k.wconn)
        res = self.k.audit.attest()
        self.assertEqual(res["skipped_count"], 3)
        self.assertEqual([s["seq"] for s in res["skipped"]], [r["seq"] for r in before[-4:-1]])
        self.assertIn("3 event(s) were skipped", res["attested"])

    def test_an_attestation_refuses_a_chain_that_holds(self):
        """There is nothing to accept, so there is nothing to sign. An attestation over a healthy
        chain would tell an auditor the operator had seen a break that never existed."""
        with self.assertRaises(ValueError) as c:
            self.k.audit.attest()
        self.assertIn("no break to attest", str(c.exception))

    def test_a_truncation_refuses_without_force_and_records_the_refusal(self):
        """The destructive half names its own refusal in the trail BEFORE it is honoured: a
        refusal that lives only in the transcript is not evidence an auditor can walk (the same
        class as the 2026-10-20 dropped-digest defect)."""
        _seed(self.k)
        tip = _fork(self.k.wconn)
        before = self.k.audit.walk()["checked"]
        with self.assertRaises(ValueError) as c:
            self.k.audit.truncate(through=tip - 2, force=False)
        self.assertIn("--force", str(c.exception))
        refused = [r for r in self.k.wconn.execute(
            "SELECT seq, entity, to_status, actor, note FROM events WHERE entity='audit'")
            if r[4] and "refused" in r[4]]
        self.assertEqual(len(refused), 1, "the refusal must be in the trail, not only in the output")
        self.assertEqual(refused[0][2], "refused")
        self.assertEqual(refused[0][3], "chair")
        # The refusal is written BEFORE the exception is raised, and that order is the point: a
        # refusal that exists only because the command later succeeded is not the evidence this
        # row exists to produce. So the assertion is on the row's seq, which the caller cannot
        # know before the raise -- not only on "a refusal row exists".
        self.assertEqual(refused[0][0], self.k.audit.walk()["checked"],
                         "the refusal is the last event: it was written, then the refusal raised")
        # and nothing was withdrawn: the refusal wrote, it did not delete
        self.assertEqual(self.k.audit.walk()["checked"], before + 1)


class TruncationWithdrawsATailItCannotHeal(KernelCase):
    def test_truncate_with_force_withdraws_the_rows_past_the_through_seq(self):
        """For a tail worth discarding: the rows past the break are withdrawn rather than healed,
        because 2026-10-24 proved healing one row breaks the next."""
        _seed(self.k)
        tip = _fork(self.k.wconn)
        doomed = self.k.wconn.execute(
            "SELECT count(*) FROM events WHERE seq > ?", (tip - 2,)).fetchone()[0]
        res = self.k.audit.truncate(through=tip - 2, force=True)
        self.assertEqual(res["withdrawn"], doomed)
        self.assertEqual(self.k.audit.walk()["breaks"], [], "the withdrawn tail leaves a chain that walks clean")
        self.assertTrue(any("withdrew" in (r[0] or "") for r in self.k.wconn.execute(
            "SELECT note FROM events WHERE entity='audit'")), "the withdrawal is itself a fact in the trail")

    def test_a_truncate_through_the_break_itself_is_refused(self):
        """The plan's own live measurement is the reason: the branch past the break is the live head
        (1,673 rows on 2026-10-31), so a `--through` that took it would destroy the working trail.
        A truncate withdraws what a break made untrustworthy; it never withdraws the break's own
        branch, and the seq that would do so is refused by name."""
        _seed(self.k)
        tip = _fork(self.k.wconn)
        with self.assertRaises(ValueError) as c:
            self.k.audit.truncate(through=tip, force=True)
        self.assertIn("not past the first break", str(c.exception))

    def test_the_withdrawn_rows_stay_readable_and_are_named(self):
        """A truncation that takes the work with it is the failure the plan names: the withdrawn
        rows must stay readable somewhere, so the command names where (the backup tree the
        heartbeat takes) rather than promising that they survive."""
        _seed(self.k)
        tip = _fork(self.k.wconn)
        res = self.k.audit.truncate(through=tip - 2, force=True)
        self.assertIn("backup", res["survive"])


class AReadOnlyKernelRefusesTheseWrites(KernelCase):
    def test_a_read_only_kernel_refuses_to_attest_before_it_touches_the_database(self):
        """G6's door (2026-10-31, `173b933`) opens the whole kernel read-only. A probe holding that
        door must get the kernel's refusal naming the mode — not SQLite's own lock error, and not
        an AttributeError that reads like a broken capability."""
        from holon.execution.service import Kernel
        ro = Kernel(self.k.home, readonly=True)
        try:
            with self.assertRaises(ValueError) as c:
                ro.audit.attest()
            self.assertIn("read-only", str(c.exception))
        finally:
            ro.close()

    def test_a_read_only_kernel_refuses_to_truncate(self):
        from holon.execution.service import Kernel
        _seed(self.k)
        tip = _fork(self.k.wconn)
        ro = Kernel(self.k.home, readonly=True)
        try:
            with self.assertRaises(ValueError) as c:
                ro.audit.truncate(through=tip - 2, force=True)
            self.assertIn("read-only", str(c.exception))
        finally:
            ro.close()


class DoctorNamesTheBreakTheChairAlreadyAccepted(KernelCase):
    """G2.2. An attestation does not heal the chain, so the finding stays — but it must say that
    the error an operator is reading is the one they signed. A finding whose remedy changes
    nothing and never says so is the 2026-10-26 advice class: the operator runs the command,
    re-reads the doctor, sees the same error, and learns the command did nothing."""

    def _finding(self):
        from holon.integrity import doctor
        return [f for f in doctor.run(self.k) if f["check"] == "audit.chain"]

    def test_the_finding_survives_the_attestation_because_the_chain_is_still_broken(self):
        _seed(self.k)
        _fork(self.k.wconn)
        self.assertEqual(len(self._finding()), 1)
        self.k.audit.attest()
        self.assertEqual(len(self._finding()), 1, "an attestation is not a repair")

    def test_the_finding_names_the_attestation_event(self):
        _seed(self.k)
        _fork(self.k.wconn)
        plain = self._finding()[0]["message"]
        self.assertNotIn("attested", plain)
        res = self.k.audit.attest()
        named = self._finding()[0]["message"]
        self.assertIn("Chair attested this break", named)
        self.assertIn(f"event {res['seq']}", named)
        self.assertIn("not healed", named, "the finding must not read as a repair")

    def test_an_unattested_break_is_not_said_to_be_attested(self):
        _seed(self.k)
        _fork(self.k.wconn)
        self.assertNotIn("attest", self._finding()[0]["message"])


class TheActingPrincipalIsCarriedOntoEveryCapability(KernelCase):
    """The hand-list the CLI carried (`k.actor = k.work.actor = k.org.actor = k.schedules.work.actor`)
    is the defect family the broker's `BROKER_EXTRA` already recorded: a capability added later
    is silently missed, and a missed actor is `anonymous` in the audit trail — measured
    2026-10-31, `holon audit attest` recorded its act under `anonymous` while printing "under the
    Chair key". The guard reads the dispatch's own source and asserts every capability with an
    `actor` attribute is walked, so a new capability fails here the day it is added."""

    def _dispatch_source(self):
        import inspect
        from holon import cli
        return inspect.getsource(cli.main)

    def test_the_actor_patch_walks_every_capability_with_an_actor(self):
        src = self._dispatch_source()
        self.assertIn("cap.actor = principal.actor", src,
                      "the actor must be patched by a walk, not by a hand-list")
        self.assertIn("k.audit", src)

    def test_no_capability_is_left_behind_by_a_chained_assignment(self):
        """The shape that silently dropped `audit` is a chained assignment naming capabilities
        explicitly — the shape that reads like a complete list."""
        for line in self._dispatch_source().splitlines():
            stripped = line.strip()
            if "= principal.actor" in stripped and stripped.count("= ") > 1:
                self.fail(f"a chained actor assignment was reintroduced: {stripped!r}")

    def test_the_attestation_records_the_acting_principal(self):
        """End to end through the capability: the actor the CLI resolves is the actor recorded,
        and it is not the `anonymous` the Kernel is built with."""
        self.k.audit.actor = "chair"
        _seed(self.k)
        _fork(self.k.wconn)
        res = self.k.audit.attest()
        row = self.k.wconn.execute("SELECT actor FROM events WHERE seq=?", (res["seq"],)).fetchone()
        self.assertEqual(row[0], "chair")


if __name__ == "__main__":
    unittest.main()
