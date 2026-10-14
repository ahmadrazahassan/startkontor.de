import { test } from "node:test";
import assert from "node:assert/strict";
import { enthaeltInlineMarkup, inlineZuText, parseInline, sammleLinks } from "./inline.ts";

test("reiner Text bleibt ein Textknoten", () => {
  assert.deepEqual(parseInline("Hallo Welt"), [{ typ: "text", text: "Hallo Welt" }]);
});

test("fett wird erkannt", () => {
  assert.deepEqual(parseInline("a **b** c"), [
    { typ: "text", text: "a " },
    { typ: "fett", kinder: [{ typ: "text", text: "b" }] },
    { typ: "text", text: " c" },
  ]);
});

test("interne Links werden erkannt", () => {
  const k = parseInline("Siehe [den Fahrplan](/fahrplan) jetzt");
  assert.equal(k.length, 3);
  assert.deepEqual(k[1], { typ: "link", href: "/fahrplan", kinder: [{ typ: "text", text: "den Fahrplan" }] });
});

test("fett im Link und Link im Fett", () => {
  assert.deepEqual(sammleLinks(parseInline("[**x**](/a) und **[y](/b)**")), ["/a", "/b"]);
});

test("externe oder protokollrelative Links werfen", () => {
  assert.throws(() => parseInline("[x](https://example.com)"));
  assert.throws(() => parseInline("[x](//example.com)"));
});

test("unvollständiges Markup bleibt Text", () => {
  assert.deepEqual(parseInline("2 ** 3"), [{ typ: "text", text: "2 ** 3" }]);
  assert.deepEqual(parseInline("[ohne Ende"), [{ typ: "text", text: "[ohne Ende" }]);
});

test("Klartext Extraktion entfernt das Markup", () => {
  assert.equal(inlineZuText("a **b** [c](/d)"), "a b c");
  assert.equal(enthaeltInlineMarkup("a **b**"), true);
  assert.equal(enthaeltInlineMarkup("a b"), false);
});
