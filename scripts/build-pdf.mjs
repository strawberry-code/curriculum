#!/usr/bin/env node
// Genera cv-cristiano-cavo-it.pdf / -en.pdf a partire dal DOM live di index.html.
// Fonte di verità unica: nessun contenuto è scritto a mano qui, tutto viene letto dal sito
// (IT di default, EN dopo click su [data-lang="en"]) per garantire che web e PDF non divergano mai.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

import { extractCvData } from './lib/extract-cv.mjs';
import { translateLocation } from './lib/city-map.mjs';
import { renderCvHtml } from './lib/render-template.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'index.html');
const templatePath = path.join(__dirname, 'print', 'cv-template.html');
const debug = process.argv.includes('--debug');

function applyCityMap(data) {
  const contacts = { ...data.contacts };
  if (contacts.contact_sede) {
    contacts.contact_sede = { ...contacts.contact_sede, value: translateLocation(contacts.contact_sede.value) };
  }
  const experiences = data.experiences.map((exp) => ({ ...exp, where: translateLocation(exp.where) }));
  return { ...data, contacts, experiences };
}


async function main() {
  const browser = await chromium.launch();
  try {
    const pageA = await browser.newPage();
    await pageA.goto(`file://${indexPath}`);
    await pageA.waitForLoadState('networkidle');

    const dataIT = await pageA.evaluate(extractCvData);

    await pageA.click('[data-lang="en"]');
    const dataEN_raw = await pageA.evaluate(extractCvData);
    const dataEN = applyCityMap(dataEN_raw);

    await pageA.close();

    const template = await fs.readFile(templatePath, 'utf-8');

    const pageB = await browser.newPage();
    for (const [lang, data] of [
      ['it', dataIT],
      ['en', dataEN],
    ]) {
      const html = renderCvHtml(template, data, lang);

      if (debug) {
        const debugDir = path.join(__dirname, '.tmp');
        await fs.mkdir(debugDir, { recursive: true });
        await fs.writeFile(path.join(debugDir, `cv-print-${lang}.html`), html, 'utf-8');
      }

      await pageB.setContent(html, { waitUntil: 'networkidle' });
      await pageB.evaluate(() => document.fonts.ready);
      const geistOk = await pageB.evaluate(() => document.fonts.check('700 32px Geist'));
      if (!geistOk) {
        console.warn(`[build-pdf] Geist non risulta caricato per lang=${lang} — verifica la connessione di rete, il PDF userà un font di fallback.`);
      }

      await pageB.emulateMedia({ media: 'print' });
      const outPath = path.join(repoRoot, `cv-cristiano-cavo-${lang}.pdf`);
      await pageB.pdf({ path: outPath, format: 'A4', printBackground: true, preferCSSPageSize: true });

      const stat = await fs.stat(outPath);
      console.log(`[build-pdf] ${path.relative(repoRoot, outPath)} — ${(stat.size / 1024).toFixed(0)} KB`);
    }

    await pageB.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[build-pdf] fallito:', err);
  process.exit(1);
});
