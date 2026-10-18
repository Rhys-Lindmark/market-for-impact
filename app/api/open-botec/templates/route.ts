import {jsonHeaders,templates} from '@/lib/open-botec';

export async function GET() {
  return Response.json({templates}, {headers: jsonHeaders});
}
