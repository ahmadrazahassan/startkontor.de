import nextEnv from '@next/env';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
nextEnv.loadEnvConfig(process.cwd(), false);
const { resendAnfrage, resendOk } = await import('../lib/newsletter/resend.ts');
const { NEWSLETTER_EIGENSCHAFTEN } = await import('../lib/newsletter/store.ts');
if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY fehlt in .env.local.');
let content = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
function setzen(name, value) {
  const line = name + '=' + JSON.stringify(value);
  const re = new RegExp('^'+name+'=.*$', 'm');
  content = re.test(content) ? content.replace(re, () => line) : content.trimEnd()+'\n'+line+'\n';
  process.env[name] = value;
}
let geheimnisNeuErstellt = false;
if (!process.env.NEWSLETTER_SECRET) { setzen('NEWSLETTER_SECRET', randomBytes(32).toString('base64url')); geheimnisNeuErstellt = true; }
if (process.env.NEWSLETTER_SECRET.length < 32) throw new Error('Vorhandenes NEWSLETTER_SECRET ist zu kurz. Nicht automatisch rotieren: bestehende Abmeldelinks könnten ungültig werden.');
if (!process.env.NEWSLETTER_AUDIENCE_ID) {
  const liste = await (await resendOk('/segments')).json();
  let gruppe = liste.data.find(p => p.name === 'Startkontor Monatsbrief');
  if (!gruppe) gruppe = await (await resendOk('/segments', 'POST', {name:'Startkontor Monatsbrief'})).json();
  setzen('NEWSLETTER_AUDIENCE_ID', gruppe.id);
}
const gruppe = await (await resendOk('/segments/'+encodeURIComponent(process.env.NEWSLETTER_AUDIENCE_ID))).json();
if (gruppe.name !== 'Startkontor Monatsbrief') throw new Error('NEWSLETTER_AUDIENCE_ID gehört nicht zur Gruppe Startkontor Monatsbrief.');
const eigenschaften = await (await resendOk('/contact-properties')).json();
for (const key of NEWSLETTER_EIGENSCHAFTEN) {
  const vorhanden = eigenschaften.data.find(p=>p.key===key);
  if (vorhanden && vorhanden.type !== 'string') throw new Error('Falscher Typ für Newsletter-Eigenschaft '+key);
  if (!vorhanden) await resendOk('/contact-properties','POST',{key,type:'string'});
}
writeFileSync('.env.local',content);
const erforderlich = ['SITE_URL','RESEND_API_KEY','MAIL_FROM','MAIL_TO','NEWSLETTER_SECRET','NEWSLETTER_AUDIENCE_ID'];
const leer = erforderlich.filter(n => !process.env[n]?.trim());
if (leer.length) throw new Error('Noch fehlend: '+leer.join(', '));
console.log(JSON.stringify({envVollstaendig:true,variablen:erforderlich.length,gruppe:gruppe.name,einwilligungsfelder:NEWSLETTER_EIGENSCHAFTEN.length,geheimnisNeuErstellt,geheimnisAusgegeben:false},null,2));
