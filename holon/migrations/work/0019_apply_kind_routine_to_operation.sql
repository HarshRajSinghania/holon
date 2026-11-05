-- 0019: the recurring-work noun reached the DATA, not only the code (2026-11-05).
--
-- The rename (f95eee0, "agentic-os wide: routines are operations") changed the KIND an
-- operation's apply payload carries -- the applier key -- from "routine" to "operation", and
-- registered the handler under the new word. Its own audit asked whether a data migration was
-- needed and answered "no applied migration names `routine` in a view, a constraint or a
-- column -- they are comments only -- and no live row stores it, so the rename needs no data
-- migration".
--
-- That answer was right about the migrations and WRONG about the rows. The audit looked at
-- the schema and did not look at the DATA: a plan's output body is JSON, and its `apply.kind`
-- is a string a JSON document stores. The 26 imported revenue operations on the live instance
-- were filed by the pre-rename code and carry `"kind": "routine"` in their plan bodies; 36 plan
-- outputs in all do.
--
-- The consequence is a live instance where every one of those approvals FAILS with
-- `KeyError: 'routine'` -- the applier registry has "operation" and not "routine" -- so the
-- Chair's approve/reject on the 26 pending gates is unreachable, and each pending gate's
-- approval dies at the applier lookup with a KeyError rather than a refusal a reader can act on.
--
-- So this migration rewrites the rows in place. It is a data repair, not a rename: the plan
-- body is JSON, so the update goes through SQLite's JSON functions where the build has them
-- and through a string replacement where it does not. The whole plan corpus is one table and
-- the value is one key inside one JSON document, so the statement is bounded by the value it
-- matches, not by a scan-and-hope.

UPDATE outputs
   SET body = replace(body, '"kind": "routine"', '"kind": "operation"')
 WHERE kind = 'plan'
   AND body LIKE '%"kind": "routine"%';

-- The same stale word reached the output's own `kind` column for the rows that recorded a
-- routine's plan. A plan's output kind is the STAGE it belongs to ("plan"), not the recurring
-- work's noun, so the column is left alone -- but a plan output filed by the old code can carry
-- the old word in its `apply` block, which the UPDATE above covers.
