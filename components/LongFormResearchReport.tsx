/* eslint-disable @next/next/no-html-link-for-pages -- Canonical native navigation avoids Vinext prefetch failures. */
import type {ReactNode} from 'react';
import '@/app/givebetter.css';
import '@/app/report-reading.css';
import {reportSections,markdownBlocks,safeReportLink} from '@/lib/report-markdown.mjs';
import {groupReportSections} from '@/lib/report-contents.mjs';
import contentsMap from '@/data/report-contents-map.json';
import DonorReadiness from './DonorReadiness';
import {researchEffortSummary} from '@/lib/research-effort.mjs';
import researchEffort from '@/data/research-effort.json';
import historicalEffort from '@/data/research-effort-historical-estimates.json';
import assignedEffort from '@/data/research-effort-assigned-estimates.json';
type Section={id:string;title:string;markdown:string};
type Block={type:'heading';level:number;id:string;text:string}|{type:'list';ordered:boolean;items:string[]}|{type:'table';headers:string[];rows:string[][]}|{type:'paragraph';text:string};
type Source={title:string;url:string;publisher:string;published:string;retrieved:string;limit?:string};
function Inline({text}:{text:string}) {
 const parts:ReactNode[]=[];const pattern=/\[([^\]]+)\]\(([^\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
 let last=0,match;
 while((match=pattern.exec(text))){
  parts.push(text.slice(last,match.index));
  if(match[1]){const href=safeReportLink(match[2]);parts.push(href?<a key={match.index} href={href}>{match[1]}</a>:match[1]);}
  else if(match[3])parts.push(<strong key={match.index}>{match[3]}</strong>);
  else parts.push(<code key={match.index}>{match[4]}</code>);
  last=pattern.lastIndex;
 }
 parts.push(text.slice(last));return <>{parts}</>;
}
function Markdown({text}:{text:string}) {
 return <>{(markdownBlocks(text) as Block[]).map((block,i)=>{
  if(block.type==='heading')return block.level===3?<h3 key={i} id={block.id}><Inline text={block.text}/></h3>:<h4 key={i} id={block.id}><Inline text={block.text}/></h4>;
  if(block.type==='list'){const items=block.items.map((item:string,j:number)=><li key={j}><Inline text={item}/></li>);return block.ordered?<ol key={i}>{items}</ol>:<ul key={i}>{items}</ul>;}
  if(block.type==='table')return <div className="report-table-scroll" key={i} tabIndex={0} role="region" aria-label="Research data table"><table><thead><tr>{block.headers.map((cell:string,j:number)=><th scope="col" key={j}><Inline text={cell}/></th>)}</tr></thead><tbody>{block.rows.map((row:string[],j:number)=><tr key={j}>{row.map((cell,k)=><td key={k}><Inline text={cell}/></td>)}</tr>)}</tbody></table></div>;
  return <p key={i}><Inline text={block.text}/></p>;
 })}</>;
}
export default function LongFormResearchReport({organization,program,markdown,sources,donationUrl,modelVersion,modelUrl,minutes,modelLabel,sectionTitles={},sectionOrder=[]}:{organization:string;program:string;markdown:string;sources:Source[];donationUrl?:string;modelVersion:string;modelUrl:string;minutes:number;modelLabel:string;sectionTitles?:Record<string,string>;sectionOrder?:string[]}){
 const effortOrganization=organization==='HOPE Pacifica'?'HOPE: Healing, Overdose Prevention, and Education':organization;
 const earlierEffort=researchEffortSummary(researchEffort,effortOrganization,{...historicalEffort,...assignedEffort});
 const sections=(reportSections(markdown) as Section[]).map(section=>({...section,title:sectionTitles[section.id]??section.title}));
 if(sectionOrder.length){if(sectionOrder.length!==sections.length||new Set(sectionOrder).size!==sections.length||sectionOrder.some(id=>!sections.some(s=>s.id===id)))throw Error('Incomplete report section order');sections.sort((a,b)=>sectionOrder.indexOf(a.id)-sectionOrder.indexOf(b.id));}
 const groups=groupReportSections(sections,(contentsMap as Record<string,Record<string,string>>)[organization]) as {id:string;title:string;sections:Section[]}[];
 return <main className="givebetter charity-report">
  <header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header>
  <div className="report-reading-column">
   <header className="report-heading"><h1>{organization}</h1><p className="report-program">{program}</p>
    <details className="report-research-effort"><summary>Latest research: {minutes} minutes on {modelLabel}</summary><ul><li>v1: {earlierEffort.label.replace('Research time: ','')}</li><li>v2: {minutes} min on {modelLabel}</li></ul>{earlierEffort.estimated&&<p>Earlier research time was estimated before tracking began.</p>}</details>
    <p className="report-date">Updated: 11 September 2026</p>
    {donationUrl?<a className="report-donate" href={donationUrl} target="_blank" rel="noreferrer">Donate</a>:<p className="report-date">Donation route not verified.</p>}
   </header>
   <nav className="report-contents" aria-label="Table of Contents"><h2>Table of Contents</h2>{groups.map(group=>group.sections.length>1?<details className="report-contents-group" key={group.id}><summary><a data-toc-primary href={'#'+group.id}>{group.title}</a></summary><div>{group.sections.map(section=><a key={section.id} href={'#'+section.id}>{section.title.replace(/^\d+[.)]\s*/, '')}</a>)}</div></details>:<a data-toc-primary key={group.id} href={'#'+group.id}>{group.title}</a>)}<a data-toc-primary href="#sources">6. Sources</a></nav>
   <article><DonorReadiness organization={organization}/>{groups.map(group=><section key={group.id} id={group.id}><h2>{group.title}</h2>{group.sections.map(section=><section className="report-subsection" key={section.id} id={section.id}>{group.id!=='research-summary'&&<h3>{section.title.replace(/^\d+[.)]\s*/, '')}</h3>}<Markdown text={section.markdown}/></section>)}</section>)}
    <section id="sources"><h2>6. Sources</h2><ol className="report-sources">{sources.map(source=><li key={source.url}><a href={source.url}>{source.title}</a>. {source.publisher}. Published: {source.published}; retrieved: {source.retrieved}. {source.limit}</li>)}</ol></section>
   </article>
   <footer className="report-footer"><a href="/research">All research</a><p className="report-model-version">Cost-effectiveness model: <a href={modelUrl}>{modelVersion}</a></p><p>Independent public-source research. Not affiliated with GiveWell or the organization reviewed.</p></footer>
  </div>
 </main>;
}
