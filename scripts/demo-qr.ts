/**
 * Render real presentation QR codes to an HTML page for testing the Verify tab
 * from a single phone. Each QR is built with the same engine the app uses and
 * signed by the committed trust anchor, so the app verifies them offline.
 *
 *   npm run demo:qr   (writes + opens an HTML page)
 */
import { writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { present } from '../src/crypto/sdvc';
import { PRESENTATION_QR_PREFIX } from '../src/crypto/types';
import type { HeldCredential } from '../src/crypto/types';
import seed from '../assets/credentials/seed.json';

const OUT = join(tmpdir(), 'mymzansi-verify-qr.html');
const held = seed.credentials as unknown as HeldCredential[];

async function qrSvg(cred: HeldCredential, claims: string[]): Promise<string> {
  const value = PRESENTATION_QR_PREFIX + JSON.stringify(present(cred, claims));
  return QRCode.toString(value, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', width: 380 });
}

async function main() {
  const cards = [
    {
      title: 'Valid — selective disclosure',
      note: 'Reveals name + address only. ID number stays hidden. Expect: ✅ Valid.',
      svg: await qrSvg(held[0], ['fullName', 'addressLine', 'suburb', 'city', 'province', 'postalCode']),
    },
    {
      title: 'Valid — full disclosure',
      note: 'Reveals every field including ID number. Expect: ✅ Valid.',
      svg: await qrSvg(held[0], Object.keys(held[0].disclosures)),
    },
    {
      title: 'Revoked credential',
      note: 'A credential whose index is on the signed revocation list. Expect: ❌ Revoked.',
      svg: await qrSvg(held[1], ['fullName', 'city', 'province']),
    },
  ];

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MyMzansi — test QR codes</title>
<style>
 body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F5F6F8;color:#14181F;margin:0;padding:32px}
 h1{font-size:22px}p.sub{color:#5A6472;margin-top:4px}
 .grid{display:flex;flex-wrap:wrap;gap:24px;margin-top:24px}
 .card{background:#fff;border:1px solid #D7DCE1;border-radius:16px;padding:20px;width:420px}
 .card h2{font-size:17px;margin:0 0 4px}.card .note{color:#5A6472;font-size:14px;min-height:40px}
 .qr{background:#fff;display:flex;justify-content:center;padding:8px}
 .tag{display:inline-block;background:#E4F3EC;color:#0B7A4B;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600}
</style></head><body>
 <h1>MyMzansi — verification test codes</h1>
 <p class="sub">Open the app's <b>Verify</b> tab on your iPhone and scan any code below. All are signed by the committed trust anchor and verify fully offline.</p>
 <div class="grid">
 ${cards.map((c) => `<div class="card"><span class="tag">Scan me</span><h2>${c.title}</h2><div class="note">${c.note}</div><div class="qr">${c.svg}</div></div>`).join('')}
 </div>
</body></html>`;

  writeFileSync(OUT, html);
  console.log('Wrote', OUT);
  execFile('open', [OUT], (err) => {
    if (err) console.log('Open it manually:', OUT);
    else console.log('Opened in your browser.');
  });
}

void main();
