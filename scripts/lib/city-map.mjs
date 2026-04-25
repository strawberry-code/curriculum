// Mappa IT->EN per i campi non internazionalizzati dal sito (.where nelle esperienze, sede contatti).
// Applicata SOLO sul lato EN estratto da Playwright, mai sull'IT (fonte di verità resta index.html).
const LOCATION_MAP = new Map([
  ['Milano', 'Milan'],
  ['Torino', 'Turin'],
  ['Italia', 'Italy'],
  ['Piemonte', 'Piedmont'],
]);

// Token noti che restano invariati in EN (non serve tradurli, non sono un refuso da segnalare).
const KNOWN_PASSTHROUGH = new Set(['Gavi (AL)', 'Alessandria', 'Novi Ligure']);

export function translateLocation(value) {
  if (!value) return value;
  return value
    .split('·')
    .map((token) => {
      const trimmed = token.trim();
      if (LOCATION_MAP.has(trimmed)) return LOCATION_MAP.get(trimmed);
      if (!KNOWN_PASSTHROUGH.has(trimmed)) {
        console.warn(`[build-pdf] città non mappata per EN: "${trimmed}" — aggiungila a scripts/lib/city-map.mjs se va tradotta.`);
      }
      return trimmed;
    })
    .join(' · ');
}
