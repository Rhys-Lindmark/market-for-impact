export const researchGroups=[
 ['summary','Summary'],
 ['what','1. What do they do?'],
 ['monitoring','2. Monitoring and information sharing'],
 ['qualitative','3. Qualitative assessment'],
 ['cost','4. What do you get for your dollar?'],
 ['funding','5. Funding and previous grants'],
];
export function groupReportSections(sections,mapping){
 if(!mapping)throw Error('Missing report contents mapping');
 if(Object.keys(mapping).length!==sections.length||sections.some(s=>!researchGroups.some(([key])=>key===mapping[s.id])))throw Error('Incomplete report contents mapping');
 return researchGroups.map(([key,title])=>({id:'research-'+key,title,sections:sections.filter(s=>mapping[s.id]===key)})).filter(group=>group.sections.length);
}
