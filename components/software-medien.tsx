"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import type { SoftwareMedien } from "@/lib/software-medien";

export function SoftwareMedienGalerie({ name, medien }: { name: string; medien: SoftwareMedien }) {
  const [aktiv, setAktiv] = useState(0);
  const [vergroessert, setVergroessert] = useState(false);
  const [videoGeladen, setVideoGeladen] = useState(false);
  const [videoFehler, setVideoFehler] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const bild = medien.bilder[aktiv];
  const video = medien.video;

  return <div className="softwaremedien">
    {bild ? <div className="softwaremedien__galerie">
      <figure className="softwaremedien__abbildung">
        <button type="button" className="softwaremedien__buehne" onClick={() => { setVergroessert(true); dialog.current?.showModal(); }} aria-label={`${bild.titel}: Bild vergrößern`}>
          <Image src={bild.src} width={bild.breite} height={bild.hoehe} alt={bild.alt} quality={90} unoptimized={bild.src.endsWith(".svg")} sizes="(min-width: 1100px) 850px, (min-width: 768px) 70vw, 94vw" />
          <span className="softwaremedien__zoom"><Icon name="plus" groesse={16} />Vergrößern</span>
        </button>
        <figcaption className="softwaremedien__bildtext"><div><strong>{bild.titel}</strong><span>Originalabbildung des Herstellers{medien.bilder.length > 1 ? ` · ${aktiv + 1} von ${medien.bilder.length}` : ""}</span></div><a href={bild.quelle} target="_blank" rel="noopener noreferrer">Bildquelle<Icon name="external" groesse={14} /></a></figcaption>
      </figure>
      {medien.bilder.length > 1 ? <div className="softwaremedien__auswahl" role="group" aria-label={`Produktansichten von ${name}`}>
        {medien.bilder.map((b, index) => <button type="button" key={b.src} className="softwaremedien__miniatur" aria-pressed={index === aktiv} aria-label={`Ansicht ${index + 1} anzeigen: ${b.titel}`} onClick={() => setAktiv(index)}><Image src={b.src} width={b.breite} height={b.hoehe} alt="" quality={90} unoptimized={b.src.endsWith(".svg")} sizes="160px" /><span>{b.titel}</span></button>)}
      </div> : null}
      <p className="softwaremedien__hinweis">{bild.hinweis ?? "Die Darstellung stammt vom Hersteller. Oberfläche und Funktionsumfang können je nach Version und Tarif abweichen."}</p>
      <dialog ref={dialog} className="softwaremedien__dialog" aria-label={`${bild.titel} in voller Größe`} onClose={() => setVergroessert(false)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="softwaremedien__dialogkopf"><strong>{bild.titel}</strong><button type="button" className="softwaremedien__schliessen" aria-label="Bildansicht schließen" onClick={() => dialog.current?.close()}><Icon name="close" groesse={22} /></button></div>
        {/* Das Original bleibt in voller Auflösung abrufbar. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {vergroessert ? <img src={bild.src} width={bild.breite} height={bild.hoehe} alt={bild.alt} /> : null}
        <a href={bild.src} target="_blank" rel="noopener noreferrer" className="softwaremedien__original">Originalbild öffnen<Icon name="external" groesse={15} /></a>
      </dialog>
    </div> : null}

    {video ? <section className="softwaremedien__video" aria-label={`Produktvideo zu ${name}`}>
      <div className="softwaremedien__videokopf"><div><p className="eyebrow">Produktvideo</p><h3>{video.titel}</h3></div><span className="softwaremedien__videotyp">{video.anbieter}{video.sprache ? ` · ${video.sprache}` : ""}</span></div>
      <div className="softwaremedien__player">
        {videoGeladen ? video.typ === "datei" ? <video controls playsInline preload="metadata" aria-label={video.titel} src={video.einbettung} onError={() => setVideoFehler(true)}>Ihr Browser unterstützt dieses Videoformat nicht. <a href={video.extern}>Video beim Hersteller ansehen</a></video> : <iframe src={video.einbettung} title={video.titel} allow="fullscreen; picture-in-picture; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="softwaremedien__vorschau">
          {bild ? <Image src={medien.bilder[0].src} width={medien.bilder[0].breite} height={medien.bilder[0].hoehe} alt="" quality={90} unoptimized={medien.bilder[0].src.endsWith(".svg")} sizes="(min-width: 1100px) 850px, 94vw" /> : null}
          <button type="button" onClick={() => setVideoGeladen(true)} className="softwaremedien__start"><span className="softwaremedien__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 4l12 8-12 8z" /></svg></span><span>Video laden</span></button>
        </div>}
      </div>
      {videoFehler ? <p className="softwaremedien__hinweis" role="status">Das Video konnte nicht geladen werden. Bitte verwenden Sie den Link „Extern ansehen“.</p> : null}
      <div className="softwaremedien__videofuss"><p>Das Video wird erst nach Ihrem Klick geladen. Anbieter: {video.anbieter}.{video.hinweis ? ` ${video.hinweis}` : ""}</p><a href={video.extern} target="_blank" rel="noopener noreferrer">Extern ansehen<Icon name="external" groesse={14} /></a></div>
      <a href={video.quelle} target="_blank" rel="noopener noreferrer" className="softwaremedien__videoquelle">Videoquelle beim Hersteller<Icon name="external" groesse={14} /></a>
    </section> : null}
  </div>;
}
