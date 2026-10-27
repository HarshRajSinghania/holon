#!/bin/sh
# The overlay's public sync (PERSONAL.md § "Sync with the public repo"), as one command.
# main mirrors the public repo; personal carries the overlay on top of it.
#
#   scripts/sync-public.sh [--no-push]
#   UPSTREAM=/path/to/holon scripts/sync-public.sh --no-push   # a local public checkout, before its push
#
# Universal work reaches personal only through main. Outside OVERLAY, personal must equal main;
# any other difference stops the sync until the commit is upstreamed (cherry-pick, scrub, PR).
set -e
cd "$(dirname "$0")/.."

# The overlay's own files: the ones the public repo does not carry, or carries differently.
#   docs/STATUS.md, docs/RECORDS.md, docs/design/**, docs/PAGE-INDEX.md — the operator's corpus
#   docs/archive/**                              — the overlay's tombstones and their index
#   TODO.md                                      — the overlay's own register
#   PERSONAL.md                                 — the overlay's runbooks
#   scripts/sync-public.sh                      — the sync itself
#   genome.toml, .gitignore                     — the overlay's own map and ignore rules
OVERLAY='^(docs/STATUS\.md|docs/RECORDS\.md|docs/design/.*|docs/PAGE-INDEX\.md|docs/archive/.*|TODO\.md|PERSONAL\.md|scripts/sync-public\.sh|genome\.toml|\.gitignore)$'
UPSTREAM=${UPSTREAM:-public}
PUSH=1; [ "${1:-}" = "--no-push" ] && PUSH=0

[ "$(git branch --show-current)" = personal ] || { echo "run from the personal checkout"; exit 1; }
main_wt=$(git worktree list --porcelain | awk '/^worktree /{w=$2} /^branch refs\/heads\/main$/{print w}')
[ -z "$main_wt" ] || { echo "main is checked out at $main_wt: fast-forward it there"; exit 1; }

if [ -d "$UPSTREAM" ]; then
  git fetch -q "$UPSTREAM" main
  SRC=FETCH_HEAD
else
  git fetch -q "$UPSTREAM" || { echo "fetch failed: is the '$UPSTREAM' remote set?"; exit 1; }
  SRC="$UPSTREAM/main"
fi

# fast-forward main without checking it out: the personal checkout may carry uncommitted overlay work
git merge-base --is-ancestor main "$SRC" || { echo "main has commits $SRC lacks: resolve by hand"; exit 1; }
if [ "$(git rev-parse main)" != "$(git rev-parse "$SRC")" ]; then
  git update-ref -m "sync-public: fast-forward main to $SRC" refs/heads/main "$SRC" "$(git rev-parse main)"
fi
echo "main: $(git log --oneline -1 main)"

git merge --no-edit -m "merge public main (sync-public.sh)" main || {
  echo "conflicts: overlay files keep ours, universal files take main's; then commit and rerun"; exit 1; }
echo "personal: $(git log --oneline -1 personal)"

drift=$(git diff --name-only main personal | grep -vE "$OVERLAY" || true)
if [ -n "$drift" ]; then
  echo "universal drift on personal (upstream these, or restore main's version):"; echo "$drift"; exit 1
fi
echo "invariant: personal equals main outside the overlay"

# the gates, so a broken merge never lands on the branch that runs the instance.
# `|| exit 1`, never `&&`: an AND-list swallows the failure under set -e, and a red gate
# must stop the push.
python3 -m unittest discover -s tests -t . >/dev/null 2>&1 || { echo "tests: FAILED — not pushing"; exit 1; }
echo "tests: OK"
python3 -m holon --home "$(mktemp -d)" lint --strict || { echo "lint: FAILED — not pushing"; exit 1; }
echo "lint: OK"

[ "$PUSH" = 1 ] || { echo "synced, not pushed (--no-push)"; exit 0; }
git push origin main personal && echo "pushed: main personal"
