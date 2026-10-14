// Vorschau standardmäßig. --test sendet nur an MAIL_TO; --send ist die bewusste Freigabe einer Ausgabe.
import nextEnv from '@next/env';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
async function main() {
nextEnv.loadEnvConfig(process.cwd(), false);
const { monatsbriefMail, bestaetigungsMail, willkommenMail } = await import('../lib/newsletter/mail.ts');
const { resendVersand, mailSchluessel, umgebungVollstaendig, newsletterFeld } = await import('../lib/newsletter/store.ts');
const { resendOk } = await import('../lib/newsletter/resend.ts');
const { erzeugeAbmeldeToken } = await import('../lib/newsletter/token.ts');
const { betreiber, routen } = await import('../lib/daten.ts');
const { SITE_URL } = await import('../lib/site.ts');
const ausgabe = JSON.parse(readFileSync('data/newsletter-ausgabe.json','utf8'));
if (!ausgabe.schluessel || !ausgabe.betreff || !ausgabe.titel || !ausgabe.einleitung || !ausgabe.vorschau || !Array.isArray(ausgabe.artikel) || ausgabe.artikel.length === 0) throw new Error('Newsletter-Ausgabe ist unvollständig.');
for (const a of ausgabe.artikel) if (!routen.includes(a.pfad) || !a.titel || !a.text) throw new Error('Ungültiger Artikel in der Ausgabe.');
mkdirSync('test-results/newsletter',{recursive:true});
const png=readFileSync('public/marke/startkontor-email-logo.png').toString('base64');
const previewLink=SITE_URL+'/brief';
for (const [name, mail] of [
  ['bestaetigung',bestaetigungsMail(SITE_URL+'/api/newsletter/bestaetigen?token=VORSCHAU')],
  ['willkommen',willkommenMail(previewLink)],
  ['monatsbrief',monatsbriefMail(ausgabe,previewLink)],
]) writeFileSync('test-results/newsletter/'+name+'.html',mail.html.replaceAll('cid:startkontor-logo','data:image/png;base64,'+png));
if (!process.argv.includes('--send') && !process.argv.includes('--test')) {
  console.log('Drei Mailvorschauen erstellt. Kein Versand.');
  return;
}
if (!umgebungVollstaendig(['RESEND_API_KEY','MAIL_FROM','MAIL_TO','NEWSLETTER_SECRET','NEWSLETTER_AUDIENCE_ID','SITE_URL'])) throw new Error('Newsletter-Umgebung unvollständig.');
async function senden(email, test=false) {
  const token=erzeugeAbmeldeToken(email,process.env.NEWSLETTER_SECRET);
  const abmeldeLink=SITE_URL+'/api/newsletter/abmelden?token='+encodeURIComponent(token);
  const mail=monatsbriefMail(ausgabe,abmeldeLink);
  const resultat=await resendVersand.senden({an:email,...mail,betreff:(test?'[Design-Vorschau] ':'')+mail.betreff,abmeldeLink,kategorie:test?'newsletter_test':'newsletter_issue',idempotenz:mailSchluessel(test?'newsletter-test':'newsletter-issue',email,ausgabe.schluessel+(test?'-'+new Date().toISOString().slice(0,10):''))});
  return resultat.id;
}
if (process.argv.includes('--test')) {
  const id=await senden(process.env.MAIL_TO,true);
  writeFileSync('test-results/newsletter/test-send.json',JSON.stringify({id,an:process.env.MAIL_TO,betreff:ausgabe.betreff},null,2));
  console.log('Design-Vorschau an das eigene MAIL_TO Postfach gesendet. Resend ID: '+id);
  return;
}
// Ein öffentlicher Monatsbrief braucht echte Absenderangaben. Keine erfundenen Adressen im Footer.
for (const n of ['BETREIBER_NAME','STRASSE_UND_HAUSNUMMER','POSTLEITZAHL','ORT']) if (!betreiber[n]) throw new Error('Vor dem Versand an Abonnenten fehlt die Betreiberangabe '+n);
let after, gesendet=0, uebersprungen=0;
do {
  const seite=await (await resendOk('/segments/'+encodeURIComponent(process.env.NEWSLETTER_AUDIENCE_ID)+'/contacts?limit=100'+(after?'&after='+encodeURIComponent(after):''))).json();
  for (const eintrag of seite.data) {
    const kontakt=await (await resendOk('/contacts/'+encodeURIComponent(eintrag.id))).json();
    if (kontakt.unsubscribed || !newsletterFeld(kontakt.properties,'startkontor_confirmed_at') || !newsletterFeld(kontakt.properties,'startkontor_consent_version')) { uebersprungen++; continue; }
    await senden(kontakt.email); gesendet++;
  }
  after=seite.has_more?seite.data.at(-1)?.id:undefined;
} while(after);
console.log(JSON.stringify({gesendet,uebersprungen,ausgabe:ausgabe.schluessel}));
}
await main();
