import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getGrantDetail } from '@/db/details';
import { isGrantSourceKey, organizationPath } from '@/db/detail-contract';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

type PageParams = { source: string; recordId: string };

const loadGrant = cache(async ({ source, recordId }: PageParams) => {
  if (!isGrantSourceKey(source)) return null;
  return getGrantDetail(source, recordId);
});

function formatDate(value: number | null) {
  return value ? date.format(new Date(value * 1000)) : 'Not published';
}

function tagList(values: string[]) {
  return values.length ? values.join(' · ') : 'Not published';
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const grant = await loadGrant(await params);
  if (!grant) return { title: 'Grant not found — Market for Impact' };
  const title = `${grant.title} — Market for Impact`;
  const description = (grant.purpose ?? `Source-traceable ${grant.provenance.publisher} grant record.`).slice(0, 180);
  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { card: 'summary', title, description, images: [] },
  };
}

export default async function GrantDetailPage({ params }: { params: Promise<PageParams> }) {
  const grant = await loadGrant(await params);
  if (!grant) notFound();
  const names = grant.recipient?.name ? [grant.recipient.name] : grant.recipients;
  const amount = grant.amountUsd == null ? 'Amount not published' : money.format(grant.amountUsd);

  return (
    <main className="detail-shell">
      <header className="detail-topbar">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></Link>
        <Link className="detail-back" href="/#coefficient-market">← Back to the market</Link>
      </header>

      <article>
        <section className="detail-hero">
          <p className="kicker">GRANT RECORD · {grant.provenance.publisher.toUpperCase()}</p>
          <h1>{grant.title}</h1>
          <p className="detail-deck">{grant.purpose ?? 'The publisher does not provide a project description for this record.'}</p>
          <div className="detail-metrics">
            <div><span>Published amount</span><strong>{amount}</strong><p>{grant.amountUsd == null ? 'No amount is inferred from fund totals or application caps.' : `${grant.currency ?? 'USD'} amount reported by the source.`}</p></div>
            <div><span>Status semantics</span><strong>{grant.status}</strong><p>Publication does not independently prove payment.</p></div>
            <div><span>Award or decision date</span><strong>{formatDate(grant.awardDate ?? grant.decisionDate)}</strong><p>{grant.awardDate || grant.decisionDate ? 'Normalized to a UTC calendar date or month.' : 'The row exposes no award or decision date.'}</p></div>
          </div>
        </section>

        <section className="detail-section detail-grid-section">
          <div>
            <p className="kicker">WHO AND WHAT</p>
            <h2>Parties and purpose.</h2>
          </div>
          <dl className="detail-facts">
            <div><dt>Recipient or team</dt><dd>{grant.recipientOrganizations.length
              ? grant.recipientOrganizations.map((recipient, index) => <span key={recipient.slug}>{index > 0 && ' · '}<Link href={organizationPath(recipient.slug)}>{recipient.sourceName} →</Link></span>)
              : grant.recipient?.slug ? <Link href={organizationPath(grant.recipient.slug)}>{grant.recipient.name} →</Link>
                : names.length ? names.join(' · ') : 'Not published'}</dd></div>
            <div><dt>Originating funder</dt><dd>{grant.originatingFunder?.slug ? <Link href={organizationPath(grant.originatingFunder.slug)}>{grant.originatingFunder.name} →</Link> : 'Not published'}</dd></div>
            <div><dt>Adviser or administrator</dt><dd>{grant.advisingFunder?.slug ? <Link href={organizationPath(grant.advisingFunder.slug)}>{grant.advisingFunder.name} →</Link> : 'Not published'}</dd></div>
            <div><dt>Cause</dt><dd>{grant.cause || 'Not classified'}</dd></div>
            <div><dt>Intervention</dt><dd>{grant.intervention ?? 'Not published'}</dd></div>
            <div><dt>Geography</dt><dd>{grant.geography ?? tagList(grant.countries)}</dd></div>
            <div><dt>Focus areas</dt><dd>{tagList(grant.focusAreas.length ? grant.focusAreas : grant.topics)}</dd></div>
            <div><dt>Listed funds</dt><dd>{tagList(grant.listedFunds)}</dd></div>
          </dl>
        </section>

        <section className="detail-section source-panel">
          <div><p className="kicker">SOURCE TRAIL</p><h2>Trace the claim.</h2></div>
          <div className="source-trail">
            <div><span>Publisher</span><strong>{grant.provenance.publisher}</strong></div>
            <div><span>Ledger</span><a href={grant.provenance.url} target="_blank" rel="noreferrer">{grant.provenance.title} ↗</a></div>
            <div><span>Source record</span>{grant.sourceUrl ? <a href={grant.sourceUrl} target="_blank" rel="noreferrer">Open the publisher’s record ↗</a> : <strong>Record URL not published</strong>}</div>
            <div><span>Retrieved</span><strong>{formatDate(grant.provenance.retrievedAt)}</strong></div>
          </div>
          <p className="coverage-note"><strong>Coverage note.</strong> {grant.provenance.coverageNote ?? 'No additional publisher coverage note is available.'}</p>
          {grant.groupedGrant && <p className="coverage-note"><strong>Grouped record.</strong> The publisher identifies this row as a grouped grant, so it may represent more than one underlying award.</p>}
        </section>
      </article>
      <footer><strong>Market for Impact</strong><p>Source-traceable philanthropy infrastructure.</p><Link href="/#methodology">Methodology →</Link></footer>
    </main>
  );
}
