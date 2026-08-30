import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <Link className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></Link>
      <div><p className="kicker">RECORD NOT FOUND</p><h1>This market record does not exist.</h1><p>The source key or stable record identifier may be invalid, or the upstream record may no longer be current.</p><Link className="primary-button" href="/">Return to the market →</Link></div>
    </main>
  );
}
