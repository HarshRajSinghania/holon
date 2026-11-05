"""Guards for G7: an operation's declared steps are the DAG one firing runs.

The 2026-10-31 outline's gate for this row, verbatim: "an operation with a `script` step and a
`branch_one` falling back to an `agent` step runs the script for free on the days it succeeds,
wakes a body only when it does not, and the grade reflects it — one test crossing the seam with
the other side's real artifact, not a stub."

So the seam test here runs a REAL script (a file on disk, run by the kernel's own script lane)
and asserts both directions of the branch. The reader is a real DAG: one work node per step, one
`task_needs` row per edge, the kernel's own `run_script` for the free step.

What the predecessor's suite proved, and what it could not: the validator was wired and 24
guards in `tests.test_operations` stayed green while nothing in the repository ever RAN a step.
The vocabulary carried no `agent` kind — the one the grader prices — so the escalation a steps
operation exists to declare was refused at submit and unreachable at grading.
"""

from __future__ import annotations

import json
import stat
import unittest

from tests.helpers import KernelCase
from holon.core import contract, vocab


class StepGrade(KernelCase):
    """The grade the shape earns, because the shape is a cost the kernel can see."""

    def test_the_vocabulary_and_the_grader_agree_about_the_word_that_costs(self):
        """`grading._complexity_floor` prices `kind == "agent"`; before 2026-11-05 the vocabulary
        refused it, so the rule that prices the escalation was unreachable in both directions: a
        plan naming it failed validation, and an operation that never named it read as free."""
        self.assertIn("agent", vocab.STEP_KINDS)
        contract.validate("plan", {"kind": "plan", "findings": "x", "steps": [{"kind": "agent", "command": "y"}]})

    def test_the_kind_splits_cover_every_kind_in_the_vocabulary(self):
        """The DAG dispatches on the split, so a kind that is in no split is a kind nothing runs."""
        splits = set(vocab.STEP_KINDS_KERNEL) | set(vocab.STEP_KINDS_BODY) | set(vocab.STEP_KINDS_BRANCH)
        self.assertEqual(splits, set(vocab.STEP_KINDS),
                         "every step kind is either the kernel's to run or a body's")

    def test_a_step_that_wakes_a_body_is_floored_over_one_that_does_not(self):
        script_only = self.k.add_operation("Check only", "check the feed", dept="eng", cron="0 7 * * *",
                                           workdir=str(self.workdir),
                                           steps=[{"kind": "script", "command": "true"}])
        body = self.k.add_operation("Write body", "write the report", dept="eng", cron="0 7 * * *",
                                    workdir=str(self.workdir),
                                    steps=[{"kind": "script", "command": "true"},
                                           {"kind": "agent", "command": "write the report"}])
        escalating = self.k.add_operation("Write escalating", "write the report", dept="eng", cron="0 7 * * *",
                                          workdir=str(self.workdir),
                                          steps=[{"kind": "script", "command": "true"},
                                                 {"kind": "branch_one", "depends_on": [0]},
                                                 {"kind": "agent", "command": "write the report",
                                                  "depends_on": [1]}])
        self.assertEqual(script_only["grade"], 2, "an operation runs unattended: floor G2")
        self.assertEqual(body["grade"], 2, "an agent step is floored at G2: it wakes a body")
        self.assertEqual(escalating["grade"], 3,
                         "an operation that can escalate from a branch to a body must be checked, "
                         "not trusted: floor G3")
        plan = self.k.work.plan_for_approval(escalating["id"])
        self.assertIn("escalate", json.dumps(self.k.work.get(plan["id"])["grade_reasons"] or []),
                      "the approver is told why the grade is what it is")

    def test_an_all_kernel_operation_takes_the_script_lane_and_needs_nobody(self):
        """The lane comes from the kinds, because the kinds are what costs money."""
        a = self.k.add_operation("Check", "check the feed", dept="eng", cron="0 7 * * *",
                                 workdir=str(self.workdir),
                                 steps=[{"kind": "script", "command": "true"},
                                        {"kind": "script", "command": "echo hi", "depends_on": [0]}])
        body = self.k.work.output(self.k.work.plan_for_approval(a["id"])["id"])["body"]
        self.assertEqual(body["lane"], "script", "no body is woken: the kernel is the runner")


