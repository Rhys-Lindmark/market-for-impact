import {getEditionReport} from '@/lib/published-geography-reports';
export async function GET(_request:Request,{params}:{params:Promise<{edition:string;slug:string}>}){
 const p=await params,r=getEditionReport(p.edition,p.slug);
 if(!r)return Response.json({error:'Report not found'},{status:404});
 return Response.json({edition:r.edition,organization:r.organization,organizationId:r.organizationId,boundaryVersion:r.boundaryVersion,updated:r.updated,model:r.model,sources:r.sources});
}
