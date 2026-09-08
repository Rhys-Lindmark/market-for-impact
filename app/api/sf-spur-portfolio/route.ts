import data from '@/data/san-francisco/spur-portfolio-cea-v3.json';
import {spurPortfolioModel} from '@/lib/spur-portfolio-model.mjs';
export function GET() {
  return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...spurPortfolioModel(s,data.budget.totalUsd)}))});
}
