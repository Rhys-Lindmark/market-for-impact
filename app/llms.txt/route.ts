import {canonicalBase} from '@/lib/geography-editions.mjs';
import {mcpUrl,openBotecBase,registryIndex,sourceRepo,sourceTree} from '@/lib/open-botec';

// Plain-text entry point for agents (llmstxt.org format). Linked from /all and /agents.
export async function GET() {
  const index = registryIndex();
  const lines = [
    '# GiveBetter',
    '',
    '> GiveBetter prices nonprofits by what a marginal donation buys: dollars per 10 quality-adjusted life years (QALYs), with native outcomes, sources and research provenance for every estimate. It covers San Francisco in depth plus other U.S. cities. This file is the starting point for AI agents that read or contribute estimates.',
    '',
    'Treat every price as a back-of-the-envelope estimate (BOTEC). Always report the p10/p50/p90 range, the review tier (draft, agent-reviewed, human-reviewed) and funding-room status alongside a price. Draft records have no independent audit. A low price with unverified funding room is not a giving recommendation.',
    '',
    `Open BOTEC repository: ${index.counts.estimates} estimates, ${index.counts.templates} intervention templates, ${index.counts.geographies} geographies.`,
    '',
    '## Read the data',
    '',
    `- [Registry index (JSON)](${openBotecBase}): every estimate summary, templates and endpoint list`,
    `- [Search](${openBotecBase}?geo=us-ca-san-francisco&cause=overdose): filter by geo, cause, archetype or q`,
    `- [One full estimate](${openBotecBase}/estimate?id=${encodeURIComponent(index.estimates[0]?.id ?? '')}): inputs, distributions, sources, provenance, conflicts of interest`,
    `- [Compare](${openBotecBase}/compare?ids=${index.estimates.slice(0, 2).map((e) => encodeURIComponent(e.id)).join(',')}): sorted, with comparability warnings`,
    `- [Templates](${openBotecBase}/templates): intervention archetypes with universal versus local parameters`,
    `- [Estimate schema](${openBotecBase}/schema?name=botec): JSON Schema (draft-07) for one record`,
    '',
    '## MCP',
    '',
    `- [MCP server](${mcpUrl}): stateless Streamable HTTP. Tools: search_estimates, get_botec, compare, list_templates, allocate`,
    '',
    '## Contribute',
    '',
    `- [Contribution protocol for agents](${sourceTree}/agents.md): how to add a template, a city parameter file or an estimate by pull request`,
    `- [Governance and anti-gaming](${sourceTree}/README.md): CI validation, adversarial audits, self-submitted records`,
    `- [Localization test](${sourceTree}/localization-test.md): SF templates applied to Chicago, and where it broke`,
    `- [Source repository](${sourceRepo})`,
    '',
    '## Human-readable research',
    '',
    `- [Agents and developers](${canonicalBase}/agents)`,
    `- [Cities and regions](${canonicalBase}/all)`,
    `- [San Francisco research](${canonicalBase}/san-francisco)`,
    `- [Compare the top four across cities](${canonicalBase}/compare/cities)`,
    '',
    '## Estimates',
    '',
    ...index.estimates.map((e) => `- [${e.organization}: ${e.program} (${e.geography}, ${e.tier})](${e.url}): USD per 10 QALYs p50 ${e.usdPer10Qalys?.p50?.toLocaleString('en-US') ?? 'n/a'}`),
    '',
  ];
  return new Response(lines.join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600', 'Access-Control-Allow-Origin': '*'}});
}
