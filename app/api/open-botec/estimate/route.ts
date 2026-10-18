import {getEstimate,jsonHeaders} from '@/lib/open-botec';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const record = getEstimate(id);
  if (!record) return Response.json({error: `No estimate with id "${id}". List ids at /givebetter/api/open-botec.`}, {status: 404, headers: jsonHeaders});
  return Response.json(record, {headers: jsonHeaders});
}
