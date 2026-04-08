# Facebook B2B Comments Admin

A Facebook B2B Comments Admin egy webalkalmazás, amely a GLC-RAG API segítségével teszi lehetővé a Facebook üzleti oldal kommentjeinek hatékony kezelését.

## 🌐 Domain

- **glc-rag.hu** - A fő API és szolgáltatások központja

## 📋 Leírás

Ez az alkalmazás egy adminisztrációs felületet biztosít Facebook B2B (Business-to-Business) oldalainak kommentjeinek kezelésére. A rendszer lehetővé teszi a profilok létrehozását, szerkesztését és törlését, valamint a kommentek listázását és válaszok küldését.

## ✨ Funkciók

- **Regisztráció és bejelentkezés** - JWT alapú biztonságos hitelesítés
- **Facebook profilok kezelése** - Profilok listázása, létrehozása, szerkesztése, törlése
- **Kommentek kezelése** - Kommentek listázása, státuszok kezelése, válaszok küldése
- **API integráció** - GLC-RAG API használatával történő kommunikáció

## 🛠️ Technológia

- **Frontend**: TypeScript, HTML, CSS
- **Build rendszer**: Vite
- **API**: GLC-RAG API (https://glc-rag.hu)

## 🚀 Futtatás

```bash
cd faceboook/app
npm install
npm run dev
```

A fejlesztői szerver elindul a `http://localhost:5173` címen.

## 🔐 Hitelesítés

- **JWT** (sessionStorage) - Session alapú hitelesítés
- **X-API-Key** (env vagy localStorage) - API kulcs alapú hitelesítés
- `fb_comment` scope-hoz illő hívások

## ⚙️ Konfiguráció

A `.env` fájlban állítható be az API alap URL:

```env
VITE_API_BASE_URL=https://glc-rag.hu
VITE_LEGAL_URL=#
```

## 📁 Projekt Struktúra

```
faceboook/
├── app/                    # Fő alkalmazás
│   ├── src/               # Forráskód
│   │   ├── api.ts         # API hívások
│   │   ├── auth.ts        # Hitelesítés
│   │   ├── fbAdmin.ts     # Facebook admin funkciók
│   │   └── main.ts        # Fő bevitel
│   ├── index.html         # HTML sablon
│   ├── style.css          # Stílusok
│   └── package.json       # NPM konfiguráció
└── docs/                  # Dokumentáció
    └── API/               # API dokumentáció
```

## 📚 Dokumentáció

Részletes API dokumentáció a `docs/API/` mappában található. Fontos dokumentációk:

- [Facebook B2B Comments Flow](docs/API/26-flow-facebook-b2b-comments.md) - A fő folyamat leírása
- [Auth JWT](docs/API/01-auth-jwt.md) - Hitelesítési folyamat
- [API Endpoint Matrix](docs/API/41-endpoint-matrix.md) - Endpointok áttekintése

## 🔗 Kapcsolódó Szolgáltatások

- **glc-rag.hu** - Fő API platform
- **glc-rag.hu/api** - API dokumentáció
- **glc-rag.hu/docs** - Teljes dokumentáció

## 📄 Licenc

Copyright © 2024 GLC-RAG. Minden jog fenntartva.
