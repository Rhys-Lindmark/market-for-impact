import {impactNode} from '@/components/ImpactMetric';
import {impactMetric} from '@/lib/impact-metric.mjs';
import type {EditionReport} from '@/lib/published-geography-reports';
import {editionReportPath,formatEditionMoney,formatEditionReportPrice,expenseAverage} from '@/lib/geography-reports.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import {researchListDescription} from '@/lib/research-list-copy.mjs';
import styles from '@/app/research/research-index.module.css';
import {editionAnnualBudget,annualBudgetLabel} from '@/lib/annual-budget-supplements.mjs';
export default function EditionResearchTable({reports}:{reports:EditionReport[]}){
 return impactNode(<table className={styles.table} data-research-table><thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th><th scope="col">Annual budget</th></tr></thead><tbody>{reports.map(r=>{const budget=editionAnnualBudget(r);return <tr key={r.organizationId}><th scope="row"><a className={styles.rowLink} href={canonicalBase+editionReportPath(r)}><strong>{r.organization}</strong><span>{researchListDescription(r.program)}</span></a></th><td><a href={canonicalBase+editionReportPath(r)} title={r.priceScope}>{formatEditionReportPrice(r)}</a></td><td className={styles.expenses}><a href={canonicalBase+editionReportPath(r)+'#annual-expenses'} data-annual-budget={budget?.amountUSD} data-budget-kind={budget?.kind}>{annualBudgetLabel(budget)}</a></td></tr>;})}</tbody></table>);
}
