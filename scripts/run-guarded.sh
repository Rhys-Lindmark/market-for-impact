#!/usr/bin/env bash
# Run a command with a hard memory and time limit on this 16 GB Mac.
# The command and every child it starts share one process group. Their combined
# memory footprint (macOS `top` MEM, which counts compressed pages) is sampled
# about once a second; the whole group is killed when it passes the limit, when
# the time limit expires, and when the command exits, so no child outlives it.
#
#   scripts/run-guarded.sh [--limit-mb 2048] [--timeout 900] -- node --test scripts/x.test.mjs
#
# Defaults can also come from GUARD_LIMIT_MB and GUARD_TIMEOUT_S.
# Exit status is the command's, or 137 when the guard killed it.
set -u
limit_mb=${GUARD_LIMIT_MB:-2048}
timeout_s=${GUARD_TIMEOUT_S:-900}
while [ $# -gt 0 ]; do
  case $1 in
    --limit-mb) limit_mb=$2; shift 2 ;;
    --timeout) timeout_s=$2; shift 2 ;;
    --) shift; break ;;
    *) break ;;
  esac
done
[ $# -gt 0 ] || { echo "usage: $0 [--limit-mb N] [--timeout S] -- command..." >&2; exit 2; }

set -m
"$@" &
pid=$!
set +m  # the child keeps its own group; this only silences job notices
pgid=$pid

group_pids() { ps -axo pid=,pgid= | awk -v g="$pgid" '$2==g{print $1}'; }
group_mem_mb() {
  local args="" p
  for p in $(group_pids); do args="$args -pid $p"; done
  [ -n "$args" ] || { echo 0; return; }
  # shellcheck disable=SC2086
  top -l 1 -stats pid,mem $args 2>/dev/null | awk '
    $1 ~ /^[0-9]+$/ { v=$2; sub(/[+-]$/,"",v); u=substr(v,length(v)); n=v+0;
      if(u=="K")n/=1024; else if(u=="G")n*=1024; else if(u=="B")n/=1048576; s+=n }
    END { printf "%d\n", s }'
}
stop_group() {
  kill -TERM -- "-$pgid" 2>/dev/null
  for _ in 1 2 3 4 5; do [ -z "$(group_pids)" ] && return; sleep 1; done
  kill -KILL -- "-$pgid" 2>/dev/null
}
trap 'stop_group; exit 130' INT TERM HUP

start=$SECONDS
while kill -0 "$pid" 2>/dev/null; do
  mem=$(group_mem_mb)
  if [ "$mem" -gt "$limit_mb" ]; then
    echo "run-guarded: killed after $((SECONDS-start))s, ${mem} MB > ${limit_mb} MB limit: $*" >&2
    stop_group; wait "$pid" 2>/dev/null; exit 137
  fi
  if [ $((SECONDS-start)) -ge "$timeout_s" ]; then
    echo "run-guarded: killed after ${timeout_s}s time limit (${mem} MB): $*" >&2
    stop_group; wait "$pid" 2>/dev/null; exit 137
  fi
  sleep 1
done
wait "$pid"; rc=$?
# Reap children that outlived the main process.
[ -n "$(group_pids)" ] && stop_group
exit $rc
