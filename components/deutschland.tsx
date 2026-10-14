export function Deutschland({ className = "", text = "Für Unternehmen in Deutschland" }: { className?: string; text?: string }) {
  return <span className={`deutschland ${className}`}>
    {/* Originaldatei der Bundesflagge, lokal gespeichert; das sichtbare Label nennt den Zielmarkt. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/bilder/deutschland.svg" width={25} height={15} alt="" aria-hidden="true" />
    <span>{text}</span>
  </span>;
}
