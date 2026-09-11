# ReCARES v2 independent audit

Decision: **ACCEPT for transparent exploratory publication; HOLD any giving recommendation.** No material arithmetic, denominator or source-interpretation error found in the reviewed v2 package. Publication acceptance is not empirical validation of its priors or evidence that a donor can buy the modeled throughput.

Actual audit start 2026-09-11 00:46:22 UTC; evidence/calculation checks completed 00:47:02 UTC. Root-confirmed dispatch gpt-6-astra / low; user label Astra Lite. Read-only source/model audit, no Site edits or outreach. Token-saver applied. Prior authoring time is not included.

## Independently checked

- Read handoff, complete portable model, report Markdown and JSON, source ledger and test implementation. Read retained decoded FY2024 Form 990-EZ primary filing directly; the live ProPublica filing URL returned cache miss, so this is independent inspection of retained source, not independent refetch provenance.
- Filing lines 17/21/22/27 confirm total expense **$111,205**, net assets **$188,533**, cash/savings/investments **$176,715**. Part III confirms program expense **$103,400**, over **42,000 items**, **4,521 donors**, and more than **9,770 people/recipients**. Repeated narrative is the same activity, not additive output. V2 correctly charges full expense and describes 9,770 as a conservative reported recipient-equivalent denominator of unknown uniqueness.
- Independently opened current official [recipient instructions](https://www.recares.org/receive/): first-come-first-served, no reservation, inventory/capacity constraints, 5 SF/4 Oakland/3 Marin weekly hours; no medical advice or guaranteed item condition. These establish current operations, not successful safe use or marginal cash capacity.
- Current [giving page](https://www.recares.org/financial-donations/) confirms checks payable to The ReCARES Network, Oakland address, and Ukraine-aid photo caption. This supports a real whole-organization check route and geographic uncertainty, not a measured overseas share. V2 does not derive residence from site hours/photos.
- Current [intake form](https://www.recares.org/liability/) distinguishes equipment expense/noncoverage, insurance delay and environmental preference. It also permits collection for family/clients/agencies. It publishes no reason-frequency, uniqueness or outcome data. V2 correctly treats alternative access and deduplication as unknown rather than empirical probabilities.
- [WHO guideline](https://www.who.int/publications/i/item/9789240074521/) confirms individualized assessment, fitting, training and follow-up matter. It supplies no ReCARES coefficient. The report does not present its .05/.03/.005 utilities as measured effects. Secondary reviews are used as caution, not numerical anchors; I did not independently re-audit every paper because no scalar is extracted from them.

## Arithmetic and artifact parity

Executed the unchanged model in memory, not the provided test that overwrites its saved output. Compared computed weighted object with saved results: exact deep equality. Independently reconstructed the weighted Bay formula from all scenarios:

`sum(weight × 10000 × 9770 / 111205 × throughput × uniqueFraction × [sum(mixShare × unmet × safeUse × utility × years) − harmPerUnique] × bayShare)`

Independent Bay QALYs **0.5378938820758958**, model **0.537893882075896**. Weighted total **0.5525747446157998**, SF **0.20533953965649032**. Ratios: total **$180,970.99**, Bay **$185,910.28**, SF **$486,998.27** per 10 QALYs. Central Bay **0.775843**, **$128,892**. Markdown/JSON headlines, summaries and central equation agree.

Favorable scenario has 5% weight and supplies **69.2831%** of expected net Bay QALYs; its removal and renormalization yields **$574,975.26**. This is conspicuously disclosed, not buried. Half the prior mass is null/harm; costs remain in those cases. The ratio uses cost divided by signed expected health, not an average of positive ratios.

Mutually exclusive needs groups sum to one. Deduplication precedes device-mix allocation. Repeat supply is represented by finite effective duration, not extra people. Safe-use and alternative-access filters apply to benefit; harms apply independently to every modeled additional unique recipient, including the adverse zero-benefit scenario. No lifetime, caregiver, retail-value or avoided-admission bonus is added. All durations are below one year. This is coherent bookkeeping, not proof that the numerical priors are correct.

Zero gift produces zero health and null ratio; a $100k gift is rejected. $10k is about 9% of annual expense, not negligible scale, and report flags this. Complete societal resources and verified marginal offer remain null. Extra-resource scenarios are labeled stress tests, not valued opportunity costs. Cash balance/expense ratio about 1.59 years is correct and restrictions are not inferred.

## Conditions for faithful integration; not requests to retune

1. Use the **signed weighted Bay $185,910** field for a Bay-primary ranking, not central $128,892, total $180,971, SF $486,998 or favorable $13,417. Keep exploratory/unverified-offer labels visible.
2. Preserve access to the model and full scenario inputs. Markdown has complete matrices; report JSON gives ranges and scenario results but does not repeat every matrix. Linking the model/results prevents the rendered report from hiding the joint assumptions behind its favorable tail.
3. Treat “weights specified before outputs” as **author-attested provenance**. Static model order/comment plus handoff cannot independently prove chronology; I have no pre-evaluation timestamped snapshot. No numerical evidence of retuning was found, but independent audit must not certify unobserved sequencing. If published as an audited fact, qualify it as author-reported or retain the prior snapshot.
4. No measured recipient residence fraction exists. Weighted net Bay/total share 97.34% is a signed-mixture result, not an observed 97.34% beneficiary share. Avoid presenting it as demographic data.

## Nonblocking technical hardening

The default fixed-input run is finite and correct. If exposing arbitrary inputs, add explicit finite checks for paymentFeeUsd, totalExpenseUsd, reportedRecipientEquivalents and maxModeledGiftUsd; current comparisons can let NaN/Infinity through. Keep the $10k policy cap immutable or validate it rather than relying on caller-supplied max. This does not invalidate fixed current outputs and should not trigger any health-prior change.

Giving remains HOLD: no dated small marginal plan, restrictions ledger, recipient dedup/device mix, counterfactual-access frequencies or safe-use follow-up. Real lean historical distribution merits a transparent exploratory report under root's stated standard, not a claim of a verified high-return donation.
