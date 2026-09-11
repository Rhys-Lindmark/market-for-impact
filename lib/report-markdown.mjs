// Deliberately small, text-only Markdown contract for reviewed research.
// Raw HTML is never evaluated; React renders all text safely.
export const headingId = text => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
export function reportSections(markdown) {
 const parts=markdown.split(/^## /m).slice(1);
 const seen=new Set();
 return parts.map(part=>{
  const newline=part.indexOf('\n');
  const title=(newline<0?part:part.slice(0,newline)).trim();
  const id=headingId(title);
  if(!id||seen.has(id))throw new Error('Duplicate or empty report heading: '+title);
  seen.add(id);
  return {id,title,markdown:newline<0?'':part.slice(newline+1).trim()};
 });
}
export function safeReportLink(url) {
 return /^(https?:\/\/|#|\/(?!\/))/.test(url) ? url : undefined;
}
export function markdownBlocks(markdown) {
 const lines=markdown.split('\n'), blocks=[];
 let i=0;
 const tableRow=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
 const special=line=>/^\s*$|^#{3,4} |^[-*] |^\d+\. |^\|/.test(line);
 while(i<lines.length) {
  if(!lines[i].trim()){i++;continue;}
  const heading=lines[i].match(/^(#{3,4}) (.+)$/);
  if(heading){blocks.push({type:'heading',level:heading[1].length,text:heading[2],id:headingId(heading[2])});i++;continue;}
  if(lines[i].startsWith('|') && /^\|?[\s:|-]+\|?$/.test(lines[i+1]??'')){
   const headers=tableRow(lines[i]);i+=2;const rows=[];
   while(i<lines.length&&lines[i].startsWith('|')){const row=tableRow(lines[i++]);if(row.length!==headers.length)throw Error('Uneven research table');rows.push(row);}
   blocks.push({type:'table',headers,rows});continue;
  }
  const list=lines[i].match(/^([-*]|\d+\.) (.+)$/);
  if(list){const ordered=/\d/.test(list[1]),items=[];const pattern=ordered?/^\d+\. (.+)$/:/^[-*] (.+)$/;
   while(i<lines.length){const item=lines[i].match(pattern);if(!item)break;items.push(item[1]);i++;}
   blocks.push({type:'list',ordered,items});continue;
  }
  const p=[lines[i++]];
  while(i<lines.length&&!special(lines[i]))p.push(lines[i++]);
  blocks.push({type:'paragraph',text:p.join(' ')});
 }
 return blocks;
}
