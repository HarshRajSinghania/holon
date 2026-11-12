# Security Policy

## Supported versions

Holon is developed on `main`. Security fixes land on `main` and are released
from it. There are no long-lived release branches yet, so there is no older
version to patch — but there will be, and this table is where that promise
gets written down.

| Version | Supported |
|---|---|
| `main` | ✅ |
| anything older | ❌ — upgrade; it predates the trust boundary |

## Reporting a vulnerability

**Use GitHub's private vulnerability reporting.** On this repository:
**Security → Report a vulnerability**. That opens a private advisory visible
only to the maintainers — a stranger who finds a hole should not have to
publish it to get it fixed.

Please **do not** open a public issue for a security problem.

Include, if you can:

- what the vulnerability lets an attacker do (the impact, not just the crash),
- the exact steps or input that reproduces it,
- the version or commit you tested,
- what you already tried, so the fix can be checked against it.

### What to expect

| stage | what happens |
|---|---|
| acknowledgement | within **3 working days** |
| first assessment (severity, scope) | within **10 working days** |
| fix or a plan for one | communicated before the advisory is published |

If a report turns out not to be a vulnerability, you will be told why and why
it is not being fixed. That is not a brush-off: the reasoning is written down
so the next person can check it.

### What is in scope

Holon runs agents as a **separate operating-system user** behind a broker and
an explicit fence. The boundary is the product, so the following are in scope:

- anything that lets a body reach outside its granted reach, or write where it
  may only read;
- anything that lets a body act as another employee, or as the Chair;
- anything that lets an untrusted prompt or a fetched page steer the kernel
  rather than the agent;
- the isolation plan and the ACLs it writes (a grant that is wider than the
  policy intends, or one that is silently inert);
- the read API and the capability registry — an actor that can read or write
  what it should not;
- the broker: a command that can be smuggled past it.

### What is out of scope

- **Findings that need an already-privileged position.** The kernel runs as the
  operator's user by design; if you are already that user, you do not need a
  vulnerability to act as it. (The agent user is the one that matters.)
- **Denial of service against the operator's own machine** by exhausting the
  operator's own quota.
- **Social engineering of the operator.** The operator is a person; a person
  who is deceived has made a decision, and the fix is in the decision.
- Missing hardening suggestions with no demonstrated impact.
- Reports generated entirely by an automated scanner with no reproduction.

### Safe harbour

Good-faith research is welcome. You may:

- read and run the code on a machine you own,
- make requests to a deployment you own or have written permission to test,
- publish a proof of concept after the advisory is published, or after 90 days
  if the maintainers have not responded.

You will not be pursued for harm to users or data, or for accidental damage,
provided you did not exfiltrate data, access accounts you did not have, or
degrade the service beyond what a normal user's activity would.

If you find something and are unsure whether it is a vulnerability, report it
privately and ask. "Is this a bug?" is not a reason to publish first.

## The trust boundary, for reviewers

The design is in `docs/design/2026-10-13-trust-boundary.md`; the contract is
in `docs/CONTRACT.md`; the rules are in `docs/BYLAWS.md`. The short version:

- every body runs as `holon-agent-<instance>`, never as the operator;
- its reach is the union of what the kernel granted, enforced by POSIX ACLs;
- the first token of every command is resolved and granted, and nothing else
  on the PATH is reachable;
- every write is through the broker, and the policy is compiled into the run;
- a manifest is Chair-owned configuration — an agent proposes, the Chair
  applies.

A change that widens any of those is a security change, and it needs the same
care as the code it touches.
