import data from '@/data/san-francisco/large-bay-programs-v1.json';
import {foodAccessModel,benefitAccessModel,foodPharmacyModel} from '@/lib/large-bay-impact-model.mjs';
export function GET(request:Request){const row=data.find(r=>r.slug===new URL(request.url).searchParams.get('slug'));if(!row)return Response.json({error:'Unknown program'},{status:404});const calc=row.calculator==='food'?foodAccessModel:row.calculator==='benefits'?benefitAccessModel:foodPharmacyModel;return Response.json({...row,evaluatedScenarios:row.scenarios.map(s=>({...s,...calc(s)}))});}
