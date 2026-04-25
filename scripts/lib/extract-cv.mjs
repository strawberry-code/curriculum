// extractCvData gira DENTRO al browser via page.evaluate(extractCvData): Playwright serializza
// solo il testo sorgente di questa funzione, quindi ogni helper deve essere dichiarato AL SUO
// INTERNO (niente import, niente riferimenti a binding esterni del modulo Node).
//
// Fonte di verità unica: legge il DOM live di index.html, nello stato lingua corrente
// (IT di default, EN dopo click su [data-lang="en"]) — mai testo riscritto a mano altrove.
export function extractCvData() {
  const text = (el) => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');

  // Whitelist minima (contenuto fidato, autorato dal proprietario del sito): tiene solo
  // strong/em/br, rimuove ogni altro tag (span.accent, span.it, classi del sito) preservandone
  // il testo interno, per non trascinare markup/CSS del sito nel template print.
  function sanitizeInline(rawHtml) {
    if (!rawHtml) return '';
    return rawHtml
      .replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, '')
      .replace(/<(strong|em|br)\b[^>]*>/gi, '<$1>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const html = (el) => (el ? sanitizeInline(el.innerHTML) : '');

  const contacts = {};
  document.querySelectorAll('.contact-strip .item').forEach((item) => {
    const kEl = item.querySelector('.k');
    if (!kEl) return;
    const key = kEl.getAttribute('data-i18n');
    const label = text(kEl);
    const clone = item.cloneNode(true);
    clone.querySelector('.k').remove();
    const anchor = clone.querySelector('a');
    contacts[key] = { label, value: text(clone), href: anchor ? anchor.getAttribute('href') : null };
  });

  const experiences = Array.from(document.querySelectorAll('#esperienze .exp-list > .exp')).map((exp) => ({
    current: exp.querySelector('.exp-meta').classList.contains('current'),
    when: text(exp.querySelector('.when')),
    where: text(exp.querySelector('.where')),
    org: text(exp.querySelector('h3 .org')),
    at: text(exp.querySelector('h3 .at')),
    desc: html(exp.querySelector('.exp-desc')),
    tags: Array.from(exp.querySelectorAll('.exp-tags .chip')).map((c) => text(c)),
  }));

  const agenticCaps = Array.from(document.querySelectorAll('#agentic .cap-grid > .cap')).map((cap) => ({
    tag: text(cap.querySelector('.cap-tag')),
    name: text(cap.querySelector('.cap-name')),
    desc: html(cap.querySelector('.cap-desc')),
  }));

  const stack = Array.from(document.querySelectorAll('#stack .three-col > .tcol')).map((col) => ({
    category: text(col.querySelector('.tcol-eye')),
    items: Array.from(col.querySelectorAll('.tcol-item')).map((item) => ({
      t: text(item.querySelector('.t')),
      o: text(item.querySelector('.o')),
    })),
  }));

  const formTcols = document.querySelectorAll('#formazione .three-col > .tcol');

  const education = Array.from(formTcols[0]?.querySelectorAll('.tcol-item') ?? []).map((item) => ({
    t: text(item.querySelector('.t')),
    o: text(item.querySelector('.o')),
    d: text(item.querySelector('.d')),
  }));

  const qualItems = Array.from(formTcols[1]?.querySelectorAll('.tcol-item') ?? []).map((item) => ({
    t: text(item.querySelector('.t')),
    o: text(item.querySelector('.o')),
    d: text(item.querySelector('.d')),
  }));
  // Il primo item della colonna Qualifiche è l'Albo; gli altri sono i referee accademici.
  // Le email dei referee (nel campo .d) sono dati di terzi: escluse dal PDF di proposito.
  const qualifications = {
    albo: qualItems[0] ?? null,
    referees: qualItems.slice(1).map((r) => ({ o: r.o })),
  };

  const languages = Array.from(formTcols[2]?.querySelectorAll('.lang') ?? []).map((l) => {
    const nameEl = l.querySelector('.lang-name');
    const skillEl = nameEl.querySelector('.skill');
    const level = text(skillEl);
    const name = text(nameEl).replace(level, '').trim();
    return { name, level };
  });

  // Solo p1 (sintesi) per ogni affiliazione: p2 è l'approfondimento pensato per web/modale,
  // .affil-event è contenuto con scadenza (rischia di invecchiare su un PDF rigenerato a mano).
  const affiliations = Array.from(document.querySelectorAll('#ambiti .affil-grid > .affil')).map((a) => ({
    h: html(a.querySelector('h4')),
    org: text(a.querySelector('.affil-org')),
    p1: html(a.querySelector('.affil-body > p:first-child')),
  }));

  return {
    header: {
      name: text(document.querySelector('h1[data-i18n="hero_h1"]')),
      eyebrow: text(document.querySelector('.hero-eye')),
      tagline: html(document.querySelector('.hero-tagline')),
    },
    contacts,
    profileTitle: text(document.querySelector('[data-i18n="offer_eye"]')),
    profile: Array.from(document.querySelectorAll('#offerta .offer-col.offer .offer-list li')).map((li) => html(li)),
    experiences,
    agenticIntro: html(document.querySelector('[data-i18n="agentic_p1"]')),
    agenticCaps,
    stack,
    education,
    qualifications,
    languages,
    affiliations,
    sectionTitles: {
      exp: text(document.querySelector('[data-i18n="sec_exp_eye"]')),
      agentic: text(document.querySelector('[data-i18n="sec_ag_eye"]')),
      stack: text(document.querySelector('[data-i18n="sec_stack_eye"]')),
      form: text(document.querySelector('[data-i18n="sec_form_eye"]')),
      ambiti: text(document.querySelector('[data-i18n="sec_amb_eye"]')),
    },
    // Etichette Education/Qualifiche/Lingue: già data-i18n sul sito (Education resta invariato
    // anche in IT, per scelta stilistica del sito) — riusate così, mai reinventate qui.
    formLabels: {
      edu: text(document.querySelector('[data-i18n="form_eye_edu"]')),
      qual: text(document.querySelector('[data-i18n="form_eye_qual"]')),
      lang: text(document.querySelector('[data-i18n="form_eye_lang"]')),
    },
  };
}
