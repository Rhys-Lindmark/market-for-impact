# HSC recipient-status refresh

Retrieved September 9, 2026 UTC (September 8 local task date). Read-only primary-source check; no donation, outreach, routing change or legal advice.

## Finding

**Current charitable donation-recipient status remains unresolved, not cleared.** Fresh IRS downloads independently reproduce the automatic-revocation record for historical EIN **94-1322198**, with no reinstatement date recorded. The newer August 11, 2026 California BMF also contains no exact EIN or full-name match. These are dated datasets, not a conclusive determination that no subsequent reinstatement exists today. The Center's active clinical identity and current website do not resolve the exemption discrepancy. No documented contemporary successor or fiscal sponsor was found in this bounded check.

This refresh strengthens the evidence behind the existing conditional warning; it does not establish clinic closure, misconduct, corporate dissolution or an alternative donation recipient.

## Primary IRS evidence

All links below were retrieved on the date above. The [IRS bulk-download landing page](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads) labels both Publication 78 and automatic-revocation downloads last updated **June 9, 2026**. Both complete ZIPs were freshly downloaded into memory and searched across their extracted text.

The [automatic-revocation file](https://apps.irs.gov/pub/epostcard/data-download-revocation.zip), member `data-download-revocation.txt`, has this exact record:

```text
941322198|HEARING AND SPEECH CENTER OF NORTHERN CALIFORNIA||1234 DIVISADERO ST|SAN FRANCISCO|CA|94115-3911|US|03|15-NOV-2025|10-MAR-2026|
```

The [IRS field dictionary](https://www.irs.gov/pub/irs-tege/auto-revocation-data-dictionary.pdf) identifies the final three fields as effective revocation date, posting date and reinstatement date: **November 15, 2025; March 10, 2026; blank**. Automatic revocation concerns missing required annual filings; it is not a finding about clinical quality.

The [Publication 78 file](https://apps.irs.gov/pub/epostcard/data-download-pub78.zip), member `data-download-pub78.txt`, has **no exact EIN 941322198 or case-insensitive full Center-name match**. Registered legal names rather than ordinary DBAs are relevant; exact EIN matching avoids a simple name-only mismatch.

The [IRS BMF landing page](https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf) reports an **August 11, 2026** posting date. The linked [California CSV](https://www.irs.gov/pub/irs-soi/eo_ca.csv) was downloaded successfully and parsed as 202,765 rows: **no exact EIN 941322198 or full-name match**. This is new evidence relative to the older audit's unsuccessful CSV retrieval. California selection follows filing address, not service area; this check alone cannot exclude an out-of-state entity or an unidentified successor with a different name/EIN.

The [interactive TEOS page](https://apps.irs.gov/app/eos/) was accessible as a JavaScript-dependent search form, but no browser was available to complete an interactive query. No claim of a live TEOS-query no-match is made. The successful official bulk downloads above are the actual search evidence.

## Identity, affiliation and donation-page checks

| Primary source, refreshed September 9 UTC except historical anchor noted below | Observation | What it does not resolve |
| --- | --- | --- |
| [Official historical sponsorship PDF](https://www.hearingspeech.org/wp-content/uploads/2019/10/HSC_Gala_Sponsor_Packet_2020INDIV.pdf) | Historical identity anchor for EIN 94-1322198, carried from the September 8 independent identity audit; not freshly downloaded in this refresh. | Current reinstatement or new payee. |
| [Official history](https://hearingspeech.org/about-us/) | Describes the 2005 merger of Hearing Society for the Bay Area and San Francisco Hearing and Speech Center; continues an undated 501(c)(3) self-description. | No contemporary merger, fiscal sponsorship or reinstatement document is supplied. |
| [Official donation page](https://hearingspeech.org/donate/) and [financial donations page](https://hearingspeech.org/donate/financial-donations/) | Center-branded donation route; financial page names HSCNC for checks and gives the older Divisadero address. | No inspected current IRS determination letter or independently identified replacement legal recipient. Pages are undated; the financial page was available through a cached web retrieval and should not be treated as newly authored. |
| [Official location page](https://hearingspeech.org/about-us/our-location/) | Lists 433 California Street, Suite 130, while older driving directions remain. | Mixed page freshness is not proof of either organizational discontinuity or exemption. |
| [CMS NPPES API, NPI 1164577433](https://npiregistry.cms.hhs.gov/api/?number=1164577433&version=2.1) | Fresh JSON returned the same organization name, active status A, June 8, 2026 update/certification, 433 California address and former legal name San Francisco Hearing and Speech Center. | Clinical NPI status is not charitable exemption, current service availability, or proof of a new recipient EIN. |
| [Official policies page](https://hearingspeech.org/patient-resources/policies/) | Contains conditional language about what would happen if sold or merged. | This is not an announcement that such a transaction occurred. |

Bounded exact-name/EIN searches for reinstatement, a fiscal sponsor and a contemporary merger located no formal successor/transfer announcement. Absence from this search is not proof that no arrangement exists. The documented 2005 merger and hypothetical privacy-policy merger language must not be presented as a 2025–26 successor resolution.

## Exact unresolved question and sufficient evidence

The unresolved identity is whether donations currently solicited under **Hearing and Speech Center of Northern California / HSCNC** are received by a currently eligible entity under historical EIN **94-1322198**, or by a formally identified different recipient. The smallest decisive evidence would be a current IRS reinstatement/determination record matching that EIN, or documentation naming a successor/fiscal sponsor and its EIN, its authority to receive these gifts, and its current IRS record. No such evidence was inspected here.

Suggested factual wording: “IRS data checked for this review list the Center's historical EIN as automatically revoked effective November 15, 2025, without a reinstatement date recorded. We have not verified a subsequent reinstatement or replacement charitable recipient. This does not establish that clinical services have stopped.”

## Keep PHC overlap separate

The established [PHC Core Senses partnership](https://www.projecthomelessconnect.org/programs/coresenses/) concerns a shared clinical pathway, not proof that PHC owns HSC, is its fiscal sponsor, or has succeeded to its donation identity. Recipient-status uncertainty and shared-patient/outcome overlap are separate issues. This refresh changes neither health assumptions nor donation routing; it does not clear double counting and does not reassign the HSC model to PHC.

## Download receipts

Downloaded in memory; hashes identify the precise bytes examined, not guaranteed future contents at these mutable URLs.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| Revocation ZIP | 47,567,752 | `8ca16ea6420d84a07c27a30d5108fce7596daa7dafdcc6e9e87ed80000ce2073` |
| Pub78 ZIP | 29,760,361 | `e17c77cd46663d1c56518a3adea7c6e5dfb9565f85b10f29b891d356a6e50863` |
| California BMF CSV | 35,138,893 | `1b6a88df3f8cf70e7516f6d3537acaa77de8079dd3ded183b711d4f3bb458adf` |

Existing comparison artifact: `/private/tmp/mfi-hearing-identity.md`. No website, report, model, recipient link or count was edited.

