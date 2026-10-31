# Against a task runner

`docs/INTENT.md` states the thesis in one sentence. This page argues it, because the thesis is the
thing an experienced engineer will push back on first: *the organization metaphor is overhead — just
give me a pipeline and a queue.*

The answer is that Holon is not a slower pipeline. It is a pipeline that keeps its own history, and
the difference shows up exactly where a pipeline without history fails.

## The comparison, mechanism by mechanism

| | a task runner with agents | why it breaks | what Holon does instead |
|---|---|---|---|
| the worker | an anonymous session invoked per task | nothing is learned; run 500 is no better than run 1 | an employee with identity, roles, a manager and a memory — `holon hr hire` |
| the work | a task in a queue | a queue cannot express "this needs research first, in another department" | a **holarchy**: a node is a pipeline of stages *and* child work in any department (`docs/INTENT.md`, Work) |
| who may act | whatever the caller can invoke | every limitation is a code path someone forgot to add | a bylaws table mapping role → stage, with task classes narrowing the claim further (`BYLAWS.md` §1) |
| approval | none, or a human on every run | approval either doesn't exist or doesn't scale | graded G0–G4, routed to the lowest approver whose authority **covers that grade** |
| that authority | permanent and human-assigned | the human becomes the bottleneck, or the bot is over-trusted | **earned**: grows with verified results, shrinks on failures (`execution.org.Org.earned_authority_change`) |
| judgment | "did the job exit 0?" | a job that exited 0 and did the wrong thing is a successful failure | a rubric judged by a decision model **before** a verifier is spent (`Kernel.judge`) |
| the gold standard | nothing | each executor reinvents what done looks like | the last verified result of the same job, shown to its executor **and** its judge |
| learning | a person writes a better prompt and commits it | improvement is a human act that doesn't happen at 3am | every stage's learnings consolidate into employee memory and recur to the department (`Memory.consolidate`, `Memory.promote_recurring`) |
| the protocol itself | a prompt in a repo | two people edit it and it silently rots | a **playbook**: a versioned skill, refined from its own evidence, the next version judged (`capabilities.playbooks`) |
| when it breaks | someone reads logs, if they think to | the failure is discovered by a customer | leases expire, a stage returns to the board, and a stage that keeps failing **opens incident work for the IT department** |
| whether it is healthy | "it looks fine" | nobody knows until it isn't | `holon doctor` checks live state on every heartbeat; a failing check opens an incident that reaches the Chair |
| where state lives | in the runner, beside the code | the org cannot be audited, backed up, or moved | `$HOLON_HOME`, never in the repo; `holon backup` covers it |

A task runner with agents answers "run this prompt on that input." Holon answers "who should do this,
what may they touch, what does done look like, who judged it, and what did we learn so the next one
is cheaper." The second question is the one production actually asks.

## The three claims that survive contact with a skeptical reader

**1. It gets measurably better at a job, not just better at a prompt.** A playbook's refinement is a
pipeline step with a guard: judgments per criterion, verifier failures, and judge/verifier
disagreements are the sensors; the actuator is work that rewrites the protocol and rubric. The
refinement's own output is judged like any other work. That is the test a task runner fails by
construction — its "improvement" is a person's manual edit.

**2. It fails loudly rather than silently.** The lanes run cheapest-first (a script the kernel runs,
one fast session for operation work, the full pipeline when it is needed), so an operation job costs one
kernel call. When something is actually wrong, the lease sweep recovers it and the doctor opens
incident work — a failing department is reported, not left waiting (`holon metrics`, `smoke_blocked`).
A quiet system that appears healthy is the failure mode this design is built to prevent.

**3. Its claims are checkable.** Every command declares its actor class, every status change goes
through one function that appends a hash-chained event, one writer owns each database, and the
distribution lints its own artifacts. Most agent systems ask you to trust a demo. This one asks you
to run `holon lint --strict` and read the audit trail.

## Where it is honest about its costs

A skeptical read of the table above should land here, because the costs are real and the docs name
them:

- **Latency on approval.** A graded route means a head or the CEO decides before execution. Work that
  genuinely needs no judgment should have been an operation in the script or fast lane, where no human
  waits.
- **The Chair is still a human.** Reserved approvals, charter changes and the root isolation step are
  the Chair's alone. The system moves fastest for whoever accepts that a few decisions stay
  deliberate.
- **The vocabulary is a real learning curve.** "holarchy," "lane," "playbook" and "seat" mean specific
  things, and every one is bound to a mechanism by the lint that enforces law 3.

The claim is not "the metaphor is free." The claim is that on work with *history* — recurring
operations, a department that improves, an audit trail someone can read — the metaphor is what makes
the improvement possible.

## See also

- `docs/INTENT.md` — the laws this page argues for.
- `docs/architecture/README.md` — the one diagram of the whole system.
- `docs/architecture/the-learning-organization.md` — the loop, end to end.
- `docs/ARCHITECTURE.md` — how the kernel implements all of the above.
