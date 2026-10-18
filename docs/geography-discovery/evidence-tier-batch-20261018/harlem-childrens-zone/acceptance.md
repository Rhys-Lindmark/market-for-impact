# Harlem Children's Zone (NYC, in-depth): source and model audit

Auditor: claude-opus-nyc-beta-audit (Claude Opus 5.5), in a separately timed source-audit interval. **This is the same AI model as the author, not an independent second agent.**

## Source checks

- Math +0.283 SD six years later; female teen pregnancy -12.1 points and male incarceration -4.3 points (working-paper abstract): NBER w19581 summary.
- 150/257 lottery sample; +13 points on-time graduation (58% baseline) but no six-year difference; earlier but not more college enrollment; teen pregnancy 17% baseline, about 10 points lower; incarceration 0% versus 4%; no health differences: J-PAL evaluation page. Where the sources differ, the report follows J-PAL's more conservative summary.
- Near Top Tier rating: Social Programs That Work.
- 34,590 served in FY22, 19,638 through HCZ's own programs: FY22 impact report.
- Expenses for HCZ Inc and the charter: ProPublica API.

Corrected in audit: the source link now points to NBER rather than a mirror, and the organization heading now matches the timed-session registry.

## Model checks

- 0.283 × 37.5 × $150 × 1.47 ≈ $2,340 a year gross; half causal; ages 25–59 discounted from age 12. Pass.
- The central cost excludes charter public funding (treated as displacing district per-pupil spending). This is a judgment, and the with-charter scenario ($1.46M per DALY) brackets it.
- Central about $336K per DALY.

## Clarifications

Charter enrollment (1,500) is inferred, not observed. Teen-pregnancy and incarceration effects are real benefits left unvalued, which is conservative.

## Decision

Accepted as an NYC in-depth (beta) report.
