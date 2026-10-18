import {jsonHeaders,registryIndex,searchEstimates} from '@/lib/open-botec';

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  if (!['geo', 'cause', 'archetype', 'q'].some((k) => p.has(k))) return Response.json(registryIndex(), {headers: jsonHeaders});
  return Response.json({results: searchEstimates({geo: p.get('geo'), cause: p.get('cause'), archetype: p.get('archetype'), q: p.get('q')})}, {headers: jsonHeaders});
}
