"""Plan grades: G0 routine · G1 minor · G2 significant · G3 major · G4 critical/irreversible.

effective grade = max(planner's proposed grade, kernel floor). The floor comes only from
objective signals, so an employee cannot grade its way past the Chair (the Goodhart guard);
the Chair can always regrade.
"""

from __future__ import annotations

import fnmatch
import sqlite3
from pathlib import Path

from holon.core.contract import parse_grade
from holon.core.vocab import GRADE_NAMES  # noqa: F401  (re-exported for callers)

RISK_FLOOR = {"low": 0, "normal": 1, "high": 3, "irreversible": 4}
DEFAULTS = {"novelty_min_verified": 3, "default_proposed": 2, "sensitive_paths": []}


def verified_in_class(conn: sqlite3.Connection, task_class: str | None) -> int:
    if not task_class:
        return 0
    return conn.execute(
        "SELECT count(DISTINCT t.parent_id) FROM outputs o JOIN tasks t ON t.id=o.task_id "
        "WHERE o.kind='execute' AND o.verified=1 AND t.task_class=?", (task_class,)).fetchone()[0]


def _complexity_floor(env: dict, floor: int, bump) -> int:
    """The operation's own shape, as an objective grade signal.

    The floor already read risk, reach, artifacts and class novelty -- everything about what the
    work touches. It read nothing about what the work COSTS, so a seven-step operation that wakes
    six bodies a day and a one-line script graded identically. That is the signal this adds, and
    it is the one the Chair's objective (lead generation on a token budget) makes load-bearing.

    Measured on the live instance 2026-10-31: one agent run spends ~173K input tokens; the
    importable revenue operations declare 37.4 agent fires a day. An operation's cost is not a
    detail of its execution, it is a fact about its risk.

    Three rules, cheapest first, so the script lane is untouched:
      * a step that wakes a body raises the floor -- a decision the kernel cannot make for free
      * many steps raise the floor -- the graph a body must get right, not one call
      * a single script step raises nothing -- the lane the organization runs unattended
    """
    if env.get("steps") and isinstance(env.get("steps"), (list, tuple)):
        steps = [s for s in env["steps"] if isinstance(s, dict)]
    else:
        return floor
    if not steps:
        return floor
    agents = sum(1 for s in steps if str(s.get("kind") or "") == "agent")
    branches = sum(1 for s in steps if str(s.get("kind") or "").startswith("branch"))
    if branches and agents:
        bump(3, f"an operation that can escalate from {branches} branch(es) to {agents} agent "
                f"step(s) must be checked, not trusted: floor G3")
        return 3
    if agents:
        bump(2, f"{agents} agent step(s) wake a body (measured ~173K input tokens a run): floor G2")
        return 2
    if len(steps) >= 5:
        bump(2, f"a {len(steps)}-step operation is a graph, not one call: floor G2")
        return 2
    return floor


def grade_plan(conn: sqlite3.Connection, task: dict, env: dict, cfg: dict | None = None,
                 reach: list[str] | None = None, read_only_reach: list[str] | None = None) -> dict:
    """`reach`: the department's writable scope roots ([scope] in holon.toml). Writes there count as
    in bounds; writes beyond the workdir and the reach of a department that has one go to the Chair (G3).
    `read_only_reach`: roots the department may only read (pooled units, U2) — a write into one is
    work for the unit's owner (msg request), floored at G3 with that reason.
    In a `[pilot]` department, anything the floor puts at G3 (outside reach) is the Chair's call:
    floor G4 — the standing rule "pilot work never sends outreach" as a grade floor, not a hope."""
    full = cfg or {}
    cfg = {**DEFAULTS, **(full.get("grading", {}))}
    floor, reasons = RISK_FLOOR.get(task.get("risk") or "normal", 1), []
    reasons.append(f"risk={task.get('risk')}: floor G{floor}")

    def bump(g: int, why: str) -> None:
        nonlocal floor
        if g > floor:
            floor = g
            reasons.append(why)

    if env.get("kind") == "decompose":
        bump(2, "decomposition creates new work across the organization: floor G2")
    if env.get("external_effects"):
        bump(2, f"external effects {env['external_effects'][:3]}: floor G2")
    workdir = Path(task["workdir"]).expanduser().resolve() if task.get("workdir") else None
    roots = [Path(r).expanduser().resolve() for r in reach or []]
    read_roots = [Path(r).expanduser().resolve() for r in read_only_reach or []]
    for w in env.get("writes") or []:
        if isinstance(w, str) and w.startswith("skill:"):
            bump(2, f"changes how the department works ({w}): floor G2")
            continue
        if not isinstance(w, str) or "://" in w:
            continue
        p = Path(w).expanduser()
        if p.is_absolute() and any(p.resolve().is_relative_to(r) for r in read_roots):
            bump(3, f"writes a pooled unit ({w}: work for its owner — msg request): floor G3")
        inside = p.is_absolute() and any(p.resolve().is_relative_to(r) for r in ([workdir] if workdir else []) + roots)
        if p.is_absolute() and not inside:
            if roots:
                bump(3, f"writes outside the department's scope ({w}): floor G3")
            else:
                bump(2, f"writes outside the task workdir ({w}): floor G2")
        for pattern in cfg["sensitive_paths"]:
            if fnmatch.fnmatch(str(p), pattern) or fnmatch.fnmatch(w, pattern):
                bump(3, f"writes a sensitive path ({w} ~ {pattern}): floor G3")
    # `artifacts` is the durable record a result leaves behind: a pointer outside the
    # workdir and the reach names something the organization cannot get back, so it raises
    # the floor exactly as a write does. `writes` had this since the trust boundary was
    # built; `artifacts` had no reader at all (A6), so a result claiming a durable artifact
    # beyond its department graded as routine.
    for a in env.get("artifacts") or []:
        if not isinstance(a, str) or "://" in a:
            continue
        p = Path(a).expanduser()
        if not p.is_absolute():
            continue
        if any(p.resolve().is_relative_to(r) for r in read_roots):
            bump(3, f"leaves an artifact in a pooled unit ({a}: work for its owner — msg request): floor G3")
        inside = any(p.resolve().is_relative_to(r) for r in ([workdir] if workdir else []) + roots)
        if not inside:
            bump(2 if not roots else 3, f"leaves an artifact outside the task workdir ({a}): floor G2")
    if task.get("task_class") and verified_in_class(conn, task["task_class"]) < int(cfg["novelty_min_verified"]):
        bump(2, f"task class '{task['task_class']}' has fewer than {cfg['novelty_min_verified']} verified "
                "successes (novel work): floor G2")
    elif not task.get("task_class"):
        bump(2, "unclassified task (no track record to trust): floor G2")
    pilot = (full.get("pilot") or {}).get("depts") or []
    if pilot and floor >= 3 and task.get("dept_id"):
        r = conn.execute("SELECT slug FROM departments WHERE id=?", (task["dept_id"],)).fetchone()
        if r and r["slug"] in pilot:
            bump(4, f"pilot department '{r['slug']}': outside-reach (G3) is the Chair's call (G4)")
    floor = _complexity_floor(env, floor, bump)
    proposed = parse_grade(env.get("grade"))
    effective = max(floor, proposed if proposed is not None else int(cfg["default_proposed"]))
    if proposed is not None and proposed < floor:
        reasons.append(f"planner proposed G{proposed}, raised to the floor")
    return {"proposed": proposed, "floor": floor, "grade": effective, "reasons": reasons}
