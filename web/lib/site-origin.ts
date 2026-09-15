// Runtime configuration only. Never trust Host/Forwarded headers as OAuth configuration.
export function configuredSiteOrigin(value: unknown): string | null {
  if (typeof value !== 'string' || !value || value.trim() !== value)
    return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      (url.protocol !== 'https:' && url.origin !== 'http://localhost:3000')
    )
      return null;
    // Reject values the URL parser silently repairs or reduces to a different origin.
    if (value !== url.origin && value !== url.origin + '/') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function oauthReadyAtOrigin(
  config: { id: string; secret: string; origin: string },
  requestOrigin: string,
): boolean {
  const origin = configuredSiteOrigin(config.origin);
  return !!(config.id && config.secret && origin && origin === requestOrigin);
}

export function metadataOrigin(vars: Record<string, unknown>): string {
  return (
    configuredSiteOrigin(vars.PUBLIC_SITE_URL) ||
    configuredSiteOrigin(vars.AUTH_BASE_URL) ||
    'https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site'
  );
}
