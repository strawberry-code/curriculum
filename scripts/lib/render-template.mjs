// Assembla scripts/print/cv-template.html a partire dai dati estratti da extract-cv.mjs.
// Solo string-replace: nessun motore di templating, il template è un file statico con
// placeholder {{FLAT}} e slot <!--SLOT:NOME--> sostituiti qui, in un unico passo di build.

const CONTACT_ORDER = ['contact_email', 'contact_pec', 'contact_tel', 'contact_github', 'contact_linkedin', 'contact_sede'];

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderContacts(contacts) {
  return CONTACT_ORDER
    .filter((key) => contacts[key])
    .map((key) => {
      const c = contacts[key];
      const valueHtml = c.href ? `<a href="${escapeHtml(c.href)}">${escapeHtml(c.value)}</a>` : escapeHtml(c.value);
      return `<span class="item"><span class="k">${escapeHtml(c.label)}</span> ${valueHtml}</span>`;
    })
    .join('\n');
}

function renderProfile(profile) {
  return profile.map((p) => `<li>${p}</li>`).join('\n');
}

function renderExperiences(experiences) {
  return experiences
    .map((exp) => {
      const whenClass = exp.current ? 'cv-exp-when current' : 'cv-exp-when';
      const tags = exp.tags.join(' · ');
      return `<article class="cv-exp">
  <div class="cv-exp-meta">
    <span class="${whenClass}">${escapeHtml(exp.when)}</span>
    <span class="cv-exp-where">${escapeHtml(exp.where)}</span>
  </div>
  <h3 class="cv-exp-title"><span class="org">${escapeHtml(exp.org)}</span> <span class="at">${escapeHtml(exp.at)}</span></h3>
  <p class="cv-exp-desc">${exp.desc}</p>${tags ? `\n  <p class="cv-exp-tags">${escapeHtml(tags)}</p>` : ''}
</article>`;
    })
    .join('\n');
}

function renderAgenticCaps(caps) {
  return caps
    .map(
      (cap) => `<div class="cv-agentic-item">
  <div class="cv-agentic-tag">${escapeHtml(cap.tag)}</div>
  <div><span class="cv-agentic-name">${escapeHtml(cap.name)}</span> <span class="cv-agentic-desc">— ${cap.desc}</span></div>
</div>`
    )
    .join('\n');
}

function renderStack(stack) {
  return stack
    .map((col) => {
      const items = col.items
        .map((item) => `  <div class="cv-stack-item"><strong>${escapeHtml(item.t)}</strong> <span class="o">— ${escapeHtml(item.o)}</span></div>`)
        .join('\n');
      return `<div class="cv-stack-cat">
  <h3 class="cv-stack-cat-title">${escapeHtml(col.category)}</h3>
${items}
</div>`;
    })
    .join('\n');
}

function renderFormList(items) {
  return items
    .map(
      (item) =>
        `<div class="cv-form-item"><span class="t">${escapeHtml(item.t)}</span> — <span class="o">${escapeHtml(item.o)}</span>${
          item.d ? ` <span class="d">${escapeHtml(item.d)}</span>` : ''
        }</div>`
    )
    .join('\n');
}

function renderQualifications(qualifications) {
  const parts = [];
  if (qualifications.albo) {
    const a = qualifications.albo;
    parts.push(
      `<div class="cv-form-item"><span class="t">${escapeHtml(a.t)}</span> — <span class="o">${escapeHtml(a.o)}</span> <span class="d">${escapeHtml(a.d)}</span></div>`
    );
  }
  qualifications.referees.forEach((r) => {
    parts.push(`<div class="cv-form-item"><span class="o">${escapeHtml(r.o)}</span></div>`);
  });
  return parts.join('\n');
}

function renderLanguages(languages) {
  return languages
    .map((l) => `<div class="cv-form-item"><span class="t">${escapeHtml(l.name)}</span> — <span class="o">${escapeHtml(l.level)}</span></div>`)
    .join('\n');
}

function renderAffiliations(affiliations) {
  return affiliations
    .map(
      (a) => `<div class="cv-affil">
  <h3 class="cv-affil-title">${a.h}</h3>
  <div class="cv-affil-org">${escapeHtml(a.org)}</div>
  <p class="cv-affil-p">${a.p1}</p>
</div>`
    )
    .join('\n');
}

export function renderCvHtml(template, data, lang) {
  const flatMap = {
    HTML_LANG: lang,
    DOC_TITLE: escapeHtml(`CV — ${data.header.name} — ${lang.toUpperCase()}`),
    HEADER_NAME: escapeHtml(data.header.name),
    HEADER_EYEBROW: escapeHtml(data.header.eyebrow),
    HEADER_TAGLINE: data.header.tagline,
    PROFILE_TITLE: escapeHtml(data.profileTitle),
    EXP_TITLE: escapeHtml(data.sectionTitles.exp),
    AGENTIC_TITLE: escapeHtml(data.sectionTitles.agentic),
    AGENTIC_INTRO: data.agenticIntro,
    STACK_TITLE: escapeHtml(data.sectionTitles.stack),
    FORM_TITLE: escapeHtml(data.sectionTitles.form),
    EDU_LABEL: escapeHtml(data.formLabels.edu),
    QUAL_LABEL: escapeHtml(data.formLabels.qual),
    LANG_LABEL: escapeHtml(data.formLabels.lang),
    AMBITI_TITLE: escapeHtml(data.sectionTitles.ambiti),
  };

  let out = template.replace(/\{\{(\w+)\}\}/g, (_, key) => flatMap[key] ?? '');

  const slots = {
    'SLOT:CONTACTS': renderContacts(data.contacts),
    'SLOT:PROFILE': renderProfile(data.profile),
    'SLOT:EXPERIENCES': renderExperiences(data.experiences),
    'SLOT:AGENTIC': renderAgenticCaps(data.agenticCaps),
    'SLOT:STACK': renderStack(data.stack),
    'SLOT:EDUCATION': renderFormList(data.education),
    'SLOT:QUALIFICATIONS': renderQualifications(data.qualifications),
    'SLOT:LANGUAGES': renderLanguages(data.languages),
    'SLOT:AFFILIAZIONI': renderAffiliations(data.affiliations),
  };

  out = out.replace(/<!--(SLOT:[A-Z]+)-->/g, (_, key) => slots[key] ?? '');

  return out;
}
