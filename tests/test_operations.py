"""Guards for the operations upgrade: the grade rename, the step-kind vocabulary,
and the auto-derived complexity floor.

Three things the Chair asked for, each with a guard that fails on the pre-change
tree:

  * `vocab.GRADE_NAMES[0]` is `plain`, not `routine` -- the word the recurring-work
    noun is taking. `routine` as a grade and `routine` as a noun land in the same
    sentence (an operation's lane is chosen by its grade), and one word for two
    claims is a sentence a reader has to guess at.
  * `vocab.STEP_KINDS` exists, carries the branch kinds, and deliberately does not
    carry the loop kinds -- a loop is a second way to repeat work beside a DAG and a
    schedule, and the one construct with no ceiling is the one that spends.
  * `grading.grade_plan` derives its floor from the operation's own shape (how many
    steps, how many of them wake a body) because the cost of work was invisible to
    the grade: a 7-step operation that fires six bodies a day and a one-line script
    graded identically.

The floor's existing contract is unchanged and is guarded beside the new signal:
the planner's proposal can only raise the effective grade, never lower it.
"""

from __future__ import annotations

import unittest

from tests.helpers import KernelCase
from holon.execution import grading


class GradeRename(KernelCase):
    """G0's word takes the recurring-work noun out of the severity scale."""

    def test_g0_is_plain_not_routine(self):
        from holon.core.vocab import GRADE_NAMES
        self.assertEqual(GRADE_NAMES[0], "plain",
                         "G0's word is taken by the work noun; the severity scale needs a word "
                         "that says 'cheap in risk and reach', not 'repeats'")

    def test_the_scale_stays_monotone_in_severity(self):
        from holon.core.vocab import GRADE_NAMES
        names = [GRADE_NAMES[i] for i in range(4)]
        self.assertEqual(names, ["plain", "minor", "significant", "major"])
        self.assertEqual(GRADE_NAMES[4], "critical")

    def test_no_grade_name_names_the_work_noun(self):
        """The collision the rename would otherwise create, stated as a guard: no grade
        name may be the word the recurring-work noun is taking."""
        from holon.core.vocab import GRADE_NAMES
        noun = recurring_work_noun()
        self.assertTrue(noun, "the kernel's recurring-work applier is named")
        self.assertNotIn(noun, set(GRADE_NAMES.values()),
                         f"'{noun}' is the work noun; a grade named after it makes "
                         "'this operation is G0' and 'this operation repeats' one sentence")

    def test_a_printed_grade_says_plain(self):
        from holon.cli import GRADE
        self.assertIn("G0 plain", GRADE[0])


class StepVocabulary(KernelCase):
    """An operation's steps are the vocabulary that makes it more than agent-or-script."""

    def test_step_kinds_exist_and_carry_the_branches(self):
        from holon.core.vocab import STEP_KINDS
        for kind in ("script", "shell", "branch_one", "branch_all", "sleep", "call"):
            self.assertIn(kind, STEP_KINDS, f"'{kind}' earns its place (see the ledger row)")

    def test_the_loop_kinds_are_absent_with_a_reason(self):
        """Loops are out on purpose: a loop repeats work, and the organization already
        repeats work two stricter ways (the task DAG and a schedule). The one construct
        with no ceiling is the one that spends, so it waits for a measurement."""
        from holon.core.vocab import STEP_KINDS
        for absent in ("for_loop", "while_loop"):
            self.assertNotIn(absent, STEP_KINDS)
        self.assertTrue(steps_omission_is_recorded(),
                      "the omission of the loop kinds is recorded in the vocabulary, not silent")

    def test_every_step_kind_is_one_the_kernel_names(self):
        """Law 5: an enumeration's copy is a second place to change one list. The step
        kinds the kernel's own code names must be the vocabulary's, not a restatement.

        The kernel reads the vocabulary, so this guard reads the kernel and proves the
        point: a CAPS name that looks like a step-kind enumeration must be assigned from
        `vocab`. A local `steps` variable is not an enumeration and is not judged."""
        import ast
        import pathlib
        from holon.core import vocab
        pkg = pathlib.Path(__file__).resolve().parents[1] / "holon"
        offenders = []
        for f in pkg.rglob("*.py"):
            if "__pycache__" in str(f):
                continue
            # vocab.py is where the enumeration lives; judging it for reading itself is
            # the guard condemning the one place that is allowed to define it.
            if f.name == "vocab.py":
                continue
            tree = ast.parse(f.read_text())
            for node in ast.walk(tree):
                if not isinstance(node, ast.Assign):
                    continue
                for tgt in node.targets:
                    if not isinstance(tgt, ast.Name):
                        continue
                    name = tgt.id
                    # An enumeration is a module-level CAPS name; a `steps` local is a variable.
                    if name != name.upper() or "STEP" not in name:
                        continue
                    if "KINDS" not in name and "KIND" not in name:
                        continue
                    reads_vocab = any(
                        isinstance(c, ast.Attribute) and isinstance(c.value, ast.Name)
                        and c.value.id == "vocab"
                        for c in ast.walk(node))
                    if not reads_vocab:
                        offenders.append(f"{f.name}: {name} does not read vocab")
        self.assertEqual(offenders, [],
                         "a step-kind enumeration outside vocab.py is a second place to change "
                         "one list; the vocabulary is the only place")
        self.assertIn("branch_one", vocab.STEP_KINDS)


