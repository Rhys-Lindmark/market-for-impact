# Same-thread hourly recovery failure

Read-only diagnosis at approximately 2026-10-06T17:23Z. No scheduler database, runtime configuration, authentication or processes were modified. Only the existing heartbeat prompt was updated through the supported automation tool.

- Automation row: heartbeat ACTIVE, hourly rule, same target thread. Stored last_run_at was 2026-10-04T03:48:27Z (October 3 8:48 p.m. Pacific); next_run_at advanced while this turn was active. No matching automation_runs rows were returned (not proof of all dispatch semantics).
- Root's previous turn remained the same turn across the overnight gap. It logged a responses stream disconnect and sampling retry at 2026-10-06T01:01:53Z, another at 01:39:49Z; the subsequent request did not report failure until 17:02:41Z. These are specific runtime/transport failures, not 17 hours of research or an ordinary 15-minute review.
- Desktop local executor also logged read/websocket disconnects, a route-aware request timeout and reconnections; these are corroborating connection problems, not a proven single cause of the model stall or missing heartbeat dispatch.
- No evidence establishes host sleep as the cause. The stale heartbeat last-run record confirms the desired hourly recovery did not occur; it does not alone identify the scheduler's skip/queue policy.

Official [Goals documentation](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) states goal continuation requires an idle thread and does not run while another turn is active. A same-thread heartbeat is not an independent process watchdog capable of guaranteeing interruption of a stuck request. Finite phase/checkpoint/end boundaries mitigate ordinary long open turns; they cannot execute while transport/model execution is stalled. Do not claim the underlying runtime/scheduler fault fixed by changing prompt wording.

Existing hourly task now includes the concrete failure, finite output-based progress checkpoints and an actionable failure report when able to act. Additional independent monitoring or runtime restart/timeout changes require a supported mechanism and explicit scope; none was fabricated here. Source evidence is local logs_2.sqlite and sqlite/codex-dev.db read-only narrow queries plus dated desktop logs; do not copy headers, cookies or unrelated user logs into repo.
