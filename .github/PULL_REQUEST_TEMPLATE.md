## What this changes

<!-- One or two sentences: the behaviour that is different after this merges.
     If it fixes an issue, put "Fixes #123" on its own line at the bottom. -->

## Why

<!-- The problem this solves. A reviewer who reads only this section should
     understand the motivation without opening the diff. -->

## How it was verified

<!-- The check that proves it works, and how you ran it. A new test in
     `tests/`, a command with its output, a before/after. If you did not run
     anything, say so plainly — that is information too. -->

```
# the exact commands, and what they printed
```

## What a reviewer should look at first

<!-- The file and the line where the decision happens. Saves a reviewer the
     first ten minutes of the diff. -->

## Checklist

- [ ] I read `AGENTS.md` and `docs/BYLAWS.md` before changing anything.
- [ ] I did not change a file's **genome** role or delete a record; a decision
      is an amendment with evidence, never a removal.
- [ ] The change has a test, and the suite is green.
- [ ] I did not widen any grant: a scope, a fence, or an ACL change is a
      security change and needs its own review.
- [ ] New public surface is documented in `docs/` and, if it is a capability a
      body can invoke, declared in a unit manifest.
