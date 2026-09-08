# AMF / New Incentives: SF and Bay spillover evidence

September 8, 2026. Bounded primary-source review. VTL completed packet preserved. No Site changes or outreach.

## Bottom line for one SF table

Both organizations can appear in the same SF cost-effectiveness table, but their **global price must not occupy the SF-health price column**. The most defensible evidence-based local core is **unquantified; calculation convention Q_SF=0 and no finite USD/10Q**, with an explicit optional tiny-positive scenario. Zero here means no quantified credit, not proof that worldwide disease prevention has exactly zero local consequences. There is no empirical source in this review that identifies the marginal fraction of either charity's health benefit accruing to SF residents. Assigning a small positive central fraction would be an analyst prior, not an empirical estimate. We should not manufacture precision or a ranking between AMF and NI on this dimension.

Recommended display: “Local impact unmeasured; speculative spillover scenarios available.” Keep both rows in-table, and show global results separately in the same row/report. If a single finite speculative row value is required, label the whole local column/scenario as speculative and show the chosen coefficient beside it; do not overwrite the evidence-based core silently.

## Credible physical pathways

### AMF: lower transmission in destinations visited by Bay residents

AMF funds long-lasting insecticidal nets in endemic countries through partners: https://www.againstmalaria.com/Distributions.aspx?MapID=52 . The plausible local-health channel is fewer infections among **SF/Bay residents traveling in places whose transmission is reduced by the marginal distribution**, plus any reduced onward mosquito-mediated local spread. Resident health can occur during travel abroad; it remains in a resident-based SF ledger. A person merely passing through SFO is not an SF resident.

CDC reports roughly 2,000 imported US malaria cases annually, primarily returned travelers; this establishes connectivity, not SF risk or AMF attribution. Primary May 2024 surveillance: https://www.cdc.gov/mmwr/volumes/73/wr/pdfs/mm7318a2-H.pdf . Its 68 cases in three southern border jurisdictions in 2023 are not Bay data and not representative of AMF beneficiary-country travel. Do not divide national imported cases by global malaria cases to get a donor spillover coefficient.

Counterweights: travelers can use prophylaxis and different accommodations; the donor's next net distribution may not overlap their destination. Malaria is not spread by ordinary person-to-person respiratory contact. CDC's 2023 locally acquired investigation identified 10 cases across four states; nine were P. vivax, with several distinct sources, not evidence of an SF chain or the falciparum-heavy marginal net distribution's downstream impact. https://www.cdc.gov/advanced-molecular-detection/php/success-stories/malaria-parasite-2023.html . Population infection reduction among long-term residents is not necessarily the same proportional risk reduction for a short-stay, prophylaxed visitor.

Required formula: Q_SF = sum over funded destination/time cells of [SF-resident susceptible travel person-time × no-gift infection hazard × donor-attributable hazard reduction × locally treated case QALY loss], plus separately bounded onward local infections. Needs destination overlap, visitor baseline/prevention, finite net-effect duration, local case-severity utility and donor attribution. None of these joint inputs is available here. Do not reuse mortality per pediatric infection in endemic countries for a US traveler with prompt care.

### New Incentives: reduced vaccine-preventable infection and importation

Actual program incentivizes routine infant immunization in northern Nigeria; measles is one component, not its entire health benefit: https://www.newincentives.org/ (current program page read September 8, 2026). Credible channel: induced measles vaccination reduces local infection/transmission, which can reduce infection in visiting Bay residents or exported infections that lead to a Bay chain. NI's direct infant health benefit is not itself a US resident benefit. Community transmission externalities require a separate model; cannot turn every additional vaccine into a prevented imported case.

CDC's January 2020–March 2024 US surveillance explicitly connects global measles incidence and importation risk and supports international vaccination. https://www.cdc.gov/mmwr/volumes/73/wr/mm7314a1.htm . This is a real mechanism, but it gives no NI-district-to-SF donor coefficient. Nigeria traveler guidance recommends measles vaccination and malaria prevention: https://wwwnc.cdc.gov/travel/destinations/traveler/none/nigeria . Domestic susceptibility and contact networks determine whether one imported case leads to further cases; vaccinated communities do not behave like a wholly susceptible network.