class ComplexityFloor(KernelCase):
    """The grade's missing signal: what the operation costs.

    Measured on the live instance: an agent run spends ~173K input tokens, the 12
    importable revenue operations declare 37.4 agent fires a day, and the grade read
    none of it. A 7-step operation and a one-line script graded identically.
    """

    config = '[grading]\nnovelty_min_verified = 0\n'

    def test_an_operation_of_many_steps_raises_the_floor(self):
        t = self.add(dept="eng", task_class="ops", risk="low")
        steps = [{"kind": "script", "depends_on": []} for _ in range(7)]
        g = grading.grade_plan(self.k.wconn, t, {"kind": "plan", "steps": steps}, self.k.config)
        self.assertGreaterEqual(g["floor"], 2, "a 7-step operation is not G0 work")
        self.assertTrue(any("step" in r for r in g["reasons"]),
                        "the reason names the signal, so a reader can check it")

    def test_an_agent_step_raises_the_floor_above_an_all_script_operation(self):
        t = self.add(dept="eng", task_class="ops", risk="low")
        all_script = grading.grade_plan(self.k.wconn, t,
                                        {"kind": "plan", "steps": [{"kind": "script"}]}, self.k.config)
        with_agent = grading.grade_plan(self.k.wconn, t,
                                        {"kind": "plan", "steps": [{"kind": "script"},
                                                                   {"kind": "agent"}]}, self.k.config)
        self.assertGreater(with_agent["floor"], all_script["floor"],
                           "a step that wakes a body costs what the grade cannot see")

    def test_a_single_script_step_stays_cheap(self):
        """The other half: a one-line script is still G0 work. A floor that only rises
        would grade the whole script lane out of existence."""
        t = self.add(dept="eng", task_class="ops", risk="low")
        g = grading.grade_plan(self.k.wconn, t,
                               {"kind": "plan", "grade": 0, "steps": [{"kind": "script"}]},
                               self.k.config)
        self.assertEqual(g["grade"], 0, "the script lane is not graded out of existence")

    def test_the_planner_still_cannot_grade_past_the_floor(self):
        """The Goodhart guard, unchanged: objective signals set the floor, and a body's
        own proposal can only raise the effective grade."""
        t = self.add(dept="eng", task_class="ops", risk="low")
        steps = [{"kind": "agent"} for _ in range(7)]
        g = grading.grade_plan(self.k.wconn, t,
                               {"kind": "plan", "grade": 0, "steps": steps}, self.k.config)
        self.assertGreater(g["grade"], 0, "a proposal below the floor is raised to it")
        self.assertTrue(any("raised to the floor" in r for r in g["reasons"]))

    def test_no_steps_declared_changes_nothing(self):
        """An operation that declares no steps grades exactly as it did before: the new
        signal is silent on work that does not carry it, so the upgrade is additive."""
        t = self.add(dept="eng", task_class="ops", risk="low")
        with_none = grading.grade_plan(self.k.wconn, t, {"kind": "plan", "grade": 0}, self.k.config)
        self.assertEqual(with_none["grade"], 0)


def recurring_work_noun() -> str:
    """The recurring-work noun, read from the kernel's own source -- so the guard follows the
    rename instead of restating it. `Kernel.__init__` wires one applier per mutation kind, and
    the recurring-work handler is the one this upgrade renames."""
    import inspect
    from holon.execution.service import Kernel
    src = inspect.getsource(Kernel.__init__)
    for noun in ("operation", "routine"):
        if f'appliers["{noun}"]' in src:
            return noun
    return ""


def steps_omission_is_recorded() -> bool:
    """The omission of the loop kinds is written down, not silent: the vocabulary's own
    docstring names why they are absent, so the next agent cannot mistake their absence
    for an oversight and add them without the measurement."""
    from holon.core import vocab
    doc = (getattr(vocab, "STEP_KINDS_DOC", "") or "") + (getattr(vocab, "__doc__", "") or "")
    return "loop" in doc.lower()


if __name__ == "__main__":
    unittest.main()
