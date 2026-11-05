"""The organization's vocabulary: every enumeration Holon uses, defined once.

Code imports these; SQL CHECK constraints, CLI choices, JSON Schemas and documentation tables
are generated from or linted against them (`holon lint`, pack SCHEMA). Never copy a list.
"""

from __future__ import annotations

# ── the bylaws: six roles, and the pipeline stage each one performs ─────────
ROLES = ("head", "researcher", "planner", "executor", "verifier", "steward")

# A stage is one unit of work done by one role. A work node's pipeline is a chain of stages.
STAGES = ("research", "shape", "plan", "approve", "execute", "verify", "retro")
STAGE_ROLE = {"research": "researcher", "shape": "head", "plan": "planner", "approve": "head",
              "execute": "executor", "verify": "verifier", "retro": "steward"}
ROLE_STAGES = {r: tuple(s for s in STAGES if STAGE_ROLE[s] == r) for r in ROLES}
# observe = may read anything, must change nothing outside Holon's records; act = changes the world
POSTURE = {s: ("act" if s == "execute" else "observe") for s in STAGES}
LEASE_S = {"research": 1800, "shape": 900, "plan": 1800, "approve": 900, "execute": 3600, "verify": 1200,
           "retro": 1200}

# ── nodes ────────────────────────────────────────────────────────────────
# a work node has no stage; it holds stages (its pipeline) and/or child work nodes
WORK_STATUSES = ("blocked", "open", "waiting", "needs_input", "done", "failed", "cancelled")
STAGE_STATUSES = ("ready", "claimed", "done", "failed", "cancelled")
TERMINAL = ("done", "failed", "cancelled")
SOURCES = ("chair", "agent", "audit", "schedule", "kernel", "intake")
RISKS = ("low", "normal", "high", "irreversible")
GRADE_NAMES = {0: "plain", 1: "minor", 2: "significant", 3: "major", 4: "critical"}
PRIORITIES = (0, 1, 2, 3, 4)
# how a piece of work is run, cheapest first: the kernel runs an approved command (script); one agent
# session plans and acts on plain (G0) work (fast); the full pipeline of separate stages (full)
LANES = ("script", "fast", "full")

# ── an operation's steps ───────────────────────────────────────────────────
# An operation is one unit of work that repeats: a job the organization runs on a clock or on a
# trigger. Its steps are the vocabulary that makes it more than "agent or script", because a
# revenue operation is mostly cheap decisions with one expensive part.
#
# Measured on the live instance, 2026-10-31: an agent run spends ~173K input tokens, and the
# importable revenue operations declare 37.4 agent fires a day (~13M tokens/day) against 5
# script-only operations that cost nothing. A `branch_one` is the construct that closes that gap:
# run the free script first, and wake a body only on the days the script came back empty.
#
# The loop kinds (for_loop, while_loop) are ABSENT ON PURPOSE, and the guard
# `tests/test_operations.py` holds them out. A loop is a second way to repeat work beside two the
# organization already has and polices: the task DAG (`task_needs`: a node is ready only when
# everything it needs is done) and a schedule (`0 6 * * *`). It is also the one step kind with no
# ceiling, and the ceiling is where the cost lives. They wait for a measurement from a real run --
# specifically, an operation that must walk a variable-length list and proves slower or noisier as
# N stages than as one looping step.
#
# WHAT EACH KIND MEANS, because the DAG dispatches on it (work.materialize_steps):
#   script      the kernel runs `command` in the script lane: free, no body
#   shell       the kernel runs `command` as a shell line: free, no body
#   call        the kernel calls another operation by name: free, no body
#   sleep       the kernel waits `seconds`: free, no body
#   agent       a BODY is woken to do this step: the cost the organization prices
#   branch_one  a conditional edge: it runs its dependants only when exactly one trigger ended
#               in the branch's outcome (`on`, default `failure`)
#   branch_all  a conditional edge: it runs its dependants only when every trigger ended in the
#               branch's outcome (`on`, default `failure`)
#
# `agent` was ADDED on 2026-11-05, and the reason is a defect this file's own consumers carried:
# `grading._complexity_floor` priced `kind == "agent"` (a step that wakes a body raises the floor)
# and `startswith("branch")` (an operation that escalates from a branch to a body is G3) -- but
# "agent" was NOT in this tuple, and `contract.step_problems` refuses any kind that is not. So the
# two rules that price an escalation were unreachable: an operation that runs a free script and wakes
# a body only when the script came back empty priced as FREE. The vocabulary and the grader disagreed
# about the same list, and the grader was the one nobody could see. One list, one meaning.
STEP_KINDS = ("script", "shell", "branch_one", "branch_all", "sleep", "call", "agent")
# How the kinds split by WHO runs them -- the DAG dispatches on this, so it lives beside the
# vocabulary it splits (and a guard proves the split covers every kind).
STEP_KINDS_KERNEL = ("script", "shell", "call", "sleep")   # the kernel runs it: no body, no tokens
STEP_KINDS_BODY = ("agent",)                               # a body is woken: the cost the grade prices
STEP_KINDS_BRANCH = ("branch_one", "branch_all")           # a conditional edge, not a node
STEP_KINDS_DOC = "the loop kinds (for_loop, while_loop) are absent on purpose: a loop repeats work, " \
                 "the DAG and a schedule already do, and a step with no ceiling is the one that spends"

# The verbs that reach people outside the organization: the kernel names them so it can decide
# outside-reach from a job's own words, without asking a decision model that may be off, rate-limited
# or down. A job whose title or intent names one of these is held at G3 (and G4 in a pilot
# department) whatever the model says. It is a floor, not a ceiling: the model can still hold a job
# whose words name no verb.
OUTSIDE_REACH_VERBS = (
    "apply", "applications", "blitz", "cold-email", "cold-outreach", "comment", "dm", "email",
    "emailing", "followup", "follow-up", "invoice", "mail", "message", "messageing", "order",
    "outreach", "post", "post-job", "posting", "publish", "replies", "reply", "send", "sending",
    "submit", "tweet",
)

# stage outcomes (tasks.outcome on a finished stage)
OUTCOMES = {
    "research": ("mapped",),
    "shape": ("accept", "redirect", "cancel"),
    "plan": ("plan", "decompose", "needs_input"),
    "approve": ("approve", "reject"),
    "execute": ("success", "partial", "failure", "noop"),
    "verify": ("pass", "fail"),
    "retro": ("done",),
}

# ── runs ─────────────────────────────────────────────────────────────────
RUN_STATUSES = ("running", "succeeded", "failed", "timeout", "abandoned")

# ── people and authority ─────────────────────────────────────────────────
EMPLOYEE_STATUSES = ("probation", "active", "paused", "retired")
CHAIR = "chair"
EXECUTIVE = "executive"
# who may run a command (the command registry declares one per command; R3 enforces it)
ACTOR_CLASSES = ("chair", "employee", "intake", "any", "kernel")

# ── memory ───────────────────────────────────────────────────────────────
MEMORY_KINDS = ("fact", "decision", "constraint", "preference", "lesson", "open_question", "glossary", "artifact")
STEERING_KINDS = ("constraint", "decision", "preference")
PERSONAL_KINDS = ("lesson", "preference")
CONFIDENCE = ("low", "medium", "high")

# ── messages and schedules ───────────────────────────────────────────────
MESSAGE_KINDS = ("dm", "channel", "request", "question", "answer", "proposal")
SCHEDULE_KINDS = ("wake", "recurring")

# ── skills ───────────────────────────────────────────────────────────────
SKILL_KINDS = ("protocol", "role", "operation", "playbook")
