import review from '@/data/donor-readiness.json';

export default function DonorReadiness({organization}:{organization:string}) {
  const item=review.reviews.find(row=>row.names.includes(organization));
  if(!item)return null;
  return <p data-funding-assessment>{item.reason}</p>;
}
