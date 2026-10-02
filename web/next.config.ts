import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Metadata is local and inexpensive. Emit it in the initial head for all
  // user agents, including crawlers and previews that do not execute JavaScript.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
