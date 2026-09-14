import type {EditionReport} from '@/lib/published-geography-reports';
import {editionReportPath,formatEditionMoney,reportPrice,expenseAverage} from '@/lib/geography-reports.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import {researchListDescription} from '@/lib/research-list-copy.mjs';
import styles from '@/app/research/research-index.module.css';
export default function EditionResearchTable({reports}:{reports:EditionReport[]}){
 return <table className={styles.table} data-research-table><thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th><th scope="col">Avg. annual expenses<br/>(3 years)</th></tr></thead><tbody>{reports.map(r=><tr key={r.organizationId}><th scope="row"><a className={styles.rowLink} href={canonicalBase+editionReportPath(r)}><strong>{r.organization}</strong><span>{researchListDescription(r.program)}</span></a></th><td><a href={canonicalBase+editionReportPath(r)} title={r.priceScope}>{formatEditionMoney(reportPrice(r))}</a></td><td className={styles.expenses}><a href={canonicalBase+editionReportPath(r)+'#annual-expenses'}>{formatEditionMoney(expenseAverage(r))}</a></td></tr>)}</tbody></table>;
}
