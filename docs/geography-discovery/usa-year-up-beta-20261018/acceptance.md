# Year Up United (USA, in-depth) — source and model audit

Auditor: claude-opus-usa-beta-audit (Claude Opus 5.5), in a separately timed source-audit interval. **This is the same AI model as the author, not an independent second agent.** Readers should weigh it accordingly. The user directed Claude to complete the full review itself.

## Source checks (all pass)

Every number in `report.json` was string-matched against the extracted text of Abt OPRE Report 2022-77:
- Annual earnings impacts $5,222, $7,011, $7,581, $7,789, $8,076 and $8,251 (years 2-7).
- Cost per participant $28,280; net cost to society $23,135; employer share $16,118 and philanthropy share $9,960.
- Participant accounts: earnings +$30,056; taxes $5,409 + $325 + $1,622 + $968 (= $8,324); public benefits $3,903; nonmarket time $4,135; fringe $12,473; total $30,661.
- Sample 2,544; personal-income impact $5,374.

The Form 990 expenses come from the ProPublica API (EIN 04-3534407).

## Model checks

- Net welfare share: (30,056 - 8,324 - 3,903 - 391) / 30,056 = 0.580; also subtracting nonmarket time gives 0.443. The central 0.5 lies between the two. Pass.
- Discounting starts year 2 at a one-year delay; the unobserved pathway starts at year 8 (delay 7). There is no double discounting. Pass.
- Health set to zero, matching the trial's null results on self-assessed health and insurance. There is no double counting with income. Pass.
- Year 1 is omitted: lost earnings (-$5,778) are roughly offset by stipends ($6,885 to $7,142), so omitting it is slightly conservative. Pass.
- The `calculate.mjs` scenarios reproduce the report: central $1,879,881 per better life (about $188K per DALY).

## Clarifications retained in the report

1. The participant count (4,000) is a judgment from secondary sources. At 3,769, cost rises about 6%, to about $1.99M per better life.
2. Transfer (0.6) and displacement (0.85) are judgments. The PTC null result and the larger, changed organization justify a discount, but its size is not measured.
3. The philanthropy-share scenario ($524K per better life) is plausible but unverified: it assumes added philanthropy creates added employer internship demand.
4. Research ran over the 15-minute in-depth budget: about 3.7 author research minutes plus 14.6 modeling and drafting minutes, before this audit. The overrun is disclosed rather than trimmed.

## Decision

Accepted for publication as a USA in-depth (beta) report with the clarifications above. The central estimate does not displace the current USA top four: Surgery on Sunday, the fourth-ranked, is about $124K per DALY, against about $188K for Year Up.
