import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { bestaetigungsMail, willkommenMail, monatsbriefMail, kontaktMail } from "./newsletter/mail.ts";
import { erzeugeBestaetigungsToken, leseBestaetigungsToken, pruefeBestaetigungsToken, erzeugeAbmeldeToken, pruefeAbmeldeToken, BESTAETIGUNG_GUELTIG_MS } from "./newsletter/token.ts";
import { resendSpeicher, resendVersand } from "./newsletter/store.ts";
import ausgabe from "../data/newsletter-ausgabe.json" with { type: "json" };

const geheimnis = "test-only-newsletter-secret-with-32-bytes";
const email = "news@example.test";
const jetzt = Date.parse("2026-10-14T10:00:00Z");

test("Newsletter: signierter Link enthält echte Anfragezeit und Einwilligungsversion", () => {
  const token = erzeugeBestaetigungsToken(email, geheimnis, jetzt, "v2");
  assert.deepEqual(leseBestaetigungsToken(token, geheimnis, jetzt+1000), {email, angemeldetAm:new Date(jetzt).toISOString(),einwilligung:"v2"});
  assert.equal(pruefeBestaetigungsToken(token, geheimnis, jetzt+BESTAETIGUNG_GUELTIG_MS+1),null);
  assert.equal(pruefeBestaetigungsToken(token, "falsch", jetzt),null);
  assert.equal(pruefeBestaetigungsToken(token+".zusatz", geheimnis, jetzt),null);
  assert.equal(pruefeBestaetigungsToken(token, geheimnis, jetzt-1),null);
});
test("Newsletter: vorher ausgestellte Bestätigungslinks und dauerhafte Abmeldelinks bleiben gültig", () => {
  const daten=email+"|"+jetzt+"|bestaetigen";
  const alt=Buffer.from(daten).toString("base64url")+"."+createHmac("sha256",geheimnis).update(daten).digest("base64url");
  assert.equal(pruefeBestaetigungsToken(alt,geheimnis,jetzt),email);
  const ab=erzeugeAbmeldeToken("name|tag@example.test",geheimnis);
  assert.equal(pruefeAbmeldeToken(ab,geheimnis),"name|tag@example.test");
  assert.equal(pruefeAbmeldeToken(ab+".zusatz",geheimnis),null);
  assert.equal(pruefeAbmeldeToken(ab,"falsch"),null);
});
test("Newsletter: deutsche Mailvorlagen enthalten echtes Inline-Logo, Klartext und passende Abmeldelinks", () => {
  const link="https://startkontor.de/api/newsletter/abmelden?token=test";
  for (const m of [bestaetigungsMail("https://startkontor.de/brief?token=test"),willkommenMail(link),monatsbriefMail(ausgabe,link)]) {
    assert.ok(m.html.includes('lang="de"'));
    assert.ok(m.html.includes('src="cid:startkontor-logo"'));
    assert.ok(m.html.includes("#095fbb") && m.html.includes("#0a2540"));
    assert.ok(m.text.length>150);
    assert.ok(!m.html.includes("{{") && !m.html.includes("<script"));
  }
  assert.ok(willkommenMail(link).html.includes(link));
  assert.throws(()=>bestaetigungsMail("javascript:alert(1)"));
  const kontakt=kontaktMail({name:'<script>',email,betreff:'<img onerror="alert(1)">',nachricht:'a\nb & c',seite:'/'});
  assert.ok(!kontakt.html.includes('<img onerror'));
  assert.ok(kontakt.html.includes('&lt;script&gt;') && kontakt.html.includes('a<br>b &amp; c'));
});
test("Newsletter: Kontakte werden erst bestätigt in die richtige Gruppe aufgenommen und mit Einwilligungsnachweis gespeichert", async (t) => {
  const aufrufe: {url:string;body:unknown}[]=[];
  t.mock.method(globalThis,"fetch",async (url: string | URL | Request, init?: RequestInit)=> {
    aufrufe.push({url:String(url),body:init?.body?JSON.parse(String(init.body)):undefined});
    return new Response(JSON.stringify(String(url).endsWith('/contacts/'+email)?{}:{id:'kontakt-id'}),{status:aufrufe.length===1?404:200});
  });
  const alt=process.env.NEWSLETTER_AUDIENCE_ID;
  process.env.NEWSLETTER_AUDIENCE_ID="gruppe-id";
  try {
    const a={email,angemeldetAm:new Date(jetzt).toISOString(),bestaetigtAm:new Date(jetzt+1000).toISOString(),einwilligung:"v1"};
    assert.deepEqual(await resendSpeicher.bestaetigen(a),{willkommenSenden:true});
    const body=aufrufe[1].body as {properties: Record<string,string>};
    assert.equal(body.properties.startkontor_requested_at,a.angemeldetAm);
    assert.equal(body.properties.startkontor_confirmed_at,a.bestaetigtAm);
    assert.ok(aufrufe[2].url.endsWith('/contacts/kontakt-id/segments/gruppe-id'));
  } finally { if (alt===undefined) delete process.env.NEWSLETTER_AUDIENCE_ID; else process.env.NEWSLETTER_AUDIENCE_ID=alt; }
});
test("Newsletter: ein alter Bestätigungslink kann eine spätere Abmeldung nicht überschreiben", async (t) => {
  let aufrufe=0;
  t.mock.method(globalThis,"fetch",async()=> {aufrufe++;return new Response(JSON.stringify({id:'kontakt-id',unsubscribed:true,properties:{startkontor_unsubscribed_at:{value:new Date(jetzt+1000).toISOString(),type:'string'}}}));});
  await assert.rejects(resendSpeicher.bestaetigen({email,angemeldetAm:new Date(jetzt).toISOString(),bestaetigtAm:new Date(jetzt+2000).toISOString(),einwilligung:'v1'}));
  assert.equal(aufrufe,1);
});
test("Newsletter: wiederholte Bestätigung sendet mit den echten Resend Eigenschaftsobjekten keine zweite Willkommensmail", async (t) => {
  let aufrufe=0;
  const zeit=new Date(jetzt).toISOString();
  t.mock.method(globalThis,"fetch",async()=>{aufrufe++;return new Response(JSON.stringify(aufrufe===1?{id:'kontakt-id',unsubscribed:false,properties:{startkontor_requested_at:{value:zeit,type:'string'},startkontor_confirmed_at:{value:zeit,type:'string'},startkontor_welcome_at:{value:zeit,type:'string'}}}:{id:'gruppe-id'}));});
  assert.deepEqual(await resendSpeicher.bestaetigen({email,angemeldetAm:zeit,bestaetigtAm:zeit,einwilligung:'v1'}),{willkommenSenden:false});
  assert.equal(aufrufe,2);
});
test("Newsletter: Versand enthält eingebettetes Logo, One Click Header und Idempotenzschlüssel", async (t) => {
  let daten: Record<string,unknown>={}, kopf: Record<string,string>={};
  t.mock.method(globalThis,"fetch",async(_url: string|URL|Request,init?:RequestInit)=> {daten=JSON.parse(String(init?.body));kopf=init?.headers as Record<string,string>;return new Response(JSON.stringify({id:'mail-id'}));});
  const abmeldeLink='https://startkontor.de/api/newsletter/abmelden?token=test';
  const mail=willkommenMail(abmeldeLink);
  await resendVersand.senden({an:email,...mail,abmeldeLink,idempotenz:'test-unique'});
  const bild=(daten.attachments as {content_id:string;content:string}[])[0];
  assert.equal(bild.content_id,'startkontor-logo');
  assert.ok(Buffer.from(bild.content,'base64').subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  assert.equal((daten.headers as Record<string,string>)['List-Unsubscribe-Post'],'List-Unsubscribe=One-Click');
  assert.equal(kopf['Idempotency-Key'],'test-unique');
});
