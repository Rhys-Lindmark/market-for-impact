# Canonical HTTP acceptance — September 11, 2026

**No failures found in the verified scope.** Read-only direct HTTP; no Site edits/tools, browser, installs or model changes. Read local frozen-ten and ranking/V2 e2e contracts in `work/market-for-impact-sogorea-te`. Web tool URL-safety wrapper rejected the two directory URLs; native direct HTTP succeeded, so that wrapper failure is not a Site failure.

- `/givebetter/research`: HTTP200, **91** distinct charity links.
- `/givebetter/archive/expanded-geography-research`: HTTP200, **21** distinct charity links.
- Union **112**, no cross-directory duplicates. All112 report GETs returned200 and contained an H1. Six concurrent requests maximum,20-second per-request deadline; completed19:18:45.129–19:18:50.536UTC.
- All ten frozen V2 API endpoints returned200 and parsed as JSON. Nine priced directory rows equal their API's exact central Bay output; no rounding comparison. NEMS's ordinary Foundation gift price and expected QALYs remain null; its directory row has no numeric price attribute. Conditional HBV output remains separate.

| Report | Exact central Bay price in API and directory |
|---|---:|
|ReCARES|74720.3436746678|
|HOPE Pacifica|554659.5517271358|
|Project Homeless Connect|774408.3401731638|
|Friends of the Urban Forest|1652627.0127335358|
|SPUR|2191060.473269062|
|Pacific Hearing Connection|2199017.543859649|
|GLIDE|4890656.595775775|
|Breathe California|10751762.342975779|
|Housing Action Coalition|23307277.040449742|
|NEMS|null ordinary gift; conditional diagnostic not ranked|

The API paths checked were `/api/recares-model`, `/api/glide-v2-model`, `/api/breathe-v2-model`, `/api/hope-v2-model`, `/api/phc-portfolio-model`, `/api/pacific-hearing-connection-model`, `/api/fuf-model`, `/api/nems-v2-model`, `/api/spur-v2-model`, `/api/hac-v2-model`, all under canonical `/givebetter`.

This verifies link availability, heading presence, API delivery, central selection and exact API/index agreement—not browser hydration, responsive layout, interactive calculators, every source claim, or complete line-by-line report parity. Existing local e2e tests define those additional browser checks; none was run in this bounded HTTP-only lane. NEMS's geography label is not evidence of measured Bay allocation; its numeric ordinary-gift value remains unestimated.

Reproducible script `/private/tmp/mfi-canonical-final-http-audit.mjs`; full per-link statuses and fetched ten API payloads `/private/tmp/mfi-canonical-final-http-results.json`. Numerical exact-equality assertions were run separately against that saved payload and passed for all nine priced V2 rows; a fresh directory fetch confirmed the NEMS no-price tag.
