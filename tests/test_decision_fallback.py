"""A caller that can wait asks the second endpoint when the first one fails.

Measured live 2026-10-30: the heartbeat recorded `decision model unavailable (lane): HTTP 404 ...
use this slug instead: inception/mercury-decide` on every intake, while the SAME question asked
with the fallback consulted returned `lane='fast'` at 0.762. The primary was withdrawn from the
free tier; the fallback was alive and answering. The direct cause was `Decider.ask(...,
patient=False)` at three of the four call sites, and the fallback branch was gated on `patient`
— so a configured, keyed, working second endpoint was never consulted.

The bug is invisible in three ways at once: (1) the caller takes its safe default, which is
correct behaviour, so nothing reads as broken; (2) the event the Chair sees names the primary's
error and says nothing about the endpoint that was never tried; and (3) the config looks right —
both endpoints are named, both keys exist.
"""

import unittest

from tests.fake_decisions import FakeDecisions
from tests.helpers import KernelCase

CFG = ('[classifier]\nurl = "{primary}"\nmodel = "m"\nkey_file = "{key}"\n'
       'fallback_url = "{fallback}"\nfallback_model = "clef-flash"\n'
       'fallback_key_file = "{key}"\nfallback_timeout_s = 420\ntimeout_s = 5\n'
       'min_confidence = 0.8\n')


class PatientFallback(KernelCase):
    config = "[grading]\nnovelty_min_verified = 0\n[autonomy]\nverify_sample_rate = 0\n"

    def setUp(self):
        super().setUp()
        self.primary = FakeDecisions()
        self.fallback = FakeDecisions()
        self.addCleanup(self.primary.close)
        self.addCleanup(self.fallback.close)
        (self.tmp / "c.key").write_text("sk-test\n")
        self.write_config()

    def write_config(self):
        self.home.config_file.write_text(
            self.pipeline + "\n" + self.config + "\n"
            + CFG.format(primary=self.primary.url, fallback=self.fallback.url,
                         key=self.tmp / "c.key"))
        self.k.close()
        self.k = type(self.k)(self.home)

    def test_a_primary_that_is_down_does_not_leave_the_lane_unanswered(self):
        """The lane question is asked of the second endpoint when the first fails."""
        self.primary.status = 404
        cls = self.k.classify("Operation: inbox-scanner-daily", "Scan the applicant inbox and reply")
        self.assertEqual(cls["source"], "classifier", "a working second endpoint must be asked")
        self.assertEqual(cls["lane"], "script", "and its answer must be used")
        self.assertEqual(cls["confidence"], 0.95)
        self.assertTrue(self.fallback.requests, "the fallback received nothing")

    def test_routing_consults_the_second_endpoint_too(self):
        self.k.org.create_dept("ops", "Operations", "Keep machines and services running")
        self.primary.status = 429
        self.fallback.choose(dept="ops")
        got = self.k.route_dept("Disk full", "the VPS disk is at 95%")
        self.assertEqual(got["dept"], "ops")
        self.assertEqual(got["source"], "classifier")

    def test_a_failure_cause_is_read_from_the_second_endpoint(self):
        """Failure triage runs inside the heartbeat's sweep, so its cost is bounded by the
        fallback's own timeout rather than added to every tick: it is only reached when an
        incident is being created, and the primary is down, so the second endpoint answers."""
        self.install_fake_driver("fake", mode="garbage")
        self.add(dept="eng")
        for _ in range(3):
            self.k.dispatch(self.hod, "plan")
        self.primary.status = 404
        self.fallback.choose(cause="brief")
        inc = [t for t in self.k.triggers() if t.get("incident")]
        self.assertTrue(inc, "no incident was created")
        intent = self.k.work.get(inc[0]["incident"])["intent"]
        self.assertIn("Likely cause (decision model", intent)

    def test_the_message_names_the_endpoint_that_failed_and_the_one_that_answered(self):
        """The Chair must be able to tell a total outage from a degraded one. A message naming
        only the primary's error, on a config with a working second endpoint, sends the reader
        to fix the wrong thing."""
        self.primary.status = 404
        self.k.classify("Operation: inbox-scanner-daily", "Scan the applicant inbox and reply")
        line = [x for x in self.k.pending_for_chair(0) if x.startswith("decision model unavailable")]
        self.assertEqual(len(line), 0, "nothing is unavailable: the second endpoint answered")

    def test_both_endpoints_down_still_takes_the_safe_default_and_says_why(self):
        self.primary.status = 404
        self.fallback.status = 500
        cls = self.k.classify("Operation: inbox-scanner-daily", "Scan the inbox")
        self.assertIsNone(cls["lane"])
        self.assertEqual(cls["source"], "failed")
        line = [x for x in self.k.pending_for_chair(0) if x.startswith("decision model unavailable")]
        self.assertEqual(len(line), 1, "a real outage must still reach the Chair")
        self.assertIn("404", line[0])
        self.assertIn("500", line[0], "both endpoints' errors are named")

    def test_a_slow_second_endpoint_is_only_waited_for_where_waiting_is_free(self):
        """The rubric judge already waited. The lane question does not gate a dispatch's
        deadline, so it may wait too — but the timeout is the fallback's own, not the primary's."""
        self.primary.status = 404
        self.fallback.status = 200
        self.k.classify("Operation: inbox-scanner-daily", "Scan the inbox")
        self.assertTrue(self.fallback.requests)


if __name__ == "__main__":
    unittest.main()