class StepWriter(KernelCase):
    """The writer: `holon operation add --steps`, refused at submit for anything that cannot run."""

    def steps_of(self, **kw):
        kw.setdefault("dept", "eng")
        kw.setdefault("cron", "0 7 * * *")
        kw.setdefault("workdir", str(self.workdir))
        a = self.k.add_operation(kw.pop("title", "check then write"), kw.pop("intent", "check the feed"),
                                 steps=kw.pop("steps"), **kw)
        return a, self.k.work.plan_for_approval(a["id"])

    def test_a_step_the_dag_cannot_run_is_refused_at_the_writer(self):
        with self.assertRaises(ValueError) as cm:
            self.steps_of(steps=[{"kind": "script"}])
        self.assertIn("no command", str(cm.exception))

    def test_a_kind_outside_the_vocabulary_is_refused(self):
        with self.assertRaises(ValueError) as cm:
            self.steps_of(steps=[{"kind": "brnach_one"}])
        self.assertIn("brnach_one", str(cm.exception))

    def test_an_edge_into_a_step_that_comes_later_is_refused(self):
        with self.assertRaises(ValueError) as cm:
            self.steps_of(steps=[{"kind": "script", "command": "true", "depends_on": [1]},
                                 {"kind": "script", "command": "echo"}])
        self.assertIn("LATER", str(cm.exception),
                      "the list is the order the DAG is built in")

    def test_a_steps_operation_cannot_also_carry_one_command(self):
        with self.assertRaises(ValueError) as cm:
            self.steps_of(command="true", steps=[{"kind": "script", "command": "true"}])
        self.assertIn("ONE command", str(cm.exception))

    def test_a_steps_operation_takes_its_lane_from_the_kinds_it_declares(self):
        with self.assertRaises(ValueError) as cm:
            self.steps_of(lane="full", steps=[{"kind": "script", "command": "true"}])
        self.assertIn("lane", str(cm.exception))

    def test_the_steps_ride_on_the_operations_payload_and_the_plans_record(self):
        steps = [{"kind": "script", "command": "true"},
                 {"kind": "branch_one", "depends_on": [0], "on": "failure"},
                 {"kind": "agent", "command": "write it", "depends_on": [1]}]
        a, plan = self.steps_of(steps=steps)
        body = self.k.work.output(plan["id"])["body"]
        self.assertEqual(body["operation_steps"], steps, "the payload a firing reads is the step list")
        recorded = body["steps"]
        self.assertIsInstance(recorded, list) and isinstance(recorded[0], str)
        self.assertIn("declared steps", recorded[0],
                      "the plan's own record says what the operation does, in words")


