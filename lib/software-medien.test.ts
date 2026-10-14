import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { anbieter } from "./daten.ts";
import { softwareMedien } from "./software-medien.ts";

test("Softwaremedien: originale lokale Dateien mit vollständiger Herkunft und Bildmaßen", () => {
  const slugs = new Set(anbieter.map((a) => a.slug));
  for (const [slug, medien] of softwareMedien) {
    assert.ok(slugs.has(slug), `Unbekanntes Softwareprofil: ${slug}`);
    assert.ok(medien.bilder.length > 0, `Leere Galerie: ${slug}`);
    for (const b of medien.bilder) {
      assert.match(b.src, /^\/bilder\/software\/[a-z0-9-]+\.(png|jpg|webp|svg)$/);
      assert.ok(existsSync(join(process.cwd(), "public", b.src)), b.src);
      assert.ok(b.breite > 0 && b.hoehe > 0, b.src);
      assert.ok(b.alt.length > 15 && b.titel.length > 3, b.src);
      assert.equal(new URL(b.quelle).protocol, "https:");
      assert.equal(new URL(b.original).protocol, "https:");
      if (b.src.endsWith(".svg")) {
        const svg = readFileSync(join(process.cwd(), "public", b.src), "utf8");
        assert.doesNotMatch(svg, /<script\b|\bonload=|javascript:|(?:href|src)=["']https?:/i, b.src);
      }
    }
  }
});

test("Produktvideos: genau ein zugeordnetes Video mit erlaubtem Host und externem Fallback", () => {
  const frameHosts = new Set(["www.youtube-nocookie.com", "player.vimeo.com"]);
  const mediaHosts = new Set(["download.odoocdn.com", "cas.s3-cdn.welocal.cloud", "media.eurodata.de", "www.weclapp.com", "stream.mux.com", "www.zohowebstatic.com"]);
  for (const [slug, medien] of softwareMedien) {
    if (!medien.video) continue;
    const v = medien.video;
    assert.ok(v.titel && v.anbieter && v.sprache, slug);
    const url = new URL(v.einbettung);
    assert.equal(url.protocol, "https:");
    assert.ok((v.typ === "datei" ? mediaHosts : frameHosts).has(url.hostname), url.href);
    assert.equal(new URL(v.extern).protocol, "https:");
    assert.equal(new URL(v.quelle).protocol, "https:");
    assert.ok(!url.searchParams.has("autoplay"), slug);
    if (v.typ === "youtube") assert.match(url.pathname, /^\/embed\/[\w-]{11}$/);
  }
});
