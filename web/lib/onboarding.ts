/** Presentation only. Never changes authentication, account ownership, or demo isolation. */
export function guideAudience(
  account:
    | { handle?: string | null; demoPersona?: string | null }
    | null
    | undefined,
) {
  if (account?.demoPersona === 'openapi') return 'judge' as const;
  if (account?.demoPersona) return 'demo' as const;
  return account?.handle === 'openapi' ? ('judge' as const) : null;
}
