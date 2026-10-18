# Complete alternating featured-card images

Filled image gaps for Chicago Recovery Alliance, Tri City Health Partnership, Saga Education, Bottom Line, Harm Reduction Action Center, Crisis Intervention of Houston, Christ Clinic, and Kids and Car Safety. All eight assets come from the organizations' own sites, are visually inspected and locally optimized (about 351 KiB combined). Sources and accessible descriptions remain in `data/edition-highlights.json`; no visible captions added. Reproduction: guarded execution of `scripts/fetch-featured-images-20261018.mjs`.

Every regional card always retains its figure and two-column layout. A clearly labeled city illustration is the fallback for future shortlist changes without an assigned photo. Existing alternating desktop order and mobile image-first stacking are unchanged.

Six focused rendering/card checks pass, covering all 28 current regional picks plus the existing SF figure and shared responsive CSS. All 11 current remote regional image URLs return HTTP 200 and image content types. No analytical data or rankings changed.

Space Saver: isolated source-only worktree because the prior checkout is in use on a separate research branch. Compatible dependencies reused read-only via symlink; no install/build/server. Baseline: 48% system memory free, 346 MiB swap, largest process about 817 MiB RSS, 32 GiB disk available. Tests and downloads sequential under 2 GiB watchdog. Temporary worktree removed after successful publication; no persistent task-owned processes.
