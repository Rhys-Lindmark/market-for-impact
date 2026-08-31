import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ai.rhyslindmark.com/donate reverse-proxies this Sites deployment while
  // stripping /donate. Serve immutable build assets from the stable Sites
  // origin so both URLs resolve the same files without path-rewrite gaps.
  assetPrefix: 'https://market-for-impact.rhyslindmark.chatgpt.site',
};

export default nextConfig;
