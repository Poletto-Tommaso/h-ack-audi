// Intentionally unset. Add an official, manually verified Audi test-drive URL + source
// and verification date via .env.local when the target market is agreed.
export function getBookingUrl(config = {
  url: import.meta.env.VITE_AUDI_TEST_DRIVE_URL as string | undefined,
  verifiedOn: import.meta.env.VITE_AUDI_TEST_DRIVE_VERIFIED_ON as string | undefined,
  source: import.meta.env.VITE_AUDI_TEST_DRIVE_SOURCE as string | undefined,
}) {
  if (!config.url || !config.verifiedOn || !config.source) return null
  try {
    const url = new URL(config.url)
    const source = new URL(config.source)
    const official = (host: string) => host === 'audi.com' || host.endsWith('.audi.com') || host === 'audi.it' || host.endsWith('.audi.it') || host === 'audi.de' || host.endsWith('.audi.de') || host === 'audi.co.uk' || host.endsWith('.audi.co.uk') || host === 'audiusa.com' || host.endsWith('.audiusa.com')
    if (url.protocol !== 'https:' || source.protocol !== 'https:' || !official(url.hostname) || !official(source.hostname) || url.username || url.password) return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(config.verifiedOn) || Number.isNaN(Date.parse(config.verifiedOn))) return null
    return url.href
  } catch { return null }
}
