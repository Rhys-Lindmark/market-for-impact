# Bike East Bay alpha handoff

Ready for independent audit; not published or a giving recommendation.

Packet: `/private/tmp/mfi-gw-bike-east-bay-report.json`, `-model.mjs`, `-model.test.mjs`, `-results.json`, `-sources.json`, and this memo.

## Provenance, identity and time

Exact staff source directly read: Devin Jacob, December10,2018 GiveWell personal-giving post, lines58–68 in retrieved page. Bike East Bay named as local transit interest among gifts outside GiveWell's criteria. This is neither GiveWell organizational endorsement nor proof of a current2026 gift. Post author Catherine Hollander is not substituted for actual donor. https://blog.givewell.org/2018/12/10/staff-members-personal-donations-for-giving-season-2018/ .

Official financials page explicitly identifies East Bay Bicycle Coalition DBA Bike East Bay; EIN94-2585652 independently verified original return. Targeted name/alias/EIN search of current baseline home-ranked Bay/SF/expanded index files found no entry. DiscoveryP17 is not an existing published report or selected cycling organization. No claim of all-EIN census.

Actual observed block: first Bike East Bay primary-page work occurred in tool call ending15:52:23UTC, September11,2026; last report/model test clock15:59:24UTC, memo/handoff afterward. A short SVBC correction recheck occurred around15:55:28 within this block and is not Bike East Bay research. No instrumented active-time claim and no fifteen-minute claim; bounded work completed without padding. Requested dispatch gpt-6-astra/low (Astra Light), not independently introspected runtime identity. Space Saver: existing Node/checkouts, small text artifacts, no downloads/installs/servers/Site changes/outreach/nested agents.

## Result and locked assumptions

Model version bike-east-bay-whole-gift-finite-v1 written before first evaluation15:55:09. First numbers preserved, no coefficient retuning:

- Whole gross accounting expense1,908,395 = functional1,897,776 + netted event7,478 + inventory3,141.
- Signed weighted finite Bay Q0.9996889638491746 per annual-budget equivalent;10,000giftQ0.005238375513712699; price19,089,887.645172846 per10BayQ.
- Central104,277,378.90873168; favorable1,900,530.6179931774,10%worldweight. Favorable share100.445%of signedtotal because other worlds subtract health. No declared scenario below1M, not a calibrated zero probability.
- Without favorable netnegative; zero-harm17.08M, fullnonnullcash13.45M. Stronger exposure data did not make the gift competitive.

## Primary evidence and new findings

1. Original2024 return on organization site and IRS/ProPublica object202513149349306046 inspected. Finance: revenue1,845,171, deficit52,605, government684,673, noncash54,983, netassets732,835, liabilities115,390, cash/savings635,662. These are not current2026 reserves or a donation offer. Official financials links2025impactPDF, but fetch failed; latest original filing found2024. No invented2025/2026budget.
2. PartIII education output1,158 adults/children,81classes,24cities; explicitly funded by ACTC, Alameda, ContraCostaHealth and others. Event12,100riders/advocate109counts not clinical outcomes. Wholeprogram costs577,770education,441,981otherprograms,375,925advocacy,83,696BikeDay remain in numerator via full expense. No separately priced education course claimed.
3. CCTA current official project page is unusually useful:5.5mile ContraCosta segment from countyline toContraCostaCollege,6fatalities/35severelyinjured overJuly2020–June2025, SWITRS agency summary. Counts are people and fatal/nonfatal disjoint. Raw SWITRSnotindependentlyqueried. No finaldesign selected;2026conceptreview/2027recommendations; constructionfunding/scheduleundecided. https://ccta.ca.gov/projects/san-pablo-safety-and-access/ .
4. Same agency identifies substantialbaseline: Caltrans2027–2029maintenance/safety, smartsignals, DelNorte and otherprojects. Model residual .75(.5–.9) is explicitly unmeasured, not blanketcreditforhistoricalrisk. BikeEastBay'sowncurrentinventory confirmsDelNortecompletedJuly2026 and someothersegmentsfullyfunded. Distinct3.5mileAlameda/235injurycollisionseries is NOT added to thiscohort.22milecampaign extent is not exposure multiplier.
5. BikeEastBay has a corridorcampaign spanning thesecommunities, but no verified commissionedtechnicaltask on exactCCTAproject. Contribution .1(.03–.25) is annualworkcohort diluted by agencies/otheradvocates and itsownpast/futurework; realization .5(.25–.8) separately accounts for actualconstruction. Cash .4(0–.7) ordinarygiftresponse is separate, unverified. No campaign persuasion model. Publicconstruction/maintenance/resourcesunpriced, completeResourceCostPer10null.
6. Shared evidence rereused from directly read MCBC phase: FHWAroad-diet positive officialsummary19–47%totalcrashes, original2004matchedstudy no significant rateeffect; nofatalityRR transfer. Cycling education RCT122Spanishadolescents nullcommuting;43Danishchildrenpositivecardiometaboliccomposite, nonsignificantfitness. LatterprimaryabstractviaEuropePMC, notfullpaperread. Utility for mixedadult/childlocalcohort is genericjudgment, not imported scoreconversion.

## Critical interpretation

Whole-cost two-pathway partial health, not complete portfolio value or guaranteed lower bound. School education/othercorridors/access/airquality/socialvalue unquantifiednotzero. Road residual excludes existingprojects; reduction addresses remainingtreatedrisk; adverseburden addresses extra/displacedexposure—notsameinjurytwice. Education extraCycling must include repeatperson/activityperiod dedup; extraActivity removes otherexercise substitution. No separate clinicalcompletiondiscount on trialITT.

No donationUrl: navigation exists, checkout/restrictions not inspected. Unknown marginal room was modeled, not used as automatic disqualification. Decision criteria: actual annualstaff/designtask ordinarycash adds, agencycounterfactual, stage-specificrealization, segment/severitybaselineaftercommittedprojects, and observedextraactivity ratherthanclassattendance. Strongerperformance elsewherecouldchangefullportfolioresult, butcannotbeassumedfromstaffgiftorpreviouswins.

Tests pass: fullsaveddeepEqual, grosscostaddbacks, independent100,000midpointdiscountintegral, independentcentralroad/activityarith, signed/null, zerogift/scaling, finiteparameter/timebounds, malformedinput/array/null, trimmedduplicateIDs, weights, adverseeffect, canonicalrendererfields andsourceprovenance. Command: `node --test /private/tmp/mfi-gw-bike-east-bay-model.test.mjs`.