class OperationSteps(KernelCase):
    """G7's gate, crossed with a real artifact: a script file the kernel runs, and the branch
    that decides — at firing time — whether a body is woken for it."""

    def check(self, name="check.sh", exit_code=0):
        """A REAL script: it leaves an artifact, and exits with the code the case wants."""
        p = self.workdir / name
        p.write_text(f"#!/bin/sh\necho ran > {self.workdir / (name + '.log')}\nexit {exit_code}\n")
        p.chmod(p.stat().st_mode | stat.S_IXUSR)
        return str(p)

    def operation(self, steps, **kw):
        kw.setdefault("dept", "eng")
        kw.setdefault("cron", "0 7 * * *")
        kw.setdefault("workdir", str(self.workdir))
        a = self.k.add_operation(kw.pop("title", "check then write"), kw.pop("intent", "check the feed"),
                                 steps=steps, **kw)
        self.k.approve(a["id"])
        plan = self.k.work.plan_for_approval(a["id"])
        return a, plan, self.k.work.instantiate_recurring(plan["id"])

    def both_directions(self, exit_code):
        """The one list: a free script, a branch on failure, and a body behind the branch."""
        a, plan, work = self.operation([
            {"kind": "script", "command": self.check("check.sh", exit_code)},
            {"kind": "branch_one", "depends_on": [0], "on": "failure"},
            {"kind": "agent", "command": "write the report for the empty cases", "depends_on": [1]},
        ])
        kids = self.k.work.children(work["id"])
        self.assertEqual(len(kids), 2, "the script and the body are nodes; the branch is an edge")
        script = next(k for k in kids if "step 1" in k["title"])
        body_node = next(k for k in kids if "step 3" in k["title"])
        return a, plan, work, script, body_node

    def test_the_script_succeeds_and_the_body_is_never_woken(self):
        a, plan, work, script, body_node = self.both_directions(0)
        # the DAG as declared: the script runs free, the body waits behind the branch
        self.assertEqual(script["lane"], "script")
        self.assertEqual(body_node["lane"], "full")
        self.assertEqual(body_node["status"], "blocked")
        self.assertIn(script["id"], self.k.work.needs(body_node["id"]),
                      "the branch is an edge: the body's work waits on the script's")
        self.assertEqual(self.k.work.stages(body_node["id"]), [],
                         "the body's work has not begun while the branch is undecided")
        # the kernel runs the script: a real command, a real artifact, no body
        self.k.run_script()
        self.assertTrue((self.workdir / "check.sh.log").exists(),
                        "the kernel ran the step's own command in the work's workdir")
        self.assertEqual(self.k.work.get(script["id"])["status"], "done")
        # the branch was not taken: the body's work is cancelled, and no body ever ran
        self.assertEqual(self.k.work.get(body_node["id"])["status"], "cancelled")
        self.assertEqual(
            self.k.wconn.execute("SELECT count(*) FROM runs WHERE employee_id IS NOT NULL").fetchone()[0], 0,
            "no body was woken: the kernel ran the script and judged it alone")
        self.assertEqual(self.k.work.get(work["id"])["status"], "done", "the firing settles")

    def test_the_same_script_failing_wakes_the_body_the_branch_declared(self):
        a, plan, work, script, body_node = self.both_directions(1)
        self.k.run_script()
        self.assertTrue((self.workdir / "check.sh.log").exists(), "the script really ran")
        self.assertEqual(self.k.work.get(script["id"])["status"], "failed",
                         "the script failed and the organization can see it")
        # the branch was taken: the body's work opens and its pipeline begins
        self.assertEqual(self.k.work.get(body_node["id"])["status"], "open")
        self.assertEqual([s["stage"] for s in self.k.work.stages(body_node["id"])], ["plan"],
                         "a body-waking step runs the ordinary pipeline, which starts at plan")
        self.assertIsNotNone(self.k.work.latest(body_node["id"], "plan", "ready"),
                             "a body may claim it now -- the branch was taken")
        # and the grade said so before any of it ran
        self.assertEqual(a["grade"], 3, "a shape that can wake a body is floored at G3")

    def test_branch_all_waits_for_every_trigger_and_takes_the_branch_only_when_all_hit(self):
        a, plan, work = self.operation([
            {"kind": "script", "command": self.check("a.sh", 1)},
            {"kind": "script", "command": self.check("b.sh", 1)},
            {"kind": "branch_all", "depends_on": [0, 1], "on": "failure"},
            {"kind": "agent", "command": "write the report", "depends_on": [2]},
        ], title="check both then write")
        kids = self.k.work.children(work["id"])
        first, second, body_node = (next(k for k in kids if f"step {n}" in k["title"]) for n in (1, 2, 4))
        self.assertEqual(body_node["status"], "blocked")
        self.assertEqual(self.k.work.stages(body_node["id"]), [],
                         "branch_all has not decided: one trigger is still running")
        self.k.run_script()                       # the first script fails
        self.assertEqual(self.k.work.get(first["id"])["status"], "failed")
        self.assertEqual(self.k.work.get(body_node["id"])["status"], "blocked",
                         "one trigger ending is not every trigger: the branch waits")
        self.k.run_script()                       # and the second fails too
        self.assertEqual(self.k.work.get(second["id"])["status"], "failed")
        self.assertEqual(self.k.work.get(body_node["id"])["status"], "open",
                         "every trigger hit the outcome: the branch was taken")

    def test_a_branch_that_does_not_hit_is_cancelled_not_kept_waiting(self):
        a, plan, work = self.operation([
            {"kind": "script", "command": self.check("ok.sh", 0)},
            {"kind": "branch_all", "depends_on": [0], "on": "failure"},
            {"kind": "agent", "command": "write the report", "depends_on": [1]},
        ], title="check then maybe write")
        kids = self.k.work.children(work["id"])
        body_node = next(k for k in kids if "step 3" in k["title"])
        self.k.run_script()                       # the script SUCCEEDS
        self.assertEqual(self.k.work.get(body_node["id"])["status"], "cancelled",
                         "a branch that does not hit cancels what waits behind it: nothing runs "
                         "forever in the half-dead state")

    def test_a_step_that_ends_in_its_stop_if_stops_the_steps_after_it(self):
        a, plan, work = self.operation([
            {"kind": "script", "command": self.check("early.sh", 0), "stop_if": "success"},
            {"kind": "script", "command": "echo never", "depends_on": [0]},
        ])
        kids = self.k.work.children(work["id"])
        self.assertEqual(len(kids), 2)
        self.k.run_script()
        self.assertEqual(self.k.work.get(kids[0]["id"])["status"], "done")
        self.assertEqual(self.k.work.get(kids[1]["id"])["status"], "cancelled",
                         "stop_if stopped the DAG rather than let it keep spending")

    def test_the_firing_is_the_dag_not_one_stage(self):
        script = self.check("check.sh", 0)
        a, plan, work = self.operation([
            {"kind": "script", "command": script},
            {"kind": "branch_one", "depends_on": [0], "on": "failure"},
            {"kind": "agent", "command": "write the report", "depends_on": [1]},
        ])
        self.assertEqual([s["stage"] for s in self.k.work.stages(work["id"])],
                         ["plan", "approve"],
                         "the firing's own pipeline is the record; the steps are the work")
        # the kernel-run step carries its OWN command, read by the kernel's own script lane
        step = self.k.work.children(work["id"])[0]
        step_plan = self.k.work.approved_plan(step["id"])
        self.assertEqual(step_plan["output"]["body"]["command"], script,
                         "each step runs its own command, not the operation's")

    def test_the_ordinary_operation_is_unchanged(self):
        """The scope guard: a one-command operation is still one script stage."""
        a = self.k.add_operation("Digest", "summarise the inbox", dept="eng", cron="0 7 * * *",
                                 workdir=str(self.workdir), command="true")
        self.k.approve(a["id"])
        plan = self.k.work.plan_for_approval(a["id"])
        work = self.k.work.instantiate_recurring(plan["id"])
        self.assertEqual([s["stage"] for s in self.k.work.stages(work["id"])], ["plan", "approve", "execute"])
        self.assertEqual(self.k.work.get(work["id"])["lane"], "script")
        self.assertTrue(self.k.run_script())
        self.assertEqual(self.k.work.get(work["id"])["status"], "done")


