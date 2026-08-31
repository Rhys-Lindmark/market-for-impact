type DeepReview = {
  organization: { name: string; donationUrl: string };
  decision: { state: string; summary: string; costEffectiveness: string; roomForMoreFunding: string };
  nativeScale: Array<{ value: string; label: string; period: string; semantics: string }>;
  financialContext: { summary: string; boundary: string };
  evidence: Array<{ key: string; design: string; population: string; result: string; transfer: string }>;
  model: { nativeOutcome: string; missingInputs: string[]; qalyBoundary: string };
  reservations: string[];
  sources: Array<{ url: string; sourceType: string; published: string; title: string; publisher: string; retrieved: string }>;
};

export default function SfDeepReview({ review, number, id, evidenceHeadline, workbookUrl }: { review: DeepReview; number: number; id: string; evidenceHeadline: string; workbookUrl: string }) {
  const titleId = `${id}-title`;
  return (
    <section className="sf-poh-review sf-deep-review" id={id} aria-labelledby={titleId}>
      <header><div><p className="kicker">DEEP DIVE {String(number).padStart(2, '0')} · INITIAL REVIEW</p><h2 id={titleId}>{review.organization.name}</h2><p>{review.decision.summary}</p></div><dl><div><dt>Decision state</dt><dd>{review.decision.state}</dd></div><div><dt>Cost-effectiveness</dt><dd>{review.decision.costEffectiveness}</dd></div><div><dt>Funding room</dt><dd>{review.decision.roomForMoreFunding}</dd></div></dl></header>
      <div className="sf-poh-scale sf-deep-scale">{review.nativeScale.map((row) => <article key={row.label}><strong>{row.value}</strong><span>{row.label}</span><p>{row.period} · {row.semantics}</p></article>)}</div>
      <section className="sf-poh-evidence sf-deep-evidence"><header><span>WHAT THE BEST REVIEWED EVIDENCE SAYS</span><h3>{evidenceHeadline}</h3></header><div>{review.evidence.map((item) => <article key={item.key}><span>{item.design}</span><h4>{item.population}</h4><p>{item.result}</p><aside><strong>Transfer boundary</strong>{item.transfer}</aside></article>)}</div></section>
      <div className="sf-poh-model sf-deep-model"><section><span>COST-EFFECTIVENESS MODEL</span><h3>Not estimable—and why.</h3><p>The first native outcome would be <strong>{review.model.nativeOutcome.toLowerCase()}</strong>. The reviewed public record cannot yet price it for a marginal gift.</p><ol>{review.model.missingInputs.map((item) => <li key={item}>{item}</li>)}</ol><strong>{review.model.qalyBoundary}</strong><a href={workbookUrl} target="_blank" rel="noreferrer">Open the blank model ↗</a></section><section><span>HOW WE COULD BE WRONG</span><h3>Reservations stay visible.</h3><ul>{review.reservations.map((item) => <li key={item}>{item}</li>)}</ul><p><strong>Financial context.</strong> {review.financialContext.summary} {review.financialContext.boundary}</p></section></div>
      <footer><div>{review.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.sourceType} · {source.published}</span><strong>{source.title}</strong><small>{source.publisher} · retrieved {source.retrieved}</small></a>)}</div><a className="sf-poh-donate sf-deep-donate" href={review.organization.donationUrl} target="_blank" rel="noreferrer"><span>Giving route, not an MFI recommendation</span><strong>{review.organization.name} donation page ↗</strong></a></footer>
    </section>
  );
}
