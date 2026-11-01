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

import os
import shutil
import unittest
from unittest import mock

from tests.helpers import KernelCase
from holon.cli import EXPORTED_HOLON
from holon.execution import grading
from holon.execution import isolation
from holon.execution.service import Kernel


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


class Rename(KernelCase):
    """The recurring-work noun is `operation`, agentic-os wide.

    Measured before the rename: 5 quoted `"routine"` occurrences are the *kind* (the
    applier key, the apply payload, two output keys, the tools mapping) and four CLI
    subcommands a person types. Every other occurrence is prose. No applied migration
    names `routine` in a view, a constraint or a column -- they are comments only -- and
    no live row stores it, so the rename needs no data migration.

    What is NOT renamed, and why: `docs/design/` records and the regression ledger are
    the record of what was found and when, and tests are cited by the ledger by name.

    The failure mode this file was damaged by while it was written: the rename was applied
    to `tests/` with a word-boundary regex, which rewrote the guards' own assertions -- the
    guard that checks the old noun is gone started checking that it is PRESENT, the helper
    that walks both words walked one word twice, and the ledger guard asserted the new word
    so it could never fail. Each became a tautology that still printed green. That is the
    null-test class this ledger records, produced by the very change it guarded.
    """

    def test_this_files_own_guards_are_not_tautologies(self):
        """A guard that can only pass is not a guard.

        This file was damaged by the very rename it guards: the word-boundary regex applied
        to `tests/` rewrote the guards' own assertions, so the guard checking the old noun
        is gone started checking it is PRESENT, the helper that walks both words walked
        one word twice, and the ledger guard asserted the new word -- three tautologies
        that still printed green. This guard reads the guards' OPERATIVE LINES (the ones
        that name a word in quotes with no assertion around them, i.e. the probes), never
        its own source, so it cannot condemn itself."""
        import pathlib
        lines = pathlib.Path(__file__).read_text().splitlines()
        probes = [ln.strip() for ln in lines
                  if ln.strip().startswith('for noun in') or ln.strip().startswith('if f')]
        joined = "\n".join(probes)
        self.assertIn('("routine"', joined.replace('"operation", ', ''),
                      "the noun helper probes the OLD word at least once")
        self.assertNotIn('("routine", "routine")', joined,
                         "the noun helper does not probe the same word twice -- that is the "
                         "null test, not a guard")
        # the applier guard must deny the OLD key, not the new one. Only a line that
        # IS the assertion is judged, so this guard cannot match its own list comprehension.
        applier = [ln for ln in lines if ln.strip().startswith('self.assertNotIn') and 'appliers' in ln]
        self.assertTrue(applier, "the applier guard still exists")
        self.assertIn("'appliers[\"routine\"]'", applier[0],
                      "the applier guard denies the OLD key")
        # The ledger guard must assert the old word survives. The probe reads the ledger
        # assertion, which spans two lines; the word is on the first. The variable name and
        # both literals are assembled from parts here, so this probe's own line can never
        # be the line it finds -- the self-reference that made the first draft fail.
        _VAR = "led" + "ger"
        _NEW = "oper" + "ation"
        _OLD = "rou" + "tine"
        _ASSERT = "assert" + "In"
        hits = [ln for ln in lines if _ASSERT + "(" in ln and ", " + _VAR in ln]
        self.assertTrue(hits, "the ledger guard still exists")
        for ln in hits:
            self.assertIn('"' + _OLD + '"', ln,
                          "the ledger guard asserts the OLD word survives")
            self.assertNotIn('"' + _NEW + '"', ln,
                             "the ledger guard does not assert the NEW word -- that is the "
                             "tautology this guard was written to catch")

    def test_the_applier_key_is_the_operation(self):
        import inspect
        from holon.execution.service import Kernel
        src = inspect.getsource(Kernel.__init__)
        self.assertIn('appliers["operation"]', src,
                      "the recurring-work handler is wired under the new noun")
        self.assertNotIn('appliers["routine"]', src)

    def test_the_cli_subcommands_are_operations(self):
        from holon.cli import REGISTRY
        names = {" ".join(c.path) for c in REGISTRY}
        for old in ("routine add", "routine fire", "routine import", "routine list"):
            self.assertNotIn(old, names, f"`{old}` is the surface a person types")
        for new in ("operation add", "operation fire", "operation import", "operation list"):
            self.assertIn(new, names, f"`{new}` replaces `{new.replace('operation','routine')}`")

    def test_the_kernel_carries_no_old_noun_as_a_kind(self):
        """The kind is the string a machine reads. Prose keeps its history; a quoted
        `"routine"` in kernel code is a kind the kernel still answers to.

        The new word is deliberately absent from this guard: `"operation"` is now the
        CORRECT kind, so flagging it would condemn the rename it exists to hold."""
        import pathlib
        pkg = pathlib.Path(__file__).resolve().parents[1] / "holon"
        offenders = []
        for f in pkg.rglob("*.py"):
            if "__pycache__" in str(f):
                continue
            for i, line in enumerate(f.read_text().splitlines(), 1):
                if '"routine"' in line or "'routine'" in line:
                    offenders.append(f"{f.name}:{i}")
        self.assertEqual(offenders, [],
                         "a quoted 'routine' in the kernel is a kind it still answers to")

    def test_the_immutable_history_keeps_the_old_word(self):
        """The other half of the guard, and the reason it is not a blanket
        search-and-replace: the ledger row that records this rename names the old word,
        and the design records describe the system as it was found."""
        import pathlib
        repo = pathlib.Path(__file__).resolve().parents[1]
        ledger = (repo / "AGENTS.md").read_text()
        self.assertIn("routine", ledger,
                      "the ledger keeps the word it recorded; rewriting it would destroy "
                      "the audit trail the ledger exists to hold")
        self.assertNotIn("routine add", ledger,
                         "the ledger names the old COMMAND nowhere: a reader told to run "
                         "`holon routine add` would be sent to a command that no longer exists")


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
    the recurring-work handler is the one this upgrade renames.

    Both words are probed on purpose: `operation` is the new noun, `routine` is the old one.
    A guard that looked for only the new word could never fail, which is the null test this
    file was written to avoid."""
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


class ExportedSkillsSurviveTheBoundary(KernelCase):
    """The skill export writes into a directory the trust boundary grants the agent.

    Measured 2026-11-01 on the live instance, executing the outline-plan's G12:
    `holon skill export --to $HOLON_HOME/adapters/operant/home/skills` refused with
    `not allowed: [Errno 13] Permission denied`. The mechanism is not drift --
    `reach()` grants `adapters/operant/home` as a WRITE root for the agent user by
    design (the harness loads its skills from there), so `isolation apply` chowns that
    tree to the agent. `Library.export` then calls `Path.write_text`, which creates the
    file with the DIRECTORY's owner and a default mode. The kernel user is left owning a
    tree it cannot rewrite: 57 paths under the agent user, and the export that keeps the
    harness's skills current can never run again.

    This is the ledger's shared-tree class (2026-10-25: an auto-committer tripped the
    read-only guard) inverted: there the kernel's own writer was refused by the guard;
    here the kernel's own writer is refused by the agent's ownership. The ledger row
    covers the boundary's install side and nothing covers its export side.
    """

    def test_a_pre_export_that_cannot_write_exposes_the_export(self):
        """The exposure test the writer routes on: a directory the kernel's uid cannot write
        is one whose export must not attempt a plain `write_text` (which would be refused
        with Errno 13 and leave the harness on stale skills). Measured live: the operant
        adapter home is granted to the agent user as a write root, so `os.access(dir, W_OK)`
        is False there while the same access is True in a kernel-owned tree."""
        from holon.execution.service import _kernel_owns
        mine = self.tmp / "mine"; mine.mkdir()
        self.assertTrue(_kernel_owns(mine / "SKILL.md"), "a kernel-owned dir is writable")
        # the boundary's own grant: deny this user on the directory, then ask again
        os.chmod(mine, 0o555)  # no write for the owner ourselves
        self.assertFalse(_kernel_owns(mine / "SKILL.md"),
                         "a directory the kernel cannot write must be reported as such")
        os.chmod(mine, 0o755)

    def test_an_exposed_export_routes_the_write_through_the_runner(self):
        """When the destination is not the kernel's, the write goes THROUGH the boundary's
        runner as the agent user -- not through a `write_text` that would be refused. The
        body crosses as an environment name, never inside the command string: the runner runs
        `shell=True`, and a skill body is markdown carrying quotes and backticks."""
        import shlex
        sent = {}

        def fake_run(address, cmd, cwd, env, timeout_s, **kw):
            sent["cmd"] = cmd
            sent["env"] = env
            return (0, "", "")

        dest = self.tmp / "agenthome" / "skills"   # not writable by this uid
        dest.mkdir(parents=True)
        os.chmod(dest, 0o555)
        with mock.patch.object(isolation, "run", fake_run), \
             mock.patch.object(Kernel, "isolation", new_callable=mock.PropertyMock,
                               return_value={"runner": "@holon-runner-test", "agent_user": "agent"}):
            self.k.export_skills(dest, {"holon": EXPORTED_HOLON}, ["holon-executor"])
        self.assertTrue(sent.get("cmd"), "the runner was never used: the write went direct")
        self.assertIn("HOLON_EXPORT_BODY", sent["cmd"],
                      "the body must arrive as a name the runner sets, not as quoted text")
        body = [v for k, v in sent["env"].items() if k == "HOLON_EXPORT_BODY"]
        self.assertEqual(len(body), 1, "exactly one body crosses the boundary")
        self.assertIn("# ", body[0], "the body that crossed is the rendered skill, not a stub")
        self.assertNotIn("`", sent["cmd"],
                         "the command carries no backtick: a skill body's quotes never reach a shell")
        os.chmod(dest, 0o755)

    def test_a_kernel_owned_export_writes_directly(self):
        """The direct path stays direct: a destination the kernel owns is a `write_text`, and
        routing it through the runner would need a live runner for every scratch export."""
        import shlex
        dest = self.tmp / "out"
        with mock.patch.object(isolation, "run",
                               side_effect=AssertionError("a kernel-owned dir routes to the runner")):
            self.k.export_skills(dest, {"holon": EXPORTED_HOLON}, ["holon-executor"])
        self.assertTrue((dest / "holon-executor" / "SKILL.md").is_file(),
                        "the export landed its file")


if __name__ == "__main__":
    unittest.main()
