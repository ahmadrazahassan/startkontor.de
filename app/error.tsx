"use client";

import texte from "../lib/client-texte.json";

export default function Fehlerseite() {
  return (
    <section className="band">
      <div className="huelle nichtgefunden" role="alert">
        <h1>{texte.fehlerAllgemein}</h1>
        <p>
          <button type="button" className="knopf knopf_primaer" onClick={() => window.location.reload()}>
            <span className="knopf__text">{texte.neuLaden}</span>
          </button>
        </p>
      </div>
    </section>
  );
}