class StepsThroughTheCLI(KernelCase):
    """The writer a person types: `holon operation add --steps`, a file read the way every
    other text argument is read."""

    def test_the_cli_reads_a_steps_file(self):
        from holon import cli
        steps = [{"kind": "script", "command": "true"}]
        p = self.workdir / "steps.json"
        p.write_text(json.dumps(steps))
        rc = cli.main(["--home", str(self.home.root), "operation", "add", "Digest", "--dept", "eng",
                       "--cron", "0 7 * * *", "--workdir", str(self.workdir), "--steps", f"@{p}",
                       "--intent", "check"])
        self.assertEqual(rc, 0)
        approval = self.k.wconn.execute(
            "SELECT id FROM tasks WHERE stage='approve' AND status='ready' ORDER BY created_at DESC").fetchone()[0]
        plan = self.k.work.plan_for_approval(approval)
        body = self.k.work.output(plan["id"])["body"]
        self.assertEqual(body["operation_steps"], steps,
                         "the operation the CLI wrote carries its steps")

    def test_the_cli_refuses_a_steps_argument_that_is_not_a_list(self):
        from holon import cli
        p = self.workdir / "steps.json"
        p.write_text(json.dumps({"kind": "script", "command": "true"}))
        rc = cli.main(["--home", str(self.home.root), "operation", "add", "Digest", "--dept", "eng",
                       "--cron", "0 7 * * *", "--workdir", str(self.workdir), "--steps", f"@{p}",
                       "--intent", "check"])
        self.assertEqual(rc, 1, "a steps argument that is not a list is refused, not half-read")

    def test_the_cli_refuses_a_steps_file_that_is_not_json(self):
        from holon import cli
        p = self.workdir / "steps.json"
        p.write_text("not json at all")
        rc = cli.main(["--home", str(self.home.root), "operation", "add", "Digest", "--dept", "eng",
                       "--cron", "0 7 * * *", "--workdir", str(self.workdir), "--steps", f"@{p}",
                       "--intent", "check"])
        self.assertEqual(rc, 1)


if __name__ == "__main__":
    unittest.main()
