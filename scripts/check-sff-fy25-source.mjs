import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const source = JSON.parse(await fs.readFile(new URL('../data/san-francisco/sff-fy25-grantee-totals-source.json', import.meta.url), 'utf8'));
const response = await fetch(source.source.pdfUrl, { headers: { 'User-Agent': 'Market-for-Impact source monitor' }, redirect: 'follow' });
if (!response.ok) throw new Error(`SFF PDF returned HTTP ${response.status}.`);
const bytes = Buffer.from(await response.arrayBuffer());
if (bytes.length < 100_000 || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('SFF source is not the expected PDF payload.');
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
if (sha256 !== source.source.pdfSha256) throw new Error(`SFF FY2025 PDF changed (${sha256}); extract and review the new source before updating the accepted snapshot.`);
console.log(`SFF FY2025 source unchanged: ${bytes.length.toLocaleString('en-US')} bytes, SHA-256 ${sha256}.`);
