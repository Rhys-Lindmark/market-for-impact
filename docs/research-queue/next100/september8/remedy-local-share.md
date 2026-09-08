# Remedy: proposed SF/Bay allocation for the national general-gift model

September 8, 2026. Research-only proposed geography extension; national clinical, cost and person-time assumptions unchanged. This supplies a best-guess comparison input, not a verified local donor offer or shipment share.

## Proposed comparison result

Use **0.5% SF and 2% Bay-including-SF shares of the national model's marginal health**, with deliberately broad lower/higher and zero-local stresses. Applying these to the accepted central national 1.3129534 QALYs per $10,000 gives:

| Geography | Central Q per $10K gift | Donor USD / 10 Q | Gross associated-resource USD / 10 Q |
|---|---:|---:|---:|
| Overall national | 1.3129534 | $76,164 | $116,785 |
| SF | .00656477 | **$15.23 million** | $23.36 million |
| Bay including SF | .02625907 | **$3.81 million** | $5.84 million |

Suggested short row label: **“$15.2M / 10 SF QALYs — very uncertain local-share prior.”** Keep the overall result separately labeled; never put the national $76K in an SF-comparison column. All ratios retain the entire gift in the numerator. SF is nested in Bay, which is nested in national health; do not add them.

## Primary footprint evidence: what is and is not verified

