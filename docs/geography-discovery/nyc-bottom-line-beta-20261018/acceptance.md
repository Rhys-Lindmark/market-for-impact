# Bottom Line (New York City, in-depth): source and model audit

Auditor: claude-opus-nyc-beta-audit (Claude Opus 5.5), in a separately timed source-audit interval. **This is the same AI model as the author, not an independent second agent.** The user directed Claude to complete the full review itself.

## Source checks (all pass)

These figures were string-matched against the extracted text of NBER w33921 (Barr and Castleman, 2025):
- Sample of 2,422 students; classes of 2015 and 2016.
- Degree effects: +7.6 pp within five years (16%); +9.6 pp for the first cohort; 7.4 pp in the Boston area and 7.2 pp in New York City.
- 11 pp higher enrollment at above-median-earnings institutions.
- Costs: $4,161 full and $2,145 Access-only per student; over two points per $1,000; the $15M Ohio grant.

The 55% versus 47% six-year comparison, the Top Tier rating and the eligibility rules come from Arnold Ventures' Social Programs That Work page. The 6,679 students served in 2023 come from the 2023 annual report, and expenses from the ProPublica API.

## Model checks

- One pathway per offered student; the degree probability (0.08) is applied once as a causal factor. Pass.
- Health is zero; college-quality gains are not added on top of degree earnings. Pass.
- The `calculate.mjs` scenarios reproduce the report: central $1,102,254 per better life, about $110K per DALY.

## Clarifications retained

1. The $12,000 earnings premium, its 75% causal share and its 80% non-positional share are unmeasured judgments; the trial's earnings follow-up is pending. Across a $6,000 premium or 50% positional value, the estimate ranges from $176K to $211K per DALY.
2. The new-entrant share (40%) is a judgment; at the trial's cost the estimate is about $85K per DALY.
3. Recent revenue exceeds expenses, so short-term room for more funding is doubtful.
4. An earlier draft cited a 63% versus 53% seven-year figure and described students as first-generation. Both were removed because neither was confirmed in the sources read.

## Decision

Accepted as a New York City in-depth (beta) report. At about $110K per DALY, the central estimate would rank first in the NYC edition, ahead of Parker Family Health Center (about $1.0M). This rests on an assumed rather than measured earnings premium, which the report states prominently.

## Revision audit (deeper research, same day)

Same-model, separately timed audit of the revision requested by the user.

- **Finances:** FY2024 and FY2025 revenue ($23.4M, $20.2M), expenses ($24.5M, $25.8M), deficits (-$1.1M, -$5.6M) and net assets ($33.7M, $27.8M) were read from ProPublica's Form 990 summaries. The earlier "recent surplus" framing is corrected, because the FY2023 surplus followed the 2022 MacKenzie Scott grant (bottomline.org). Pass.
- **Entrants:** The 40% judgment is replaced by a structural derivation, 1 / (1 + 0.5 × 4.5) = 30.8%. The 50% continuation into Success comes from Arnold Ventures; 4.5 average Success years is a judgment within the six-year maximum. The result is $11,985 per entrant on 7,000 students (bottomline.org, about 7,000). The 6,679 figure from 2023 is retained as a cross-check. Pass.
- **Premium:** $12,000 on $35,000 is 34%. That is consistent with observational sheepskin premiums of about 30% (Caplan's notes) and with Zimmerman's 22% earnings gain from marginal four-year admission, where only about half graduate. The causal (0.75) and non-positional (0.8) factors are unchanged judgments. Pass.
- **Result:** central $1,834,752 per better life (about $183K per DALY), replacing $1,102,254 (about $110K). The rise is entirely the higher current cost per entrant. The first review is kept as the `previous-review-20261018` scenario. Bottom Line still ranks first in NYC; the next report is Parker at about $1.0M per DALY.
