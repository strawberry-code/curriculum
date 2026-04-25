# CLAUDE.md — Repo `curriculum`

Istruzioni per agente LLM (Claude Code) che lavora su questo repo.

## Cosa è questo repo

CV statico HTML single-file di **Cristiano Cavo**, deploy Vercel su `cristiano-cavo.vercel.app`.
Il CV viene mantenuto e iterato nel tempo: nuove esperienze, nuovi progetti, refresh stack, traduzioni EN.

## Principi operativi

1. **Single-file HTML.** `index.html` è autocontenuto: HTML + `<style>` + `<script>` inline. NON spezzare in asset esterni senza approvazione esplicita utente.
2. **Bilingue IT/EN.** Ogni stringa visibile DEVE avere `data-i18n="key"` + entry nel dict `T_EN` dentro `<script>`. Vedi `docs/I18N.md`.
3. **Design system fisso.** Palette CSS variables, font (Instrument Serif / Geist / JetBrains Mono), semantica chip — vedi `docs/STYLE_GUIDE.md`. NON introdurre colori/font fuori sistema senza approvazione.
4. **Print-friendly.** Mantieni `@media print` funzionante a ogni modifica strutturale.
5. **Aggiorna `docs/CHANGELOG.md`** ad ogni modifica sostanziale al CV (nuova sezione, nuova esperienza, refactor stile).
6. **Aggiorna `docs/CV_CONTENT.md`** quando aggiungi/modifichi contenuti (esperienze, stack, progetti) — è la fonte strutturata machine-readable.
7. **Conventional Commits italiano.** `feat(cv): aggiunta sezione X` / `fix(i18n): traduzione Y` / `chore(docs): update wiki`.
8. **Git history piatta.** Repo deve avere SEMPRE 1 solo commit visibile (`feat: initial CV static site`). Ogni modifica successiva DEVE essere foldata nel root commit via:
   ```bash
   git add <files>
   git commit --amend --no-edit          # fold direttamente in HEAD (= root, sempre)
   git push --force-with-lease origin main
   ```
   Poiché c'è 1 solo commit, `HEAD` coincide sempre con root → `--amend` è sufficiente, niente `reset --soft`. NON creare nuovi commit sopra l'initial. Override esplicito utente delle regole globali "no amend / no force push" per questo repo.

## Wiki / docs

| File | Scopo |
|------|-------|
| `docs/CONTEXT_TRANSFER.md` | Sorgente originale (sessione 2026-04-25). Contesto strategia, tono utente, decisioni di posizionamento. Read-only storico. |
| `docs/CV_CONTENT.md` | Contenuto CV strutturato: contatti, esperienze, stack, progetti, formazione. Mantieni allineato a `index.html`. |
| `docs/STYLE_GUIDE.md` | Design system: palette, font, chip semantics, struttura sezioni. |
| `docs/I18N.md` | Sistema bilingua: come aggiungere stringhe, dict key naming, switcher. |
| `docs/TASKS.md` | Backlog migliorie future + scelte rimandate. |
| `docs/CHANGELOG.md` | Storico modifiche CV (Keep a Changelog). |

## Workflow tipico per modifica CV

1. Leggi `docs/CV_CONTENT.md` + `docs/STYLE_GUIDE.md` per contesto.
2. Modifica `index.html` (sezione HTML + entry dict EN se nuovo testo).
3. Aggiorna `docs/CV_CONTENT.md` con il nuovo dato.
4. Aggiungi entry in `docs/CHANGELOG.md`.
5. Apri `index.html` in browser per validazione visiva (chiedi utente di farlo, sandbox non ha browser).
6. Commit conv. + push. Vercel deploya auto se collegato a GitHub.

## Tono utente

Italiano, casual ma preciso. Apprezza onestà e analisi pro/contro su scelte di posizionamento. Niente sì-sì. Conciso ma sostanzioso. Vedi §7 di `docs/CONTEXT_TRANSFER.md`.

## Deploy

- GitHub: `strawberry-code/curriculum`
- Vercel: `cristiano-cavo` → `https://cristiano-cavo.vercel.app`
- Auto-deploy on push to `main` (se import da dashboard configurato)
- Manual: `vercel --prod` da repo root
