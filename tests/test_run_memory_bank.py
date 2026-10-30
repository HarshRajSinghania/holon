"""A per-run memory placeholder must be a directory the harness can write to.

Measured live 2026-10-30 on the Chair's instance, the incident the Telegram digest
named: `runs keep failing`. The newest run died in 0.03 s, and its driver.log said the harness
could not load a shared library — which is NOT what it looked like: `harness --version` runs as
the isolated agent user with exit 0, and the ACL grants that user r-x on the library, its
symlinks and every parent. Reproducing the run's real command through the runner showed the
harness does not crash at all — it HANGS (exit 124 at a 120 s kill) printing

    memory-wire: converting the FTS index to detail=none; rebuilding it

The cause: the driver declares `OPERANT_MEMORY_DIR = "{run_memory}"` and the kernel resolves it
to `<run_dir>/memory` — and then never creates that directory. Operant, given a non-existent
memory dir, falls back silently to its `$HERMES_HOME` store, so every run on the instance
shares ONE memory bank. That is the mutual-readability defect
`test_the_kernel_formats_the_per_run_memory_placeholder` already covers on the formatting side,
re-opened on the side it cannot see: the value is correct and the directory does not exist.
The consequence is not only privacy (colleagues' working contexts mutually readable) but
availability, because the shared bank's index rebuild blocks the harness indefinitely and the
stage reads as "runs keep failing".

Run directories on the live instance carry no `memory/` dir at all, which is the check below.
"""

from pathlib import Path

from holon.execution import drivers
from holon.execution.drivers import Driver, driver_env
from tests.helpers import KernelCase


class ThePerRunMemoryBankIsReal(KernelCase):
    config = "[grading]\nnovelty_min_verified = 0\n[autonomy]\nverify_sample_rate = 0\n"

    def _brief(self, run="run_1"):
        run_dir = self.home.root / "execution" / "runtime" / "runs" / run
        run_dir.mkdir(parents=True, exist_ok=True)
        (run_dir / "BRIEF.md").write_text("do the work\n")
        (run_dir / "context.md").write_text("context\n")
        return {"run_id": run, "task_id": "t1", "stage": "execute",
                "brief_md": str(run_dir / "BRIEF.md"),
                "context_md": str(run_dir / "context.md"),
                "result_path": str(run_dir / "result.json"),
                "workdir": "/tmp", "holon": "holon"}

    def _operant(self):
        text = Path(drivers.__file__).resolve().parents[2] / "adapters" / "operant" / "driver.toml"
        home = self.home.root / "adapters" / "operant" / "home"
        return Driver.from_toml(text.read_text().replace("{ohome}", str(home)), "operant")

    def test_the_directory_the_placeholder_names_exists_when_the_harness_starts(self):
        """The half the formatting guard cannot see: `<run_dir>/memory` exists when the harness is
        spawned. Measured on the live instance: zero of the recent runs carried a memory dir, so
        every body silently fell back to the instance's one shared bank.

        The seam is `drivers.run()`, not the helper: a guard that calls `prepare_run_dir` directly
        passes with the call removed from the dispatch path, which is where the defect lived. So
        this drives `run()` and inspects what the harness would have been handed."""
        d = self._operant()
        d.command = "true"          # the harness "runs"; what matters is what run() prepared
        d.stages = ("execute",)
        brief = self._brief()
        run_dir = Path(brief["brief_md"]).parent
        self.assertIn("OPERANT_MEMORY_DIR", d.env, "the driver declares a per-run bank")
        self.assertFalse((run_dir / "memory").exists(), "the bank does not exist beforehand")
        drivers.run(self.home, d, brief)
        bank = driver_env(d, brief)["OPERANT_MEMORY_DIR"]
        self.assertTrue(Path(bank).is_dir(),
                        f"the bank {bank} does not exist when the harness starts: it shares one")

    def test_a_shared_bank_is_not_a_per_run_bank(self):
        """Two runs must not resolve to one bank. This is the privacy half of the same defect:
        a shared store makes colleagues' working contexts mutually readable. Driven through
        `run()` as well, because the helper alone proves nothing about the dispatch."""
        d = self._operant()
        d.command = "true"
        d.stages = ("execute",)
        banks = {}
        for run in ("run_a", "run_b"):
            brief = self._brief(run)
            drivers.run(self.home, d, brief)
            banks[run] = driver_env(d, brief)["OPERANT_MEMORY_DIR"]
        self.assertNotEqual(banks["run_a"], banks["run_b"])
        self.assertEqual(len(set(banks.values())), 2, banks)
        for run, bank in banks.items():
            self.assertTrue(Path(bank).is_dir(), f"{run} got no bank of its own")

    def test_the_bank_is_inside_the_run_directory_and_nowhere_else(self):
        """A bank that resolves outside the run's own directory is a shared store by another
        name, and it outlives the run's retention policy."""
        d = self._operant()
        env = driver_env(d, self._brief())
        bank = Path(env["OPERANT_MEMORY_DIR"])
        run_dir = Path(self._brief()["brief_md"]).parent
        self.assertTrue(run_dir in bank.parents or run_dir == bank.parent,
                        f"{bank} is not inside {run_dir}")


if __name__ == "__main__":
    import unittest
    unittest.main()
