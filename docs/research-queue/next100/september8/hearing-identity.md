# Hearing Center recipient identity: primary-record resolution

Checked 2026-09-08. **Material correction to earlier packet: this is now a primary-confirmed historical-EIN automatic-revocation record, not merely a secondary warning.** Preserve the research model, but do not claim an additional currently verified eligible charitable recipient or present a direct gift recommendation.

## Direct IRS results

The [IRS TEOS bulk-download page](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads) identifies the Publication78 and automatic-revocation datasets and labels each last updated June9,2026. Both linked ZIP files were downloaded into memory using curl, parsed with Python zipfile, and searched across the complete extracted text (no private access).

[Automatic revocation ZIP](https://apps.irs.gov/pub/epostcard/data-download-revocation.zip), member `data-download-revocation.txt`, exact matching record:

```text
941322198|HEARING AND SPEECH CENTER OF NORTHERN CALIFORNIA||1234 DIVISADERO ST|SAN FRANCISCO|CA|94115-3911|US|03|15-NOV-2025|10-MAR-2026|
```

The [primary IRS dictionary](https://www.irs.gov/pub/irs-tege/auto-revocation-data-dictionary.pdf) maps the last three fields to effective revocation date, posting date and reinstatement date. Therefore the record states **revoked November15,2025; posted March10,2026; reinstatement field blank**. This is automatic revocation for failure to file required annual returns/notices for three consecutive years, not evidence of misconduct, clinic closure or state corporate dissolution.

[Publication78 ZIP](https://apps.irs.gov/pub/epostcard/data-download-pub78.zip), member `data-download-pub78.txt`, had **no matching EIN941322198 and no case-insensitive full Center-name match**. The IRS page notes Pub78 lists registered legal names rather than DBAs. Exact EIN search avoids an ordinary name-only mismatch. Downloaded data have a cutoff; absence does not exclude subsequent reinstatement or an unlocated successor. No primary reinstatement letter or new recipient EIN was found in this bounded check.

## Legal name/reorganization and clinical continuity

The Center's [official history](https://hearingspeech.org/about-us/) identifies a **2005 merger** between Hearing Society for the Bay Area and San Francisco Hearing and Speech Center. It continues to describe the Center as a501(c)(3), but the page is undated and does not explain the2025 revocation, a new entity, fiscal sponsor or reinstatement. Its old name is independently consistent with [primary NPPES](https://npiregistry.cms.hhs.gov/api/?number=1164577433&version=2.1): former legal business name San Francisco Hearing and Speech Center, active clinical NPI, updated June8,2026. Clinical registry status does **not** establish exemption.

The [official2020 sponsorship PDF](https://www.hearingspeech.org/wp-content/uploads/2019/10/HSC_Gala_Sponsor_Packet_2020INDIV.pdf) links the Center to EIN94-1322198. Current [donation page](https://hearingspeech.org/donate/) supplies a general/restrictable donation route but no inspected current IRS determination letter. No current legal transfer to PHC was established.

A misleading search snippet appeared to associate aJuly2025 exemption date with the Center. Inspecting the underlying directory showed that date belongs to **Health Starts Here**, a preceding unrelated row; the Center row instead saysJune1956. Therefore there is **no new-EIN evidence from that snippet**. A separate attempted IRS CaliforniaBMF CSV retrieval produced no usable content; it is not evidence of absence and is excluded from conclusions.

## What to publish and count

1. Clinical mechanism: retain one conditional **PHC–Hearing Center shared hearing-aid pathway**. [PHC's primary program page](https://www.projecthomelessconnect.org/programs/coresenses/) identifies a partnership, not ownership or fiscal sponsorship. It does not make the Center merely a PHC legal subprogram.
2. Recipient status: label the historical Center EIN **IRS automatic-revocation listed; current reinstatement/successor unverified**. Do not label the clinic inactive or infer tax-deductibility from its undated website. Do not quietly route the same model to PHC without confirming PHC can accept/use a hearing-restricted gift and that it expands the pathway.
3. Roster: this can be an additional researched mechanism, but **do not claim another currently verified eligible charitable recipient; the project counts distinct researched organizations, including critical findings, only after validated publication** on this evidence. Keep the shared-outcome key so PHC and Center do not receive separate QALY credit.
4. Decisive missing evidence: a current IRS reinstatement/determination record, identified successor/fiscal sponsor and formal transfer evidence, or an independently verified PHC-controlled funding route with the operator agreement. No outreach occurred.

Suggested public wording: “The hearing-aid model remains conditional research. IRS data downloaded for this review list the Center's historical EIN as automatically revoked effective November15,2025, with no reinstatement date recorded. We have not verified a subsequent reinstatement or replacement charitable recipient. This does not establish that clinical services have stopped.”
