"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Icon } from "@/components/icons";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Macht aus dem Wort "Datenschutzerklärung" in einem Datentext einen Link. Der Text selbst bleibt unverändert. */
function mitDatenschutzLink(text: string, href: string): ReactNode {
  const wort = "Datenschutzerklärung";
  const teile = text.split(wort);
  if (teile.length === 1) return text;
  return teile.flatMap((teil, i) =>
    i < teile.length - 1
      ? [teil, <Link key={i} href={href}>{wort}</Link>]
      : [teil],
  );
}

function Fehler({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="feld__fehler" role="alert">
      <Icon name="warning" groesse={18} />
      <span>{text}</span>
    </p>
  );
}

function Haken({
  id,
  name,
  checked,
  onChange,
  fehlerId,
  fehler,
  children,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  fehlerId: string;
  fehler: boolean;
  children: ReactNode;
}) {
  return (
    <label className="haken" htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        className="haken__eingabe"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={fehler || undefined}
        aria-describedby={fehler ? fehlerId : undefined}
      />
      <span className="haken__box" aria-hidden="true">
        <Icon name="check" groesse={18} />
      </span>
      <span className="haken__text">{children}</span>
    </label>
  );
}

type NewsletterTexte = {
  label: string;
  platzhalter: string;
  einwilligung: string;
  erfolg: string;
  fehlerUngueltig: string;
  fehlerEinwilligung: string;
  fehlerServer: string;
  absenden: string;
};

type Zustand = "bereit" | "sendet" | "erfolg" | "serverfehler";

export function NewsletterFormular({ texte, datenschutzHref }: { texte: NewsletterTexte; datenschutzHref: string }) {
  const id = useId();
  const start = useRef(0);
  const [email, setEmail] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  const [honig, setHonig] = useState("");
  const [fehler, setFehler] = useState<{ email?: boolean; einwilligung?: boolean }>({});
  const [zustand, setZustand] = useState<Zustand>("bereit");

  useEffect(() => {
    start.current = Date.now();
  }, []);

  const senden = async (e: FormEvent) => {
    e.preventDefault();
    if (zustand === "sendet") return;
    const neu = { email: !EMAIL.test(email.trim()), einwilligung: !einwilligung };
    setFehler(neu);
    if (neu.email || neu.einwilligung) return;
    setZustand("sendet");
    try {
      const antwort = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), einwilligung, ts: start.current, hp: honig }),
      });
      if (antwort.ok) {
        setZustand("erfolg");
        return;
      }
      if (antwort.status === 400) {
        const daten = (await antwort.json().catch(() => ({}))) as { feld?: string };
        setFehler({ email: daten.feld === "email", einwilligung: daten.feld === "einwilligung" });
        setZustand(daten.feld === "email" || daten.feld === "einwilligung" ? "bereit" : "serverfehler");
        return;
      }
      setZustand("serverfehler");
    } catch {
      setZustand("serverfehler");
    }
  };

  if (zustand === "erfolg") {
    return (
      <div className="meldung" role="status">
        <Icon name="check" groesse={22} />
        <p>{texte.erfolg}</p>
      </div>
    );
  }

  return (
    <form className="formular" onSubmit={senden} noValidate aria-busy={zustand === "sendet"}>
      <div className="feld">
        <label className="feld__label" htmlFor={`${id}-email`}>
          {texte.label}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="feld__eingabe"
          placeholder={texte.platzhalter}
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          aria-invalid={fehler.email || undefined}
          aria-describedby={fehler.email ? `${id}-email-fehler` : undefined}
          required
        />
        {fehler.email ? <Fehler id={`${id}-email-fehler`} text={texte.fehlerUngueltig} /> : null}
      </div>

      <div className="honigtopf" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honig} onChange={(ev) => setHonig(ev.target.value)} />
        </label>
      </div>

      <div className="feld">
        <Haken
          id={`${id}-einwilligung`}
          name="einwilligung"
          checked={einwilligung}
          onChange={setEinwilligung}
          fehlerId={`${id}-einwilligung-fehler`}
          fehler={!!fehler.einwilligung}
        >
          {mitDatenschutzLink(texte.einwilligung, datenschutzHref)}
        </Haken>
        {fehler.einwilligung ? <Fehler id={`${id}-einwilligung-fehler`} text={texte.fehlerEinwilligung} /> : null}
      </div>

      {zustand === "serverfehler" ? <Fehler id={`${id}-server`} text={texte.fehlerServer} /> : null}

      <div>
        <button type="submit" className="knopf knopf_primaer" disabled={zustand === "sendet"} aria-disabled={zustand === "sendet"}>
          <span className="knopf__text">{texte.absenden}</span>
        </button>
      </div>
    </form>
  );
}

type KontaktTexte = {
  name: string;
  email: string;
  betreff: string;
  nachricht: string;
  einwilligung: string;
  erfolg: string;
  fehlerPflicht: string;
  fehlerUngueltig: string;
  fehlerServer: string;
  hinweisFehler: string;
  absenden: string;
};

