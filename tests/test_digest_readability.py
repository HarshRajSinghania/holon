"""The digest line tells the Chair what to decide and how to act on it.

Measured live 2026-10-30, the Chair's Telegram: 14 lines of

    approve? Routine: reddit-karma-lane-weekly-hod-audit (holon plan show tsk_01M5QXZ6MY437S0VFQN1KVCW2Y)

Three things are wrong with that, and all three cost the Chair time:
1. **The id is not typable.** 27 Crockford-base32 characters, case-sensitive, with no way to
   recover from one wrong character — and the command it names does an exact lookup, so a
   near-miss reads as "not found" rather than "did you mean".
2. **The line names no consequence.** The Chair is being asked to authorise an unattended
   routine that runs forever on a schedule. Whether it needs an agent or a command, how often
   it fires, and whether it reaches people outside the organization are all in the row and none
   were rendered — so every line looks the same and all 14 must be opened to be distinguished.
3. **`approve? Routine: X` reads as a question about a routine.** What is being approved is a
   plan, and the Chair's command is `plan approve`.

The digest's twin rows (the buttons a chat surface renders) are parsed from the prose, so the
line's shape is load-bearing: `digest_rows` reads the trailing `(command ref)` for a button's
id and verb. These guards therefore hold both the prose a human reads and the row a button
renders, because changing one without the other silently drops the button.
"""

import re

from tests.helpers import KernelCase


class TheDigestNamesWhatItAsks(KernelCase):
    config = "[grading]\nnovelty_min_verified = 0\n[autonomy]\nverify_sample_rate = 0\n"

    def _routine_line(self, **kw):
        kw.setdefault("dept", "eng")
        kw.setdefault("cron", "0 7 * * *")
        kw.setdefault("intent", "Summarise the inbox and file it")
        a = self.k.add_routine(kw.pop("title", "notes-digest"), **kw)
        lines = self.k.pending_for_chair(0)
        return [x for x in lines if a["id"] in x or a["title"].replace("Routine: ", "") in x][0], a

    def test_the_line_says_what_is_being_approved_not_just_its_name(self):
        line, _ = self._routine_line(title="notes-digest", cron="0 7 * * *")
        self.assertTrue(line.startswith("approve? "), line)
        self.assertIn("notes-digest", line)
        # what the Chair is actually deciding, in words a reader can act on
        self.assertRegex(line, r"(?i)(once a day|times a day|on demand|every|hourly)",
                         "the cadence is what makes a routine worth reading about")

    def test_a_routine_that_reaches_outside_says_so_on_the_line(self):
        """The Chair's standing rule: an outside-reach routine lands disabled and is enabled
        per job. A line that cannot show that hides the consequence of approving it."""
        line, _ = self._routine_line(
            title="send-applicant-reply",
            intent="Email each applicant a personalised reply about their application.")
        self.assertRegex(line, r"(?i)(outside|third part|reaches)",
                         f"outside reach is the fact the approver needs: {line}")

    def test_the_cadence_reads_like_something_a_person_says(self):
        """`1 times a day` for an hourly job was the first render of this: the count is right and
        the sentence is wrong, and a reader who sees it trusts the rest of the line less."""
        from holon.execution.service import Kernel
        cases = {
            "0 7 * * *": "once a day",
            "30 * * * *": "hourly",
            "*/5 * * * *": "288 times a day",
            "0 */6 * * *": "4 times a day",
            "0 */12 * * *": "2 times a day",
            "0 */2 * * *": "12 times a day",
            "0 6 * * 1": "once a day",
            "0 8,20 * * *": "2 times a day",
            "": "on demand (no cron: you fire it)",
            "not a cron": "on schedule `not a cron`",
        }
        for cron, expected in cases.items():
            self.assertEqual(Kernel._cadence(cron), expected, cron)

    def test_the_lane_the_routine_will_run_in_is_named(self):
        """A script lane runs a command an unattended cron can execute; a full lane plans,
        approves, executes and verifies. That is the difference between a line of config and
        an agent session on every firing."""
        line, _ = self._routine_line(title="notes-digest", command="true")
        self.assertIn("script", line, line)

    def test_the_id_stays_but_the_command_decides_the_same_thing(self):
        """The id is not shortened — a short id needs a resolver, a schema change and a migration,
        and the ULIDs stay 27 characters either way. What changes is that the command beside the
        id is now the one that DECIDES it (`plan approve`), so the line names both the subject and
        the action, instead of naming a read-only `plan show` that answers nothing."""
        line, a = self._routine_line(title="notes-digest")
        self.assertIn(a["id"], line, "the full id is the machine route and must survive")
        self.assertIn("holon plan approve", line, "and the verb is the decision, not a lookup")

    def test_the_button_twin_still_gets_its_id_and_verb(self):
        """The rows a chat surface renders are derived from the same lines. A line that no
        longer ends in a resolvable `(command ref)` loses its button, and the Chair is back
        to typing 27 characters."""
        self._routine_line(title="notes-digest")
        rows = self.k.digest_rows(0)
        decide = [r for r in rows if r["kind"] == "decision"]
        self.assertTrue(decide, f"no decision row: {rows}")
        self.assertIsNotNone(decide[0]["id"], decide[0])
        self.assertTrue(decide[0]["action"], decide[0])
        self.assertTrue(decide[0]["id"].startswith("tsk_"), decide[0]["id"])
        # and the prose the row rides beside is the same line, not a second description
        self.assertIn("notes-digest", decide[0]["text"])

    def test_an_incident_line_says_what_failed_once(self):
        """`incident: Incident: runs keep failing on tsk_...` stutters the word Incident —
        the kind label and the title's own prefix say the same thing — and names an id with
        no subject. The subject is the work that keeps failing, and it must be reachable."""
        self.install_fake_driver("fake", mode="garbage")
        self.add(dept="eng")
        for _ in range(4):
            self.k.dispatch(self.hod, "plan")
        # the heartbeat's own order: the sweep finds the failures and opens the incident, and only
        # then does the digest name it
        self.k.triggers()
        owed = self.k.pending_for_chair(0)
        line = [x for x in owed if x.startswith("incident")]
        self.assertTrue(line, f"the incident reaches the Chair; owes={owed}")
        line = line[0]
        self.assertNotIn("incident: Incident:", line, "the label and the title stutter")
        self.assertRegex(line, r"(?i)incident", "it is still recognisable as one")
        self.assertRegex(line, r"(?i)(runs|stage|harness|model|brief)",
                         "it names the class of failure")
        self.assertRegex(line, r"(?i)(task show|holon task)",
                         "and how to look at it")


if __name__ == "__main__":
    import unittest
    unittest.main()