Direct SF connectivity example: SFDPH's report at https://media.api.sf.gov/documents/SFDPH-Directors-Report-4-20-2026.cleaned.pdf describes an unvaccinated SF infant infected during international travel, recovering at home, with vaccinated household contacts and low public risk. **Source date anomaly:** URL says April 20, 2026; cover prints April 20, 2025, while body discusses 2025 annual declines. Preserve this inconsistency rather than assert a corrected date from inference. It does not identify Nigeria as exposure country. Therefore this source supports the travel mechanism only; it is not NI attribution, an incidence rate, or evidence of an untreated severe outcome.

Required formula: Q_SF = additional vaccine protection × marginal infections averted per protected recipient in the target setting × travel/contact export linkage to SF-resident infections × net local transmission multiplier × local clinical QALY loss. Each term must have compatible denominator and finite horizon. More robustly use a destination-specific transmission model rather than multiplying unrelated averages. Account for routine public immunization in the no-gift baseline. No such linked model was identified.

Other antigens may reduce transmission, but do not award an extra local spillover for each vaccine without disease-specific evidence. Infant BCG's protection against severe childhood TB, for example, is not automatically an adult pulmonary-transmission reduction. No polio-eradication threshold probability is invented.

## Broader development channels: plausible, not currently health-quantifiable

Improved child survival, schooling and household resources can affect later trade, migration, research and economic demand. These are conceivable benefits to Bay residents, not measured local QALYs. An income gain is not health utility; a global-income multiplier cannot simply be assigned to SF by population or GDP share. Decades-long migration and innovation benefits require explicit counterfactuals, residency timing and finite discounting. The net effect could include displacement and environmental harms. No numerical development-to-SF-health credit recommended from the current evidence.

Donor emotional satisfaction, office employment or headquarters location is not a transfer of beneficiaries' health to SF. Opportunity costs belong in a consistent resource/alternative-gift comparison, not an arbitrary negative QALY assignment. Do not include actual overseas beneficiaries twice as both global direct health and a fictitious SF fraction of those same QALYs.

## Transparent optional stress grid, not empirical spillover estimates

If the product requires a tiny indirect-local example, define epsilon as **additional SF-resident health divided by modeled overseas direct QALYs**, not geographic reassignment of beneficiaries. Example grid epsilon_SF = 0, 10^-8, 10^-6, 10^-4. These powers of ten are solely analyst sensitivity coordinates; no source estimates or bounds them, and they must not be called confidence limits or selected because they rank well. Do not choose different epsilons for AMF and NI merely to produce a desired ordering. A Bay multiplier, if desired, is another explicit unsourced coordinate and must be >=SF; do not use population share as measured travel linkage.

For a fixed gift G and accepted direct-overseas health Q_direct:

- scenario Q_SF = epsilon_SF * Q_direct;
- scenario Q_Bay = epsilon_Bay * Q_direct, with epsilon_Bay >= epsilon_SF;
- donor price_SF = 10*G/Q_SF only if Q_SF>0;
- equivalently price_SF = direct-overseas price / epsilon_SF, **only when both use precisely the same gift and direct-health denominator**;
- global-inclusive Q = Q_direct + Q_Bay + any separately defined non-Bay spillovers, not Q_direct + Q_Bay + Q_SF;
- epsilon=0 or nonpositive net health gives null price, not zero dollars or a displayed finite maximum.

Thus epsilon=10^-6 multiplies the overseas direct price by one million, transparently producing a very large local price. This is arithmetic, not evidence that the actual local coefficient is one millionth. Prefer show this as sensitivity beside an unquantified core rather than presenting it as a calibrated best estimate.

Finite exposure rule: restrict infection-generation/importation to the accepted intervention's protection window. Do not create an infinite transmission or innovation tail; any disease aftermath utility must have its own finite duration. A generic epsilon grid cannot establish that schedule and therefore remains a diagnostic, not a fully specified causal CEA. If implemented, carry forward the direct model's finite health schedule as a stated simplifying stress assumption, not a clinical claim about imported cases.

## Integration safeguards / next evidence

1. Keep both organizations in the SF table if requested, without substituting global prices.
2. Use the same gift-cost numerator for direct, Bay and SF columns.
3. Distinguish “zero quantified local credit” from “evidence of no spillover.”
4. Best next data are destination-specific Bay resident travel/infection surveillance linked to the actual marginal funding geography, not more generic global-development arguments.
5. No source supports a finite empirical SF cost-per-QALY for either organization at present. A speculative positive local coefficient is allowed as disclosed analyst sensitivity; it is not newly measured evidence or a local funding opportunity.
