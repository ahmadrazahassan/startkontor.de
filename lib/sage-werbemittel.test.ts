import { test } from "node:test";
import assert from "node:assert/strict";
import { sageAnzeigeFuer, sageAnzeigenNachId } from "./sage-werbemittel.ts";

test("alle 25 aktiven Sage-Banner kommen extern von Impact und behalten ihren CSV-Trackinglink", () => {
  assert.equal(sageAnzeigenNachId.size, 25);
  for (const [id, anzeige] of sageAnzeigenNachId) {
    assert.equal(anzeige.adId, id);
    assert.equal(anzeige.status, "ACTIVE");
    assert.equal(anzeige.hostedBy, "IR");
    assert.equal(new URL(anzeige.imageUrl).hostname, "a.impactradius-go.com");
    assert.match(anzeige.imageUrl, new RegExp(`/display-ad/27498-${id}$`));
    assert.equal(new URL(anzeige.trackingLink).hostname, "sagegmbh.sjv.io");
    assert.equal(new URL(anzeige.trackingLink).pathname, `/c/7969203/${id}/27498`);
    assert.equal(sageAnzeigeFuer(id), anzeige);
  }
});

test("die vier 300x250 Anzeigen gehören zur passenden Sage-Kampagne", () => {
  const expected = new Map([
    [3364230, "HR"],
    [3364221, "ERP"],
    [3364241, "Intacct"],
    [3723304, "Sage Operations"],
  ]);
  for (const [id, label] of expected) {
    const anzeige = sageAnzeigeFuer(id);
    assert.ok(anzeige);
    assert.equal(anzeige.width, 300);
    assert.equal(anzeige.height, 250);
    assert.equal(anzeige.labels, label);
  }
});

test("die Startseitenmotive sind deutschsprachige Originalbanner in den passenden Formaten", () => {
  const expected = new Map([
    [3723308, { label: "Sage Operations", width: 970, height: 250 }],
    [3723307, { label: "Sage Operations", width: 728, height: 90 }],
    [3723304, { label: "Sage Operations", width: 300, height: 250 }],
  ]);
  for (const [id, details] of expected) {
    const anzeige = sageAnzeigeFuer(id);
    assert.ok(anzeige);
    assert.equal(anzeige.labels, details.label);
    assert.equal(anzeige.width, details.width);
    assert.equal(anzeige.height, details.height);
    assert.equal(anzeige.language, "GERMAN");
  }
});
