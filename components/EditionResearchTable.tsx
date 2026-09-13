import type {EditionReport} from '@/lib/published-geography-reports';
import {editionReportPath,formatEditionMoney,formatAnnualExpense,reportPrice,expenseAverage} from '@/lib/geography-reports.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';
export default function EditionResearchTable({reports}:{reports:EditionReport[]}){
 return <div className="gb-edition-table-wrap"><table className="gb-edition-table"><thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th><th scope="col">Avg. annual expenses (3 years)</th></tr></thead><tbody>{reports.map(r=><tr key={r.organizationId}><th scope="row"><a href={canonicalBase+editionReportPath(r)}>{r.organization}</a><p>{r.program}</p></th><td>{formatEditionMoney(reportPrice(r))}{reportPrice(r)!==null&&r.priceScope&&<small className="gb-price-scope">{r.priceScope}</small>}</td><td>{formatEditionMoney(expenseAverage(r))}{r.annualExpenses.length>0&&<details><summary>Years and sources</summary>{r.annualExpenses.map(y=><p key={y.year}>{y.year}: {formatAnnualExpense(y)}, {y.entity}. <a href={r.sources.find(s=>s.id===y.sourceId)?.url}>Source</a></p>)}</details>}</td></tr>)}</tbody></table></div>;
}