export function KontaktFormular({ texte, datenschutzHref }: { texte: KontaktTexte; datenschutzHref: string }) {
  const id = useId();
  const start = useRef(0);
  const [werte, setWerte] = useState({ name: "", email: "", betreff: "", nachricht: "" });
  const [einwilligung, setEinwilligung] = useState(false);
  const [honig, setHonig] = useState("");
  const [fehler, setFehler] = useState<Record<string, boolean>>({});
  const [zustand, setZustand] = useState<Zustand>("bereit");

  useEffect(() => {
    start.current = Date.now();
  }, []);

  const setze = (k: keyof typeof werte) => (ev: { target: { value: string } }) =>
    setWerte((w) => ({ ...w, [k]: ev.target.value }));

  const senden = async (e: FormEvent) => {
    e.preventDefault();
    if (zustand === "sendet") return;
    const neu: Record<string, boolean> = {
      name: werte.name.trim() === "",
      email: !EMAIL.test(werte.email.trim()),
      betreff: werte.betreff.trim() === "",
      nachricht: werte.nachricht.trim() === "",
      einwilligung: !einwilligung,
    };
    setFehler(neu);
    if (Object.values(neu).some(Boolean)) return;
    setZustand("sendet");
    try {
      const antwort = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: werte.name.trim(),
          email: werte.email.trim(),
          betreff: werte.betreff.trim(),
          nachricht: werte.nachricht.trim(),
          einwilligung,
          ts: start.current,
          hp: honig,
          seite: document.referrer ? new URL(document.referrer).pathname : "",
        }),
      });
      setZustand(antwort.ok ? "erfolg" : "serverfehler");
    } catch {
      setZustand("serverfehler");
    }
  };

  if (zustand === "erfolg") {
    return (
      <div className="meldung" role="status">
        <Icon name="check" groesse={22} />
        <p>{texte.erfolg}</p>
      </div>
    );
  }

  const feld = (k: "name" | "email" | "betreff", label: string, art: "text" | "email", auto: string) => (
    <div className="feld">
      <label className="feld__label" htmlFor={`${id}-${k}`}>
        {label}
      </label>
      <input
        id={`${id}-${k}`}
        name={k}
        type={art}
        autoComplete={auto}
        className="feld__eingabe"
        value={werte[k]}
        onChange={setze(k)}
        aria-invalid={fehler[k] || undefined}
        aria-describedby={fehler[k] ? `${id}-${k}-fehler` : undefined}
        required
      />
      {fehler[k] ? (
        <Fehler id={`${id}-${k}-fehler`} text={k === "email" && werte.email.trim() !== "" ? texte.fehlerUngueltig : texte.fehlerPflicht} />
      ) : null}
    </div>
  );

  return (
    <form className="formular" onSubmit={senden} noValidate aria-busy={zustand === "sendet"}>
      {feld("name", texte.name, "text", "name")}
      {feld("email", texte.email, "email", "email")}
      {feld("betreff", texte.betreff, "text", "off")}

      <div className="feld">
        <label className="feld__label" htmlFor={`${id}-nachricht`}>
          {texte.nachricht}
        </label>
        <p id={`${id}-hilfe`} className="feld__hilfe">
          {texte.hinweisFehler}
        </p>
        <textarea
          id={`${id}-nachricht`}
          name="nachricht"
          className="feld__eingabe"
          rows={7}
          value={werte.nachricht}
          onChange={setze("nachricht")}
          aria-invalid={fehler.nachricht || undefined}
          aria-describedby={fehler.nachricht ? `${id}-hilfe ${id}-nachricht-fehler` : `${id}-hilfe`}
          required
        />
        {fehler.nachricht ? <Fehler id={`${id}-nachricht-fehler`} text={texte.fehlerPflicht} /> : null}
      </div>

      <div className="honigtopf" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honig} onChange={(ev) => setHonig(ev.target.value)} />
        </label>
      </div>

      <div className="feld">
        <Haken
          id={`${id}-einwilligung`}
          name="einwilligung"
          checked={einwilligung}
          onChange={setEinwilligung}
          fehlerId={`${id}-einwilligung-fehler`}
          fehler={!!fehler.einwilligung}
        >
          {mitDatenschutzLink(texte.einwilligung, datenschutzHref)}
        </Haken>
        {fehler.einwilligung ? <Fehler id={`${id}-einwilligung-fehler`} text={texte.fehlerPflicht} /> : null}
      </div>

      {zustand === "serverfehler" ? <Fehler id={`${id}-server`} text={texte.fehlerServer} /> : null}

      <div>
        <button type="submit" className="knopf knopf_primaer" disabled={zustand === "sendet"} aria-disabled={zustand === "sendet"}>
          <span className="knopf__text">{texte.absenden}</span>
        </button>
      </div>
    </form>
  );
}
