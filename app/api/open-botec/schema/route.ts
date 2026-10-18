import {jsonHeaders,schemas} from '@/lib/open-botec';

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get('name') ?? 'botec';
  const schema = schemas[name];
  if (!schema) return Response.json({error: 'Unknown schema; use botec, template or parameters.'}, {status: 404, headers: jsonHeaders});
  return Response.json(schema, {headers: jsonHeaders});
}
