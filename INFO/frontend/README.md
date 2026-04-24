# GLC-RAG INFO Frontend + API Spec Hub

Ez a repository a GLC-RAG INFO admin/frontend munkaterulete:
- futtathato frontend app: `app/`
- API es folyamat dokumentacio: `docs/API/`

Ez a README a jelenlegi, tenylegesen hasznalt allapotot foglalja ossze.

---

## 1) Mi van benne?

### Frontend app (`app/`)
- Auth (register/login/logout, JWT)
- Info elemek CRUD kezelese (`/admin/info`)
- Indexeles es polling
- Web crawl inditas URL-bol, status kovetes, megszakitas (`/admin/info/from-url/*`)
- Internal chat (JWT)
- Public widget chat + token kezeles
- Info kerdoivek admin felulet:
  - Beallitasok
  - Csoport -> kerdoiv -> mezok szerkesztese
  - Bekuldesek lista

### Dokumentacio (`docs/API/`)
- teljes endpoint es flow referencia
- kulon dokumentumok:
  - `47-info-chat-and-admin.md`
  - `48-info-web-crawl-from-url.md`
  - `49-info-surveys-public-widget.md`

---

## 2) Gyors inditas

API regisztracio:
- Regisztralas az oldalon: `https://glc-rag.hu/`

Lepj be az app mappaba:

```bash
cd app
```

Telepites:

```bash
npm install
```

Kornyezeti file:

```bash
cp .env.example .env
```

Minimum beallitas:

```env
VITE_API_BASE_URL=https://glc-rag.hu
```

Fejlesztoi futtatas:

```bash
npm run dev
```

Build ellenorzes:

```bash
npm run build
```

---

## 3) Jelenlegi mukodes (frontend)

### Info admin
- Lista, letrehozas, szerkesztes, torles
- Indexeles allapot (`NOT_INDEXED/PENDING/PROCESSING/INDEXED/FAILED`)
- Reindex trigger

### Web crawl (spec: 48)
- URL(al) inditas admin feluletrol
- Job allapot es esemenyek megjelenitese
- futas kozbeni polling
- cancel tamogatas

### Surveys (spec: 49)
- Settings card:
  - `info_surveys_enabled`
  - `survey_notification_email`
- Szerkeszto:
  - uj csoport gomb panelt nyit
  - csoportonkent legfeljebb 1 kerdoiv logika
  - kerdoiv letrehozas/szerkesztes modalban
  - mezo hozzaadas/szerkesztes modalban
  - tipusfuggo mezo logika (`text/email/boolean/checkbox`)
  - checkboxnal opciok kotelezok
- Bekuldesek tab:
  - idopont, kerdoiv, session, email status

Megjegyzes: a survey UI tobbszoros backend payload varianssal probal kompatibilis lenni (kulonbozo mezonev-konvenciok miatt).

---

## 4) Fobb endpoint csoportok

- Auth: `/auth/*`
- Info admin: `/admin/info*`
- Survey admin: `/admin/survey*`
- Chat: `/chat`, `/chat/stream`, `/api/v1/chat`
- Widget: `/widget/*`

Reszletes, forrasnak tekintett leiras: `docs/API/*.md` es backend OpenAPI (`/openapi.json`).

---

## 5) Technologia

- Vite
- TypeScript
- Vanilla DOM frontend (framework nelkul)
- Fetch API wrapper (`app/src/api.ts`)
- CSS (egyedi stiluslap)

---

## 6) Projekt struktura

```text
info/
  app/                 # futtathato frontend
    src/
    index.html
    style.css
    package.json
  docs/
    API/               # endpoint + flow dokumentacio
  README.md
```

---

## 7) Fejlesztoi megjegyzesek

- A root mappaban nincs kulon npm projekt; az app kulon all (`info/app`).
- Minimalis automata ellenorzes jelenleg a `npm run build`.
- Ha CORS gond van lokalis fejlesztesben, ellenorizd a `vite.config.ts` proxy beallitasait.

---

## 8) Kapcsolodo specifikaciok (ajanlott olvasasi sorrend)

1. `docs/API/00-attekinto.md`
2. `docs/API/47-info-chat-and-admin.md`
3. `docs/API/48-info-web-crawl-from-url.md`
4. `docs/API/49-info-surveys-public-widget.md`
5. `docs/API/41-endpoint-matrix.md`

---

## 9) Statusz

Ez a README a 2026-04-25-i allapot szerint frissitett, a repositoryban jelenleg implementalt frontend viselkedessel osszhangban.

---

## 10) GitHub — igy lesz „szem elott”

A GitHub a repository **gyokerében** levo `README.md`-t mutatja a repó főoldalán. Ez a fájl maradjon az `info` gyökerében (ahogy most is van).

**Elso feltöltés** (üres GitHub-repó letrehozása után, README nélkül a GitHubon):

```bash
cd info
git remote add origin https://github.com/FELHASZNALO/REPO-NEV.git
git push -u origin main
```

**Frissítés** később:

```bash
cd info
git add -A
git commit -m "Leiras a valtozasrol"
git push
```

Ha még nincs `origin`: `git remote -v` — üres esetén add hozzá az `git remote add origin ...` paranccsal. Bejelentkezés: GitHub Personal Access Token (HTTPS) vagy SSH kulcs.
