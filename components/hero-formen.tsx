/**
 * Dekorative Formen am Rand des Heros: flache, kräftige Flächen in den Markenfarben.
 * Rein gestalterisch (aria-hidden), erst ab breiten Bildschirmen sichtbar, damit sie nie Text überdecken.
 */
export function HeroFormen() {
  return (
    <>
      <svg className="heroformen heroformen_links" viewBox="0 0 260 440" aria-hidden="true" focusable="false">
        <rect x="-60" y="110" width="250" height="86" rx="24" fill="var(--primary)" transform="rotate(-32 65 153)" />
        <rect x="30" y="205" width="190" height="86" rx="24" fill="var(--sky)" transform="rotate(-32 125 248)" />
        <circle cx="70" cy="365" r="34" fill="none" stroke="var(--night)" strokeWidth="18" />
        <rect x="170" y="40" width="44" height="44" rx="12" fill="var(--white)" transform="rotate(16 192 62)" />
      </svg>
      <svg className="heroformen heroformen_rechts" viewBox="0 0 320 500" aria-hidden="true" focusable="false">
        <circle cx="262" cy="340" r="126" fill="none" stroke="var(--primary)" strokeWidth="58" />
        <rect x="20" y="40" width="250" height="86" rx="24" fill="var(--sky)" transform="rotate(30 145 83)" />
        <rect x="-10" y="180" width="130" height="64" rx="18" fill="var(--night)" transform="rotate(-14 55 212)" />
        <circle cx="64" cy="410" r="20" fill="var(--white)" />
      </svg>
    </>
  );
}
