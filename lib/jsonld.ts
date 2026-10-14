// Strukturierte Daten. Nie Review, Rating, AggregateRating oder Preise (siehe seo.verbote).

import { marke, seo } from "./daten.ts";
import { parseDeutschesDatum } from "./datum.ts";
import { inlineZuText } from "./inline.ts";
import { absolut, SITE_URL } from "./site.ts";
import type { FaqEintrag, Glossarbegriff, Leitfaden } from "./typen.ts";

export function organisationUndWebsite() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organisation`,
      name: marke.name,
      url: SITE_URL,
      logo: absolut("/marke/startkontor-symbol.svg"),
      description: marke.kurzbeschreibung,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: marke.name,
      url: SITE_URL,
      inLanguage: seo.sprache,
      publisher: { "@id": `${SITE_URL}/#organisation` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/suche?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function artikel(l: Leitfaden) {
  const geaendert = parseDeutschesDatum(l.rechtsstand);
  const veroeffentlicht = l.veroeffentlicht ? parseDeutschesDatum(l.veroeffentlicht) : null;
  const redaktion = { "@type": "Organization", name: marke.name, url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: l.titel,
    description: l.seo.beschreibung,
    inLanguage: seo.sprache,
    url: absolut(`/wissen/leitfaeden/${l.slug}`),
    mainEntityOfPage: absolut(`/wissen/leitfaeden/${l.slug}`),
    ...(geaendert ? { dateModified: geaendert } : {}),
    ...(veroeffentlicht ? { datePublished: veroeffentlicht } : {}),
    author: redaktion,
    publisher: redaktion,
  };
}

export function faqSeite(eintraege: { frage: string; antwort: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: eintraege.map((e) => ({
      "@type": "Question",
      name: inlineZuText(e.frage),
      acceptedAnswer: { "@type": "Answer", text: inlineZuText(e.antwort) },
    })),
  };
}

export function faqAusEintraegen(eintraege: FaqEintrag[]) {
  return faqSeite(eintraege.map((e) => ({ frage: e.frage, antwort: e.antwort })));
}

export function begriffsmenge(begriffe: Glossarbegriff[]) {
  return {
    "@type": "DefinedTermSet",
    "@id": absolut("/wissen/glossar#begriffe"),
    name: `${marke.name} Glossar`,
    url: absolut("/wissen/glossar"),
  };
}

export function definierterBegriff(g: Glossarbegriff) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: g.begriff,
    description: inlineZuText(g.erklaerung),
    url: absolut(`/wissen/glossar/${g.slug}`),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": absolut("/wissen/glossar#begriffe"),
      name: `${marke.name} Glossar`,
      url: absolut("/wissen/glossar"),
    },
  };
}
