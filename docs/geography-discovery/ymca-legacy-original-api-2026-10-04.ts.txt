import {ymcaPortfolio,ymcaPortfolioModel} from '@/lib/ymca-portfolio-model.mjs';
export function GET(){return Response.json({model:ymcaPortfolio,evaluated:ymcaPortfolio.scenarios.map(s=>({id:s.id,...ymcaPortfolioModel(s)}))});}
