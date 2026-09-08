# NEMS HBV re-engagement — source audit and model boundary

Reviewed 2026-09-07; issue #175. Research in progress, not a recommendation.

## Local opportunity

[NEMS Liver Health](https://www.nems.org/programs/liverhealth/) already offers screening, monitoring, indicated treatment and SF FibroScan. [CDA ReLink](https://cdafound.org/relink/grantees/) lists a 12-month NEMS HBV project in progress. An additional gift must be compared with those existing services and committed grant support, not no care. No NEMS-specific grant amount or marginal tranche was verified. The [giving page](https://www.nems.org/support-us/) directs gifts to North East Medical Services Foundation; do not silently equate that recipient with the operating entity or promise a restricted HBV gift.

## Economic benchmark—not a local donor estimate

[Starinieri et al. 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13071230/) models already-diagnosed, initially inactive adult CHB, with ongoing monitoring identifying later treatment eligibility. Table 3 implies 17,394 discounted lifetime incremental QALYs per 100,000 registry patients for navigation. The abstract reports $8,416/QALY, whereas results/Table 3 report $9,025. Combined totals imply 20,247 additional QALYs but the difference row reports 21,110. The stated 37%→55.27% monitoring change is not a 29% relative increase. We retain these discrepancies rather than silently choosing whichever looks favorable.

The model assumes enduring monitoring improvements and 90% annual adherence. Its $90,250/10-QALY navigation benchmark includes healthcare-system costs; it is neither measured NEMS performance nor a one-year donor quote. Do not purchase lifetime benefits with one annual navigator salary.

## Causal evidence limitation

The cited [AASLD 2024 abstract 1236](https://www.aasld.org/sites/default/files/2024-10/1_the_liver_meeting_2024_abstracts.pdf), PDF pp500–501, describes 3,457 NEMS patients with a visit in 2022–23. It reports testing and prescribing, not the intervention effect claimed by the economic paper. The cohort excludes people without visits; two-year testing counts are not annual adherence. No causal pre/post navigation comparison was verified. Treat the economic response as a calibration requiring a large explicit local/source discount, not established causal evidence.

## Proposed inspectable adaptation

Use the published lifetime QALY difference only as a calibrated total per registry person. Scale by the *incremental* local annual monitoring change relative to the published 28.35 percentage points, source/causal reliability and funding additionality. Specify a normalized health-timing distribution and finite funded duration; charge recurring support costs over the same funded years. Explicitly label this a heuristic adaptation, not a recreated Markov simulation. Test timing, duration, local effect, payer displacement, null and harm. Do not count monitoring as medication adherence or apply HCV cure QALYs to HBV.

This approach remains conditional on an unverified linear relationship between monitoring and health, local age/severity mix, continued indicated treatment and support. A full state-transition reconstruction or provider-level outcomes would supersede it. The source inconsistencies and absent causal effect prevent treating the published ICER as our central donor estimate.

## Infant alternative

NEMS Hep B Moms is a real perinatal program. [Jourdain 2018](https://www.nejm.org/doi/full/10.1056/NEJMoa1708131) found 0/147 versus 3/147 infant infections when both groups received prompt vaccine/HBIG. Model only prophylaxis that changes because of the gift. The SF all-newborn birth-dose rate is not the prophylaxis rate among infants of HBV-positive mothers. No entire lifetime credit per referral.

## Implementation and acceptance

Central calibration $1,201,091/10 QALYs; positive scenarios $41.4K–$326M, null/harm possible. Implemented function, data, report/API and ranking; provisional fourth homepage summary supplied. Independent audit reproduced arithmetic and required the clinical-inactive-versus-inactive-record distinction, now explicit. 248 unit tests, lint/build and four phone/tablet checks passed. Existing native workbook Sep7 Research Models A245:E266 preserves formulas; central output matches $1,201,090.5888876051 and normal-zoom rendered header/output are readable. No funding offer verified. Final source review, PR and canonical deployment remain required.

## Original acceptance checklist

- Quantitative scenarios, sensitivity and null/harm tests.
- Independent model review and corrections.
- Dedicated report/API, ranking integration and native spreadsheet.
- Build, mobile/browser checks, coherent PR and exact canonical deployment.

HCV predecessor #174 was accepted as Sites v122 at b28297233fcd4cb05f4de9a2abf1523504935d91: 244 tests and release checks passed; canonical 30-row ascending research, homepage four, report/API and 390px layout verified. This audit does not count NEMS as a completed review.
