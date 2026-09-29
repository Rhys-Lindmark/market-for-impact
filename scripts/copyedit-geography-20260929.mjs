import fs from 'node:fs';

// One bounded mechanical pass on the new public prose. Preserve URL targets,
// model assumptions, sources, and all numerical inputs/results verbatim.
const file='data/geography-reports.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const edit=text=>text.split(/(\]\(https:\/\/[^)]+\))/g).map(part=>{
 if(part.startsWith('](https://'))return part;
 return part
  .replace(/([A-Za-z])\$(?=\d)/g,'$1 $')
  .replace(/\b(per|for|from|and|or|of|to|at|with|is|as|over|under|before|after|since|between|only|uses|used|reports|shows|gives|includes|plus|minus|then|via|on|by|about|into|gets|costs)(\d)/gi,'$1 $2')
  .replace(/\b(EIN|Form|Schedule|July|June|January|February|March|April|August|September|October|November|December|line|page|Part)(\d)/g,'$1 $2')
  .replace(/\b(Schedule|Part)([A-Z])/g,'$1 $2')
  .replace(/\b(records|receives|yielding|assumed|original|issued|pages|a)(\d)/gi,'$1 $2')
  .replace(/(\d)(QALYs?|patients?|clients?|meals?|calls?|contacts?|years?|months?|sites?|residents?|events?|days?|cases?|people|children|million|minutes|percent)\b/gi,'$1 $2')
  .replace(/(\d(?:\.\d+)?)m\b/gi,'$1 million')
  .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}),(\d{4})\b/g,'$1 $2, $3')
  .replace(/([,;:])(?=\$?\d)/g,'$1 ')
  .replace(/(^|[ ,;:(A-Za-z])\.(\d+)\b/g,'$1 0.$2')
  .replace(/(\d),\s+(?=\d{3}(?:,|\b))/g,'$1,')
  .replace(/ {2,}(?=0\.)/g,' ')
  .replace(/\bissued(April|May|June|July|August|September|October|November|December|January|February|March)(\d)/g,'issued $1 $2')
  .replace(/\bA(1\.1)\b/g,'A $1')
  .replace(/final\.(\d)/g,'final 0.$1');
}).join('');
let changed=0;
for(const report of data.reports.filter(item=>item.published==='2026-09-29')){
 for(const section of Object.keys(report.sections)){
  const next=edit(report.sections[section]);
  if(next!==report.sections[section]){report.sections[section]=next;changed++;}
 }
}
console.log(`Copy-edited ${changed} section fields in September 29 reports.`);
if(process.argv.includes('--write'))fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
