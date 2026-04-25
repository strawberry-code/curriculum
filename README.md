# curriculum

CV statico di Cristiano Cavo. Hosted su Vercel → [cristiano-cavo.vercel.app](https://cristiano-cavo.vercel.app)

## Struttura

| Path | Scopo |
|------|-------|
| `index.html` | CV single-file (HTML + CSS + JS inline, bilingua IT/EN) |
| `vercel.json` | Config deploy statico + security headers |
| `CLAUDE.md` | Istruzioni agente LLM per repo |
| `docs/` | Wiki LLM (vedi sotto) |

## Wiki LLM (`docs/`)

| File | Contenuto |
|------|-----------|
| `CONTEXT_TRANSFER.md` | Sorgente originale strategia + tono utente (read-only storico) |
| `CV_CONTENT.md` | Contenuto strutturato: contatti, esperienze, stack, progetti |
| `STYLE_GUIDE.md` | Design system: palette, font, chip semantics |
| `I18N.md` | Sistema bilingua IT/EN, dict keys, switcher |
| `TASKS.md` | Backlog migliorie + decisioni prese |
| `CHANGELOG.md` | Storico modifiche (Keep a Changelog) |

## Deploy

Auto-deploy on push to `main` via GitHub → Vercel.

Manuale:
```bash
vercel --prod
```

## Modificare il CV

1. Leggi `CLAUDE.md` + `docs/CV_CONTENT.md` + `docs/STYLE_GUIDE.md`.
2. Modifica `index.html` (HTML + entry dict EN per nuove stringhe).
3. Aggiorna `docs/CV_CONTENT.md` + `docs/CHANGELOG.md`.
4. Commit conv. + push.