1. [DHCS current product page](https://www.dhcs.ca.gov/individuals/naloxone-distribution-project/products-available-through-the-ndp-2/) explicitly identifies Remedy as the California NDP partner for 0.4mg/ml intramuscular naloxone. The same page supplies nasal products from other manufacturers. This establishes a real statewide route and public substitute—not Remedy's SF share, exclusive supply or an unfunded injectable gap. Undated current page, retrieved September 8, 2026.

2. [The Center at Sierra Health Foundation's SFDUU account](https://www.shfcenter.org/stories/san-francisco-drug-users-union/) identifies a San Francisco County partner distributing harm-reduction supplies. Its photograph's primary caption identifies a Remedy poster. This is a visible local connection, **not verification of a current supply contract, dose volume, financing source or beneficiary residence**. Do not upgrade a poster into a quantitative partnership claim. Undated current page, retrieved September 8, 2026.

3. [Remedy's current website](https://remedyallianceftp.org/) confirms its community-program supply mission and EIN 87-3486445; it now says the public site has been pared down. No public local shipment ledger was found. Existing national evidence remains the accepted model's baseline. A Berkeley address or California warehouse cannot determine marginal beneficiary residence. Undated current page, retrieved September 8, 2026.

4. [SFDPH April 23, 2024 primary slides](https://media.api.sf.gov/documents/MHSF_IWG_Meeting_Slides_April_23_2024_PDF.pdf) report over 138,000 naloxone doses distributed by DPH and DOPE in 2023. This is dated baseline evidence, not the 2026 flow, not all Remedy stock and not 138,000 unique recipients. Combined with today's NDP, it supports substantial existing local provision, while not proving saturation or zero residual need.

Historical secondary reporting names DOPE as an affiliate, but I do not rely on that as a newly verified current primary supply contract. The primary poster and statewide payer record are weaker but accurately bounded evidence. Existing SFDUU/DOPE/SFAF overlap research reinforces a common outcome ledger; no duplicate organization or independent reversal benefit is created here.

## Burden: useful scale, invalid direct allocation denominator

[SF OCME's March 3, 2026 report](https://media.api.sf.gov/documents/2025_OCME_Overdose_Report_deddIqv.pdf), PDF pp.1 and 3, reports **625 accidental overdose deaths in the city during calendar 2025**. It distinguishes death location, fixed-address information and unknown/no-fixed-address status. It explicitly says fixed address is not a legal-domicile determination. Therefore 625 is not a count of SF-resident opioid deaths, nor a count of deaths preventable by additional naloxone. Drug categories overlap.

[CDC NCHS Data Brief 549, January 2026](https://www.cdc.gov/nchs/products/databriefs/db549.htm) reports **79,384 US drug-overdose deaths in calendar 2024**, based on final mortality data. The years and definitions differ from OCME: national all-intent drug-overdose deaths versus SF accidental deaths located in the city. The two figures give only an order-of-magnitude observation that SF's burden is around one percent of a national burden; **do not divide them to produce an asserted matched SF-resident share**. Naloxone acts on opioid toxicity, not every drug death, and marginal witness access is not proportional to observed deaths.

No harmonized nine-county Bay overdose denominator was established in this bounded pass. The Bay prior below is consequently weaker than the SF scale check. It is not presented as an official Bay burden percentage. Declining national deaths or SF annual changes are not attributed to Remedy.

## Why these priors, and what they mean

**Central SF .005:** a rounded sub-one-percent national marginal-health share seems more defensible than either assigning zero merely for lack of a ledger or treating an SF connection as a large national share. SF has a high local overdose burden and a plausible upstream route, but existing public and peer supply reduce the likelihood that an ordinary national gift disproportionately changes SF rescue access. This is an analyst synthesis, not a statistical estimate or arithmetic conversion of mortality.

**Central Bay .02 including SF:** allow additional reach in Alameda/Contra Costa and other nine-county Bay communities around the California network, without assuming headquarters determines customers. The implied rest-of-Bay share is .015. The four-to-one Bay/SF relationship is a broad geographic judgment—not measured shipments, partner counts, residence or relative mortality. It could be substantially wrong.

These are **shares of marginal net clinical health before independently localized grant harms**, not raw shipment fractions. They integrate uncertainty about destination, recipient residence, clinically relevant access and how local funding substitution compares with the national average. National funding additionality remains .40. **Do not also multiply an extra local funding-discount factor** without replacing/rederiving these health-share priors; that would double-discount the same local substitution concern. Do not infer that .5% of stock goes to SF.

A more data-rich implementation would model regional shipment, reach, rescue and financing parameters separately. Until then, this direct health allocation is transparent and deliberately broad. It preserves the national total by putting remaining modeled health outside the Bay; it is not a newly estimated local effect added to the national effect.

## Proposed machine inputs and stresses

```json
{
  "version": "remedy-local-health-share-prior-v1",
  "asOf": "2026-09-08",
  "estimand": "Share of national marginal clinical health by beneficiary residence, not shipments",
  "central": { "sf": 0.005, "bayIncludingSf": 0.02 },
  "lowerLocalStress": { "sf": 0.0005, "bayIncludingSf": 0.002 },
  "higherLocalStress": { "sf": 0.02, "bayIncludingSf": 0.08 },
  "noSfBenefit": { "sf": 0, "bayIncludingSf": 0.02 },
  "noBayBenefit": { "sf": 0, "bayIncludingSf": 0 },
  "measuredShare": false,
  "addExtraLocalAdditionalityMultiplier": false
}
```

Holding national central health fixed, lower-local shares give **$152.3M SF / $38.1M Bay** per 10 Q; higher-local shares give **$3.81M SF / $952K Bay**. These are geography-only stress combinations, not confidence bounds or hard maxima. National clinical uncertainty should also be shown independently rather than hidden inside these shares. A local null gives no finite local positive ratio even while national health is positive; it does not say the gift has no value elsewhere.

## Signed arithmetic and overlap

Let `Qshared` be the national model's funding-adjusted benefit minus its shared clinical harm, before independent gift harm. Use `Qsf=sSF*Qshared-Hsf`; `QrestBay=(sBay-sSF)*Qshared-HrestBay`; `Qoutside=(1-sBay)*Qshared-Houtside`. The three regional values sum to national shared health minus the explicitly located independent harms. Do not scale a national independent harm by the positive-benefit share unless that is itself a separate stated harm-location prior. A no-SF-benefit case can still have SF-specific harm. For positive values, price is `10*wholeGift/Qregion`; otherwise retain null ratio and signed Q.

The accepted national model already deduplicates multiple bundles at one event and overlapping person-time from repeated rescues. Geography adds no new rescue or survival credit. Remedy, NDP, DOPE/NHRC, SFAF and downstream peer providers cannot each claim the entire same incremental outcome. Resource numerator remains the whole national funded package; do not allocate costs geographically while leaving whole-gift benefits or vice versa.

Arithmetic checked directly in JavaScript using accepted central Q=1.31295339749, donor cash=$10,000, gross associated resources=$15,333.3333. No changes to accepted clinical or cost parameters. Suggested next evidence is a dated shipment/fulfillment ledger plus public-versus-charitable funding and beneficiary-residence information; missing that evidence justifies broad priors, not a falsely precise local claim.
