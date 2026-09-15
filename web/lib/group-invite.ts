/** Accept the code or the link the group owner actually copies. */
export function invitationCode(
  input: string,
  currentOrigin: string,
): string | null {
  const value = input.trim();
  if (/^[a-f0-9]{48}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const productionOrigins = [
      'https://gunbeon.gangwon.kr',
      'https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site',
    ];
    const sameService =
      url.origin === currentOrigin ||
      (productionOrigins.includes(currentOrigin) &&
        productionOrigins.includes(url.origin));
    if (!sameService || url.pathname !== '/' || url.username || url.password)
      return null;
    const codes = url.searchParams.getAll('join');
    return codes.length === 1 && /^[a-f0-9]{48}$/.test(codes[0])
      ? codes[0]
      : null;
  } catch {
    return null;
  }
}
