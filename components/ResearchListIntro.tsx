import {impactMetric,impactUnitExplanation} from '@/lib/impact-metric.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import styles from '@/app/research/research-index.module.css';

export default function ResearchListIntro({label,location=label,shortlistHref}:{label:string;location?:string;shortlistHref:string}){
 return <section className={styles.intro}>
  <h1>GiveBetter x {label} Research</h1>
  <p>Estimated {impactMetric().priceLabel} in {location}. {impactUnitExplanation}</p>
  <p className={styles.caveat}>Sorted by modeled cost, not recommendation strength. These are uncertain research estimates, not verified donation offers. Cost boundaries differ; see each report before comparing.</p>
  <p><a href={shortlistHref}>Our giving shortlist</a> · <a href={canonicalBase+'/research/city-theory'}>What we learned across all reports</a></p>
 </section>;
}
