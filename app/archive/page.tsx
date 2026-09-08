import type { Metadata } from 'next';
import ArchiveMarket from '../ArchiveMarket';

export const metadata: Metadata = { title: 'Cross-cause research archive — Market for Impact', description: 'The preserved grant ledgers, evaluator comparisons, and cross-cause research.' };
export default function ArchivePage() { return <><aside style={{ padding: '16px 4vw', background: '#fff', color: '#203f4a', fontSize: 16 }}>Cross-cause research archive · Sources retain their original snapshot dates. <a href="https://ai.rhyslindmark.com/givebetter">Our San Francisco picks →</a></aside><ArchiveMarket /></>; }
