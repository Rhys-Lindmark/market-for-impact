# Backend impact display configuration

Edit **`impactMetricConfig.id` in `lib/impact-metric.mjs`**, then test, rebuild and publish. There is no visitor-facing toggle.

- `daly-equivalent` (default): one modeled healthy-year welfare equivalent; canonical comparison prices divided by ten.
- `better-life`: ten modeled equivalent years; restores canonical comparison prices and original comparison prose.

DALY-equivalent is a presentation/comparison label, **not a claim that income welfare is clinical DALYs** or that a measured DALY averted is identical to a QALY gained. Health and signed household-resource inputs retain their original distinctions and assumptions.

## Source versus presentation

Calculators, original reports, fiscal expenses, gift amounts, course prices, outcomes and research-time records remain in their canonical units. Functions such as `reportPrice` and fields named `PerTen`, `price10` and `Per10Qalys` still mean a ten-year comparison. Do not divide those stored values in place.

Use `formatImpactPrice(canonicalTenYearPrice)` for comparison prices and `impactMetric().label` / `.priceLabel` for their labels. Use ordinary currency formatting for budgets, wages, expenses and native unit costs. Keep sort/ranking values canonical: a uniform positive conversion does not change ranking.

Geography APIs add `display` and `listDisplay` with exact `priceUSD`, metric identity and the explicitly named canonical price; their scientific `model` payload remains unchanged. Model APIs add `comparisonDisplay.priceUSDByCanonicalField` wherever a named ten-year price exists, retaining all original fields. Arrays and unrelated payloads retain their contracts. `/api/impact-metric` describes the current display contract. Source diagnostics remain canonical rather than silently breaking existing API consumers.

## Older prose

`impactText` / `impactNode` adapt explicit ten-year comparison prices and units at the rendering boundary. Structural summary and scenario price fields and price-column/price-row tables get a price-only conversion. No generic dollar-value replacement is permitted.

Unlabelled historical comparisons have reviewed exact-text/offset mappings in `data/impact-metric-geography-overrides.json` and `data/impact-metric-legacy-overrides.json`. These leave source reports untouched and prevent the same amount in a gift or budget sentence from being converted. New reports should interpolate formatted numeric model outputs instead of adding more hardcoded prose prices. If old report text changes, review the corresponding mappings and tests; never infer a financial value's unit from its size alone.

## Checks

`node --test scripts/impact-metric.test.mjs scripts/geography-reports.test.mjs scripts/income-health-equivalence.test.mjs scripts/edition-featured.test.mjs scripts/research-effort.test.mjs`

With a local preview running: `node scripts/audit-impact-pages.mjs http://localhost:3012`. This checks every geography report, every legacy charity route and shared public views for HTTP success and obsolete units. It does not substitute for numerical, equation or independent semantic checks.

Migration evidence: `docs/impact-metric-migration-20261012.md`. Historical source/model test fixtures outside this migration may assert superseded research states; do not change scientific models to satisfy those fixtures.
