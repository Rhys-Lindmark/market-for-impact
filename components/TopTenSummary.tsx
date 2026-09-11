import summaries from '@/data/top-ten-summaries.json';
import readiness from '@/data/donor-readiness.json';

export function hasTopTenSummary(organization:string) {
 return readiness.reviews.some(row=>row.names.includes(organization)&&row.slug in summaries);
}

export default function TopTenSummary({organization,longForm=false}:{organization:string;longForm?:boolean}) {
 const row=readiness.reviews.find(item=>item.names.includes(organization));
 if(!row)return null;
 const summary=(summaries as Record<string,{name:string;intro:string[];recommendation:string;reasons:string[];reservations:string[];cost:string[];monitoring:string;qualitative:string;sources:string[]}>)[row.slug];
 if(!summary)return null;
 const ids=longForm?{what:'research-what',cost:'research-cost',monitoring:'research-monitoring',qualitative:'research-qualitative'}:{what:'program',cost:'cost-effectiveness',monitoring:'evidence',qualitative:'reservations'};
 return <div data-top-ten-summary={row.slug}>
  <p data-summary-intro><strong>What do they do?</strong> {summary.intro.join(' ')} <a href={'#'+ids.what}>More</a></p>
  <p><strong>{summary.recommendation}</strong></p>
  <ul data-summary-reasons>{summary.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>
  <p><strong>Our main reservations about {summary.name} are:</strong></p>
  <ul data-summary-reservations>{summary.reservations.map(reason=><li key={reason}>{reason}</li>)}</ul>
  <p><strong>What do you get for your dollar?</strong></p>
  <div data-summary-cost>{summary.cost.map((paragraph,index)=><p key={paragraph}>{paragraph} {index===0&&<a href={summary.sources[0]}>Source</a>}{index===summary.cost.length-1&&<a href={'#'+ids.cost}>More</a>}</p>)}</div>
  <p><strong>What information has {summary.name} shared about its program?</strong></p>
  <p data-summary-monitoring>{summary.monitoring} <a href={'#'+ids.monitoring}>More</a></p>
  <p><strong>What is GiveBetter’s qualitative assessment of {summary.name}?</strong></p>
  <p data-summary-qualitative>{summary.qualitative} <a href={'#'+ids.qualitative}>More</a></p>
 </div>;
}
