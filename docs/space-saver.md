# Space Saver: memory rules for every agent on this Mac

Shared by Claude and Codex. This is the memory part of Codex's Space Saver skill, plus what this repository taught us. The Mac has 16 GB of RAM, and Claude, ChatGPT and Chrome together normally use about 10 GB of it. A single runaway process can take the rest within minutes.

## What went wrong on 2026-10-18

- A full run of `node --test scripts/*.test.mjs` started 7 test files in parallel. Fourteen tests compared the whole geography registry against an old `git show` snapshot with `assert.deepEqual`. The data had changed, so each comparison failed and Node tried to build a diff of two ~20 MB object trees. Six processes reached about 14 GB each, and on a later run three reached 27–35 GB.
- `--max-old-space-size` and `NODE_OPTIONS` did **not** stop this: the processes went far past a 2 GB heap cap.
- Killing a test runner's parent (for example with `timeout`) left its child processes running in the background.
- An earlier crash the same day came from Codex-owned Node processes. That has the same underlying cause: nothing limits a command an agent starts.

## Rules

1. **Run tests, builds and one-off scripts through the watchdog.** `scripts/run-guarded.sh` kills the command and every child it started once their combined memory (including compressed pages) passes the limit, once the time limit runs out, or once the command exits:

   ```bash
   scripts/run-guarded.sh --limit-mb 2048 --timeout 600 -- node --test scripts/some.test.mjs
   ```

   `npm test` already runs through it. It cannot catch children that detach into their own process group, such as some dev servers; stop those yourself.
2. **One heavy job at a time on this machine,** across all chats and both apps. That means one build, one full test run, or one browser automation session. Run independent checks one after another, not side by side.
3. **Never compare whole registries with `assert.deepEqual`.** Use `sameData` from `scripts/lib/same-data.mjs` for anything built from `data/geography-reports.json`, `data/research-effort.json` or a `git show` of them. It applies the same strict check but reports only the first difference.
4. **Check before starting heavy work and after it ends:** `memory_pressure | tail -1`, `sysctl vm.swapusage`, and the largest processes with `ps -axo pid,ppid,rss,etime,command | sort -k3 -nr | head`. Don't start more work if free memory is under 25%, swap is over 4 GB, or any process is over 3 GB and growing.
5. **When something runs away,** stop only the processes your own task started, by their PIDs, and confirm their children are gone too. Never use broad commands like `killall node` or `pkill node`. If another chat or app owns the runaway process, tell the user its PID, command and size rather than killing it.
6. **Leave nothing running.** Before handing back, stop any server, watcher or browser your task started. Check for orphans with `ps -axo pid,ppid,pgid,rss,command | grep -E 'node|workerd'`.

Disk-space rules (reusing checkouts and dependency installs, and deleting only verified disposable files) remain in Codex's Space Saver skill and apply to Claude too.
