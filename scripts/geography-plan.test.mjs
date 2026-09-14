import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL('../docs/'+p, import.meta.url)));
const p=read('geography-progress.json'), b=read('geography-boundaries.json');
assert.equal(p.editions.length,11);
assert.equal(new Set(p.editions.map(e=>e.id)).size,11);
assert.equal(p.models.discovery.effort,'medium'); assert.equal(p.models.alpha.effort,'low'); assert.equal(p.models.beta.effort,'medium');
for(const e of p.editions){
 assert.ok(e.boundaryVersion);
 const stages=[['acceptedDiscoveryIds','discoveryAccepted',100],['alphaCohortIds','alphaPublished',25],['betaIds','betaAcceptedPublished',10],['topPickIds','topPicksPublished',4]];
 let previous;
 for(const [ids,counter,max] of stages){
  assert.equal(e[ids].length,e[counter]); assert.equal(new Set(e[ids]).size,e[ids].length);
  assert.ok(e[counter]>=0&&e[counter]<=max);
  if(previous)for(const id of e[ids])assert.ok(previous.includes(id));
  previous=e[ids];
 }
}
assert.equal(b.metros.length,9); assert.equal(b.metros.reduce((s,m)=>s+m.counties.length,0),102);
for(const m of b.metros){
 assert.equal(m.countyCount,m.counties.length); assert.equal(new Set(m.counties.map(c=>c.fips)).size,m.countyCount);
 assert.ok(m.counties.every(c=>/^\d{5}$/.test(c.fips)));
 assert.ok(p.editions.some(e=>e.id===m.id&&e.boundaryVersion===m.boundaryVersion));
}
for(const edition of ['california','usa']){
 const seed=read('geography-discovery/'+edition+'-seed.json');
 assert.equal(seed.candidates.length,20); assert.equal(new Set(seed.candidates.map(c=>c.name)).size,20);
 assert.equal(seed.model.id,'gpt-6-astra'); assert.equal(seed.model.reasoning,'medium');
 const wave=read('geography-discovery/'+edition+'-wave2.json');
 assert.equal(wave.candidates.length,40);
 assert.equal(new Set(wave.candidates.map(c=>c.name)).size,40);
 assert.equal(wave.model.id,'gpt-6-astra'); assert.equal(wave.model.reasoning,'medium');
 const wave3=read('geography-discovery/'+edition+'-wave3.json');
 assert.equal(wave3.candidates.length,40);assert.equal(wave3.model.id,'gpt-6-astra');assert.equal(wave3.model.reasoning,'medium');
 const records=[...Object.values(read('geography-discovery/initial40-acceptance.json').records),...read('geography-discovery/wave2-acceptance.json').records];
 const accepted=records.filter(r=>r.edition===edition&&r.status==='accept-for-discovery');
 assert.equal(accepted.length,edition==='california'?58:59);
 const row=p.editions.find(e=>e.id===edition);
 assert.equal(row.discoveryProvisional,0);
 assert.equal(row.discoveryHeld,2);
 assert.equal(row.discoveryHeld,row.heldDiscoveryIds.length);
 const finalAudit=read('geography-discovery/'+edition+'-wave3-acceptance.json');
 const finalPacket=read('geography-discovery/'+edition+'-cohort-final.json');
 const cohort=read('geography-discovery/accepted-cohorts.json').editions.find(e=>e.id===edition);
 const allAccepted=[...accepted,...finalAudit.records.filter(r=>r.status==='accept-for-discovery'),...finalPacket.replacements];
 assert.equal(allAccepted.length,100);
 assert.equal(new Set(allAccepted.map(r=>r.canonicalOrganizationId)).size,100);
 assert.deepEqual([...row.acceptedDiscoveryIds].sort(),allAccepted.map(r=>r.canonicalOrganizationId).sort());
 assert.deepEqual(row.acceptedDiscoveryIds,cohort.acceptedDiscoveryIds);
 assert.equal(row.selectedAlphaIds.length,25);
 assert.deepEqual(row.selectedAlphaIds,cohort.selectedAlphaIds);
 assert.equal(new Set([...cohort.selectedAlphaIds,...cohort.alternateIds]).size,35);
 for(const id of [...cohort.selectedAlphaIds,...cohort.alternateIds])assert.ok(row.acceptedDiscoveryIds.includes(id));
 for(const id of row.alphaCohortIds)assert.ok(row.selectedAlphaIds.includes(id));
 assert.equal(cohort.selection.length,25);
 for(const choice of cohort.selection)assert.ok(choice.reason&&choice.decisiveQuestion&&choice.organizationId);
 assert.ok(row.heldDiscoveryIds.every(id=>typeof id==='string'&&id.startsWith(edition+':')));
 for(const record of accepted){assert.equal(record.geographyBoundary,row.boundaryVersion);assert.ok(record.primarySources.length);assert.ok(record.verifiedEvidence||record.geographyEvidence);}
}
const la=read('geography-discovery/los-angeles-cohort-final.json');
const laProgress=p.editions.find(e=>e.id==='los-angeles');
const laCohort=read('geography-discovery/accepted-cohorts.json').editions.find(e=>e.id==='los-angeles');
assert.equal(la.records.length,100);
assert.equal(new Set(la.records.map(r=>r.canonicalOrganizationId)).size,100);
assert.deepEqual(laProgress.acceptedDiscoveryIds,laCohort.acceptedDiscoveryIds);
assert.deepEqual([...laProgress.acceptedDiscoveryIds].sort(),la.records.map(r=>r.canonicalOrganizationId).sort());
assert.equal(laProgress.selectedAlphaIds.length,25);
assert.deepEqual(laProgress.selectedAlphaIds,laCohort.selectedAlphaIds);
assert.equal(new Set([...laCohort.selectedAlphaIds,...laCohort.alternateIds]).size,35);
for(const id of [...laCohort.selectedAlphaIds,...laCohort.alternateIds])assert.ok(laProgress.acceptedDiscoveryIds.includes(id));
for(const r of la.records){
 assert.equal(r.status,'accept-for-discovery');
 assert.equal(r.boundaryVersion,laProgress.boundaryVersion);
 assert.ok(r.primarySources.length&&r.mechanism&&r.falsifier&&r.acceptanceBasis);
 assert.ok(r.primarySources.every(s=>s.url.startsWith('https://')&&s.retrieved));
 assert.ok(r.inScopeCountyAnchors.length&&r.inScopeCountyAnchors.every(c=>['06037','06059'].includes(c)));
}
assert.equal(laProgress.alphaPublished,25);
const denver=read('geography-discovery/denver-seed.json');
assert.equal(denver.candidates.length,40);
assert.equal(p.editions.find(e=>e.id==='denver').discoveryProvisional,0);
assert.equal(p.editions.find(e=>e.id==='denver').discoveryAccepted,100);
const seattle=read('geography-discovery/seattle-independent-acceptance.json');
const seattleProgress=p.editions.find(e=>e.id==='seattle');
assert.equal(seattle.records.length,100);
assert.equal(new Set(seattle.records.map(r=>r.canonicalOrganizationId)).size,100);
assert.deepEqual(seattleProgress.acceptedDiscoveryIds,seattle.records.map(r=>r.canonicalOrganizationId));
assert.deepEqual(seattleProgress.selectedAlphaIds,seattle.selection.revisedTop25.map(r=>r.canonicalOrganizationId));
assert.equal(seattleProgress.selectedAlphaIds.length,25);
for(const r of seattle.records){
 assert.equal(r.discoveryCredit,1);assert.equal(r.alphaCredit,0);assert.equal(r.betaCredit,0);
 assert.ok(r.primaryLeadVerification&&r.mechanism&&r.falsifier&&r.wholeGiftScope);
 assert.ok(r.sources.length&&r.sources.every(s=>s.url.startsWith('https://')&&s.retrievedAt));
 assert.ok(r.verifiedCountyFips.length&&r.verifiedCountyFips.every(f=>['53033','53053','53061'].includes(f)));
}
for(const id of seattleProgress.selectedAlphaIds)assert.ok(seattleProgress.acceptedDiscoveryIds.includes(id));
assert.ok(seattle.selection.revisedTop25.some(r=>r.name==='WithinReach'));
assert.equal(seattle.researchTime.reasoningEffort,'medium');
assert.equal(seattleProgress.alphaPublished,0);assert.equal(seattleProgress.betaAcceptedPublished,0);
const nyc=read('geography-discovery/nyc-independent-acceptance.json');
const nycProgress=p.editions.find(e=>e.id==='new-york-city');
assert.equal(nyc.records.length,100);
assert.equal(new Set(nyc.records.map(r=>r.canonicalOrganizationId)).size,100);
assert.deepEqual(nycProgress.acceptedDiscoveryIds,nyc.records.map(r=>r.canonicalOrganizationId));
assert.deepEqual(nycProgress.selectedAlphaIds,nyc.top25.map(r=>r.canonicalOrganizationId));
assert.equal(nyc.top25.length,25);
for(const r of nyc.records){
 assert.ok(['accepted_discovery','accepted_with_recipient_correction'].includes(r.disposition));
 assert.ok(r.independentEvidenceFinding&&r.mechanism&&r.falsifier);
 assert.ok(r.primaryVerificationEvidence.length);
 assert.ok(r.verifiedCountyFips.length&&r.verifiedCountyFips.every(f=>nyc.boundary.countyFips.includes(f)));
 assert.equal(r.alphaAccepted,false);assert.equal(r.betaAccepted,false);
}
assert.ok(nycProgress.acceptedDiscoveryIds.includes('org:zufall-health-foundation'));
assert.ok(!nycProgress.acceptedDiscoveryIds.includes('org:zufall-health'));
assert.equal(nycProgress.alphaPublished,12);assert.equal(nycProgress.betaAcceptedPublished,0);
for(const id of nycProgress.alphaCohortIds)assert.ok(nycProgress.selectedAlphaIds.includes(id));
for(const city of ['denver','chicago','houston','boston','atlanta','detroit']){
 const row=p.editions.find(e=>e.id===city);
 const packet=read('geography-discovery/'+(city==='denver'?'denver-independent-acceptance.json':city+'-cohort-final.json'));
 const selection=city==='denver'?packet.selected:read('geography-discovery/'+city+'-selection.json').selected;
 assert.equal(packet.records.length,100);
 assert.deepEqual(row.acceptedDiscoveryIds,packet.records.map(r=>r.canonicalOrganizationId));
 assert.deepEqual(row.selectedAlphaIds,selection.map(r=>r.canonicalOrganizationId));
 assert.equal(row.selectedAlphaIds.length,25);
 assert.equal(row.alphaPublished,0);assert.equal(row.betaAcceptedPublished,0);assert.equal(row.topPicksPublished,0);
 const boundary=b.metros.find(m=>m.id===city);
 for(const record of packet.records){
  const counties=record.inScopeCountyAnchors||record.countyFips;
  assert.ok(counties.length&&counties.every(f=>boundary.counties.some(c=>c.fips===f)));
  assert.ok(record.mechanism||record.mechanismHypothesis);
  assert.ok(record.falsifier||record.majorDisqualifier);
  assert.ok((record.primaryVerification||record.sources).length);
 }
}
const boston=read('geography-discovery/boston-cohort-final.json');
const bostonAudit=read('geography-discovery/boston-independent-acceptance.json');
assert.equal(bostonAudit.acceptedDiscoveryCount,100);
assert.equal(bostonAudit.acceptedSelectionCount,25);
assert.ok(boston.records.find(r=>r.id==='boston-bay-state-community-services-including-moar').recipientRouteStatus.includes('not an unrestricted BSCS route'));
assert.ok(boston.records.find(r=>r.id==='boston-planned-parenthood-league-of-massachusetts').selectionRationale.includes('cannot be presumed'));
assert.equal(bostonAudit.acceptedAlphaCount,0);
assert.equal(bostonAudit.acceptedBetaCount,0);
const atl=read('geography-discovery/atlanta-cohort-final.json');
assert.equal(atl.records.find(r=>r.ordinal===38).canonicalOrganizationId,'ein:58-6212478');
assert.equal(atl.records.find(r=>r.ordinal===73).canonicalOrganizationId,'ein:58-1743333');
assert.match(atl.records.find(r=>r.ordinal===5).primaryEvidence,/NEW patients/);
assert.match(atl.records.find(r=>r.ordinal===89).recipientRouteStatus,/maintenance/);
const detroit=read('geography-discovery/detroit-cohort-final.json');
const detroitAudit=read('geography-discovery/detroit-independent-acceptance.json');
assert.equal(detroitAudit.acceptedDiscoveryCount,100);assert.equal(detroitAudit.acceptedSelectionCount,25);
assert.match(detroit.records.find(r=>r.ordinal===29).primaryEvidence,/ended\/transferred/);
assert.match(detroit.records.find(r=>r.ordinal===55).primaryEvidence,/ended November 16, 2025/);
assert.match(detroit.records.find(r=>r.ordinal===45).primaryEvidence,/resumed August 3, 2026/);
assert.equal(p.editions.reduce((n,e)=>n+e.discoveryAccepted,0),1100);
assert.equal(p.editions.reduce((n,e)=>n+e.selectedAlphaIds.length,0),275);
console.log('PASS:11 editions; nested counts;9 MSAs/102 counties;1100 accepted discovery,275 selected priorities; no new alpha or beta credit for discovery.');
