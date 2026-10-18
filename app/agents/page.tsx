import type {Metadata} from 'next';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import {mcpUrl,openBotecBase,registryIndex,sourceRepo,sourceTree} from '@/lib/open-botec';
import '../givebetter.css';
import '../edition.css';

const title = 'GiveBetter for agents';
const description = 'Point an AI agent at GiveBetter: cost-effectiveness estimates for nonprofits as JSON, llms.txt and an MCP server, plus an open repository agents can add estimates to by pull request.';
export const metadata: Metadata = {title, description, alternates: {canonical: canonicalBase + '/agents'}, openGraph: {title, description, images: []}, twitter: {title, description, images: []}};

const fmt = (n: number | null | undefined) => (n == null ? 'n/a' : '$' + (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : Math.round(n).toLocaleString('en-US')));

export default function AgentsPage() {
  const index = registryIndex();
  const example = index.estimates[0];
  const mcpConfig = JSON.stringify({mcpServers: {givebetter: {type: 'http', url: mcpUrl}}}, null, 2);
  const jsonLd = {'@context': 'https://schema.org', '@type': 'Dataset', name: 'GiveBetter open BOTEC repository', description: index.description, url: canonicalBase + '/agents', isAccessibleForFree: true, distribution: [{'@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: openBotecBase}, {'@type': 'DataDownload', encodingFormat: 'text/plain', contentUrl: canonicalBase + '/llms.txt'}]};
  return <div className="givebetter"><EditionMasthead/><main className="gb-edition gb-agents">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
    <h1>Build with GiveBetter</h1>
    <p className="gb-edition-lead">Give an agent one starting point, query cost-effectiveness estimates as JSON or over MCP, or add estimates for your own city by pull request.</p>
    <div className="gb-agent-box"><span>Point an agent here</span><a className="gb-agent-url" href={canonicalBase + '/llms.txt'}>{canonicalBase}/llms.txt</a><p>A plain-text index of the endpoints, the MCP server, the estimate schema, how to contribute, and every current estimate.</p></div>

    <h2>What is here</h2>
    <p>{index.counts.estimates} estimates across {index.counts.geographies} geographies, built from {index.counts.templates} intervention templates. Each estimate is keyed by organization, program, intervention archetype, geography, year and model version. Native outcomes come first (deaths averted, kg-years of weight loss, course places); the QALY conversion is a separate, versioned layer. Every input is a p10/p50/p90 distribution with sources and retrieval dates, labeled universal (from the literature) or local (looked up per city).</p>
    <p>This is an early, open repository alongside GiveBetter&rsquo;s published research. Every record is currently a <strong>draft</strong>: CI-valid but not independently audited. Report the range, tier and funding-room status with any price.</p>

    <h2>Read</h2>
    <ul>
      <li><a href={openBotecBase}><code>GET /api/open-botec</code></a>: registry index; add <code>?geo=</code>, <code>&amp;cause=</code>, <code>&amp;archetype=</code> or <code>&amp;q=</code> to search</li>
      {example && <li><a href={example.url}><code>GET /api/open-botec/estimate?id=…</code></a>: one full record</li>}
      <li><code>GET /api/open-botec/compare?ids=a,b</code>: sorted comparison with comparability warnings</li>
      <li><a href={openBotecBase + '/templates'}><code>GET /api/open-botec/templates</code></a> and <a href={openBotecBase + '/schema?name=botec'}><code>/schema?name=botec</code></a></li>
    </ul>
    <pre>{`curl '${openBotecBase}?geo=us-il-chicago'`}</pre>

    <h2>Connect over MCP</h2>
    <p>A stateless remote MCP server with five tools: <code>search_estimates</code>, <code>get_botec</code>, <code>compare</code>, <code>list_templates</code> and <code>allocate</code>. <code>allocate</code> only splits money across estimates that are independently reviewed and have verified funding room; today none qualify, so it returns ranked research candidates and says why.</p>
    <pre>{mcpConfig}</pre>
    <pre>{`claude mcp add --transport http givebetter ${mcpUrl}`}</pre>

    <h2>Contribute</h2>
    <p>The repository lives in <a href={sourceTree}><code>docs/open-botec</code></a>. Agents and people add work by pull request:</p>
    <ol>
      <li><strong>A city:</strong> copy a template&rsquo;s local parameters into <code>parameters/&lt;geoId&gt;/&lt;archetype&gt;.json</code> with sources.</li>
      <li><strong>An organization:</strong> write <code>estimates/&lt;geoId&gt;/&lt;slug&gt;.recipe.json</code>, then run <code>node docs/open-botec/tools/evaluate.mjs --all</code>.</li>
      <li><strong>An archetype:</strong> add <code>templates/&lt;archetype&gt;.v1.json</code> that reproduces an existing published model.</li>
    </ol>
    <p>CI runs <code>node --test docs/open-botec/tools/check.test.mjs</code>. Read the <a href={sourceTree + '/agents.md'}>contribution protocol</a> and the <a href={sourceTree + '/README.md'}>governance rules</a>, including how organizations submitting estimates about themselves are handled.</p>

    <h2>Current estimates</h2>
    <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Open BOTEC estimates"><thead><tr><th scope="col">Organization</th><th scope="col">Geography</th><th scope="col">USD per 10 QALYs (p10 / p50 / p90)</th><th scope="col">Tier</th></tr></thead><tbody>
      {index.estimates.map((e) => <tr key={e.id}><th scope="row"><a href={e.url}>{e.organization}</a><br/><small>{e.archetypeId}</small></th><td>{e.geography}</td><td>{fmt(e.usdPer10Qalys?.p10)} / {fmt(e.usdPer10Qalys?.p50)} / {fmt(e.usdPer10Qalys?.p90)}</td><td>{e.tier}</td></tr>)}
    </tbody></table></div>
    <p>Chicago records come from a <a href={sourceTree + '/localization-test.md'}>localization test</a> that applied San Francisco templates with web lookups only; read it before relying on them.</p>
    <footer><a href={canonicalBase + '/all'}>GiveBetter</a> · <a href={sourceRepo}>Source on GitHub</a></footer>
  </main></div>;
}
