import review from '@/data/donor-readiness.json';

export default function DonorReadiness({organization}:{organization:string}) {
  const item=review.reviews.find(row=>row.names.includes(organization));
  if(!item)return null;
  return <aside className="report-donor-readiness" aria-label="Giving assessment">
    <p><strong>{item.status}.</strong> {item.reason}</p>
    <details><summary>Before a major gift</summary><p>We have not verified capacity to absorb a $10 million gift at the modeled cost-effectiveness. A decision requires a specific spending plan, existing funding and reserve restrictions, additional delivery capacity, and measurable milestones. Assessment: 11 September 2026.</p></details>
  </aside>;
}
