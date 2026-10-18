import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The public Pages proxy strips /givebetter before forwarding to the app.
  // Direct Cloudflare builds keep assets on that public path after cutover.
  assetPrefix: process.env.GIVEBETTER_HOST === 'cloudflare'
    ? (process.env.GIVEBETTER_ASSET_ORIGIN || 'https://ai.rhyslindmark.com/givebetter')
    : 'https://market-for-impact.rhyslindmark.chatgpt.site',
};

export default nextConfig;
