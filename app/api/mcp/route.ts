import {compareEstimates,getEstimate,registryIndex,searchEstimates,templates} from '@/lib/open-botec';

// Minimal stateless MCP server (Streamable HTTP, JSON responses only, no sessions).
// Add to a client as a remote server: https://givebetter.rhyslindmark.workers.dev/api/mcp
// (the ai.rhyslindmark.com proxy does not forward POST to this path).
type Rpc = {jsonrpc: '2.0'; id?: string | number | null; method: string; params?: Record<string, unknown>};

const str = {type: 'string'} as const;
const tools = [
  {name: 'search_estimates', description: 'Search cost-effectiveness estimates (BOTECs) by geography, cause area, intervention archetype or free text. Returns summaries with USD per 10 QALYs (p10/p50/p90), native-outcome cost, review tier and funding-room status.', inputSchema: {type: 'object', properties: {geo: {...str, description: 'geoId such as us-ca-san-francisco or us-il-chicago, or a place name'}, cause: {...str, description: 'causeArea such as overdose, chronic-disease, healthy-aging'}, archetype: str, q: str}}},
  {name: 'get_botec', description: 'Get one full estimate record: every input with its distribution, scope (universal/local/org), sources and retrieval dates, plus provenance, audits and conflict-of-interest fields.', inputSchema: {type: 'object', properties: {id: str}, required: ['id']}},
  {name: 'compare', description: 'Compare two or more estimates, sorted by simulated median USD per 10 QALYs, with warnings about non-comparable archetypes, draft status and unverified funding room.', inputSchema: {type: 'object', properties: {ids: {type: 'array', items: str, minItems: 2}}, required: ['ids']}},
  {name: 'list_templates', description: 'List intervention archetype templates, their formulas and which parameters are universal versus local. Use these to draft an estimate for a new organization or city.', inputSchema: {type: 'object', properties: {}}},
  {name: 'allocate', description: 'Suggest how to split a donation in a geography. Allocates only to estimates that are at least agent-reviewed and have verified funding room; otherwise returns the ranked candidates and says why nothing was allocated.', inputSchema: {type: 'object', properties: {amount: {type: 'number', minimum: 1}, geo: str}, required: ['amount']}},
];

function allocate(amount: number, geo?: string) {
  const ranked = searchEstimates({geo}).sort((a, b) => (a.usdPer10Qalys?.p50 ?? Infinity) - (b.usdPer10Qalys?.p50 ?? Infinity));
  const eligible = ranked.filter((r) => r.tier !== 'draft' && r.fundingRoom === 'verified');
  if (!eligible.length) return {amount, allocations: [], reason: 'No estimate in this geography is both independently reviewed and has verified funding room, so no allocation is offered. Candidates below are ranked for research priority, not for giving.', candidates: ranked};
  // Room caps are not yet modeled per record; give everything to the cheapest eligible estimate and say so.
  return {amount, allocations: [{id: eligible[0].id, usd: amount}], reason: 'All funds to the lowest simulated-median price among eligible estimates; per-record room caps are not yet enforced.', candidates: ranked};
}

function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'search_estimates': return {results: searchEstimates(args as Record<string, string>)};
    case 'get_botec': return getEstimate(String(args.id)) ?? {error: `No estimate with id ${args.id}`};
    case 'compare': return compareEstimates((args.ids as string[]) ?? []);
    case 'list_templates': return {templates};
    case 'allocate': return allocate(Number(args.amount), args.geo as string | undefined);
    default: return null;
  }
}

function handle(msg: Rpc) {
  const ok = (result: unknown) => ({jsonrpc: '2.0', id: msg.id ?? null, result});
  const err = (code: number, message: string) => ({jsonrpc: '2.0', id: msg.id ?? null, error: {code, message}});
  if (msg.id === undefined) return null; // notification
  switch (msg.method) {
    case 'initialize':
      return ok({protocolVersion: (msg.params?.protocolVersion as string) ?? '2025-06-18', capabilities: {tools: {}}, serverInfo: {name: 'givebetter-open-botec', version: registryIndex().version}, instructions: 'Estimates are BOTECs with very wide uncertainty. Report p10/p50/p90, the review tier and funding-room status alongside any price. Draft records are unaudited.'});
    case 'ping': return ok({});
    case 'tools/list': return ok({tools});
    case 'tools/call': {
      const result = callTool(String(msg.params?.name), (msg.params?.arguments as Record<string, unknown>) ?? {});
      if (result === null) return err(-32602, `Unknown tool ${msg.params?.name}`);
      return ok({content: [{type: 'text', text: JSON.stringify(result, null, 2)}], structuredContent: result});
    }
    default: return err(-32601, `Method not found: ${msg.method}`);
  }
}

const cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, mcp-protocol-version, mcp-session-id', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'};

export async function POST(request: Request) {
  let body: Rpc | Rpc[];
  try { body = await request.json(); } catch { return Response.json({jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}}, {status: 400, headers: cors}); }
  const replies = (Array.isArray(body) ? body : [body]).map(handle).filter(Boolean);
  if (!replies.length) return new Response(null, {status: 202, headers: cors});
  return Response.json(Array.isArray(body) ? replies : replies[0], {headers: cors});
}

export async function GET() {
  return Response.json({error: 'This MCP endpoint accepts JSON-RPC over POST (stateless Streamable HTTP). Docs: https://ai.rhyslindmark.com/givebetter/agents'}, {status: 405, headers: {...cors, Allow: 'POST, OPTIONS'}});
}

export async function OPTIONS() {
  return new Response(null, {status: 204, headers: cors});
}
