import summaries from '@/data/report-summary-editorial.json';
import TopTenSummary,{hasTopTenSummary} from './TopTenSummary';

export default function LongFormSummary({organization}:{organization:string}) {
 if(hasTopTenSummary(organization))return <TopTenSummary organization={organization} longForm/>;
 const summary=(summaries as Record<string,{intro:string;reasons:string[];reservations:string[];cost:string}>)[organization];
 if(!summary)throw new Error('Missing editorial summary: '+organization);
 return <>
  <p><strong>What do they do?</strong> {summary.intro} <a href="#research-what">More</a></p>
  <p><strong>Why this approach interests us</strong></p>
  <ul>{summary.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>
  <p><strong>Our main reservations</strong></p>
  <ul>{summary.reservations.map(reason=><li key={reason}>{reason}</li>)}</ul>
  <p><strong>What do you get for your dollar?</strong> {summary.cost} <a href="#research-cost">More</a></p>
 </>;
}
