# GiveWell diagnostic integration audit

September 8, 2026. Read-only actual component, calculator, comparison API and both report integrations in `work/market-for-impact-givewell-calibration`.

Arithmetic accepted. Independent evaluation confirms finite survival 13.6461367536; AMF benchmark conversion $4,030.44/10Q and NI $3,297.64/10Q; illustrative fifty-Q conversions $1,100 and $900. Native independent death prices correctly equal $12,449.42 and $51,440.33. Finite-horizon and invalid-zero-cost checks passed.

The API marks this a diagnostic, preserves source vintage and expressly omits implementation lag in the examples. Both report pages append it without changing original model outputs. No new count, SF allocation, or global-as-local price is introduced. The source statement correctly distinguishes historical specific funding opportunities from future unrestricted gifts.

One small material clarification requested: add to component and API limitations that **GiveWell's aggregate deaths averted can have a different age/timing composition from our early-child mortality pathway; assigning the same event-time QALYs per death here is hypothetical, not an age-matched survival calibration.** This is why the diagnostic does not yet justify adopting its converted price as a new center. No arithmetic change requested.

No Site edits. Accept as diagnostic with that explicit scope clarification; no broader model acceptance is implied.

Coordinator follow-up: explicit age/timing-composition caveat added to both report component and API. 304 tests, lint/build and six phone/tablet checks passed. Source data and old model outputs unchanged.
