import {compareEstimates,jsonHeaders} from '@/lib/open-botec';

export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length < 2) return Response.json({error: 'Pass at least two comma-separated ids.'}, {status: 400, headers: jsonHeaders});
  return Response.json(compareEstimates(ids.slice(0, 20)), {headers: jsonHeaders});
}
