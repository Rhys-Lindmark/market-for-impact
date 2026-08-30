import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationDetail } from '@/db/details';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const loadOrganization = cache((slug: string) => getOrganizationDetail(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const organization = await loadOrganization((await params).slug);
  if (!organization) return { title: 'Organization not found — Market for Impact' };
  const title = `${organization.organization.canonical_name} — Market for Impact`;
  const description = `Source-traceable grants and evaluations for ${organization.organization.canonical_name}.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { card: 'summary', title, description, images: [] },
  };
}

function relationshipLabel(value: string) {
  if (value === 'received') return 'Received grants';
  if (value === 'advised') return 'Advised grants';
  return 'Originated grants';
}

export default async function OrganizationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const result = await loadOrganization((await params).slug);
  if (!result) notFound();
  const activeRelationships = result.relationships.filter((relationship) => relationship.summary.count > 0);

  return (
    <main className="detail-shell organization-detail">
      <header className="detail-topbar">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></Link>
        <Link className="detail-back" href="/#opportunities">← Back to the market</Link>
      </header>

      <section className="detail-hero organization-hero">
        <p className="kicker">ORGANIZATION · {result.organization.organization_type.replaceAll('-', ' ').toUpperCase()}</p>
        <h1>{result.organization.canonical_name}</h1>
        <p className="detail-deck">A cross-source view of this organization’s disclosed roles, grants, and current evaluator evidence. Totals include only published row-level amounts.</p>
        <div className="organization-actions">
          {result.organization.website_url && <a className="primary-button" href={result.organization.website_url} target="_blank" rel="noreferrer">Organization website ↗</a>}
          <span>Stable record: {result.organization.slug}</span>
        </div>
      </section>

      <section className="organization-summary" aria-label="Organization grant relationships">
        {result.relationships.map((relationship) => (
          <div key={relationship.relationship}>
            <span>{relationshipLabel(relationship.relationship)}</span>
            <strong>{integer.format(relationship.summary.count)}</strong>
            <p>{compactMoney.format(relationship.summary.known_amount_usd)} in published row amounts · {integer.format(relationship.summary.missing_amount_count)} missing amounts</p>
          </div>
        ))}
      </section>

      {result.assessments.length > 0 && <section className="detail-section assessment-section">
        <div><p className="kicker">EVALUATOR EVIDENCE</p><h2>Current assessments.</h2></div>
        <div className="assessment-list">
          {result.assessments.map((assessment, index) => (
            <article key={`${String(assessment.source_url)}-${index}`}>
              <div><span>{String(assessment.evaluator_name)}</span><b>{String(assessment.recommendation_status).replaceAll('-', ' ')}</b></div>
              <h3>{String(assessment.native_metric_value) === 'null' ? 'Native metric not published' : `${money.format(Number(assessment.native_metric_value))} / life saved`}</h3>
              <p>{String(assessment.summary ?? 'No assessment summary published.')}</p>
              <dl>
                <div><dt>Evidence</dt><dd>{String(assessment.evidence_level ?? 'Not classified')}</dd></div>
                <div><dt>Funding room</dt><dd>{assessment.funding_room_usd == null ? String(assessment.funding_room_period ?? 'Rolling review') : money.format(Number(assessment.funding_room_usd))}</dd></div>
                <div><dt>Model</dt><dd>{String(assessment.model_version ?? 'Not published')}</dd></div>
              </dl>
              <a href={String(assessment.source_url)} target="_blank" rel="noreferrer">Assessment source ↗</a>
            </article>
          ))}
        </div>
      </section>}

      {activeRelationships.map((relationship) => (
        <section className="detail-section relationship-section" key={relationship.relationship}>
          <div className="relationship-heading">
            <div><p className="kicker">{relationshipLabel(relationship.relationship).toUpperCase()}</p><h2>{relationship.relationship === 'received' ? 'Where funding arrived.' : 'Where funding flowed.'}</h2></div>
            <p>Showing the newest {integer.format(relationship.grants.length)} of {integer.format(relationship.summary.count)} current source records. Known row amounts total {money.format(relationship.summary.known_amount_usd)}.</p>
          </div>
          <div className="organization-grants">
            {relationship.grants.map((grant) => (
              <Link className="organization-grant" href={grant.path} key={`${grant.source}-${grant.sourceRecordId}`}>
                <span>{grant.provenance.publisher} · {grant.awardDate || grant.decisionDate ? date.format(new Date((grant.awardDate ?? grant.decisionDate ?? 0) * 1000)) : 'Date not published'}</span>
                <h3>{grant.title}</h3>
                <p>{grant.purpose ?? 'Purpose not published.'}</p>
                <div><strong>{grant.amountUsd == null ? 'Amount not published' : money.format(grant.amountUsd)}</strong><b>View record →</b></div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {activeRelationships.length === 0 && result.assessments.length === 0 && <section className="detail-section empty-detail"><h2>No linked ledger records yet.</h2><p>This canonical organization exists in the source graph, but no current grant or assessment row points to it.</p></section>}
      <footer><strong>Market for Impact</strong><p>Published totals are not independently verified payment totals.</p><Link href="/#methodology">Methodology →</Link></footer>
    </main>
  );
}
