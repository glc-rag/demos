# GLC-RAG INFO Demo SPA

Ez egy önálló frontend alkalmazás, amely a GLC-RAG nyilvános API-n keresztül demonstrálja a tenant adminisztrációt és a chat funkciókat.

## Funkciók

- **Auth**: Regisztráció és bejelentkezés (JWT alapú).
- **Info Admin**: Dokumentumok (info elemek) kezelése (CRUD) és indexelés polling.
- **Chat Internal**: Kérdezés a dokumentumok alapján hitelesített (JWT) csatornán.
- **Chat Widget**: Kérdezés nyilvános widget token használatával.

## Technológiai stack

- **Build**: Vite + TypeScript
- **UI**: Natív DOM manipuláció (nincs keretrendszer)
- **HTTP**: Fetch API közös `apiCall` wrapperrel
- **Stílus**: Natív CSS3 (Flexbox/Grid)

## Telepítés és futtatás

1. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

2. Másold le a `.env.example` fájlt `.env` néven:
   ```bash
   cp .env.example .env
   ```

3. Állítsd be a `VITE_API_BASE_URL` változót (alapértelmezett: `https://glc-rag.hu`).

4. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```

5. Build éles használatra:
   ```bash
   npm run build
   ```

## Környezeti változók

| Változó | Leírás |
| --- | --- |
| `VITE_API_BASE_URL` | A GLC-RAG API alap címe (pl. `https://glc-rag.hu`). |
| `VITE_PUBLIC_WIDGET_TOKEN` | (Opcionális) Alapértelmezett token a Widget fülhöz. |

## CORS és Proxy

Fejlesztés során a `vite.config.ts` tartalmaz egy proxy beállítást a `/auth`, `/admin`, `/chat`, `/widget` utakra, hogy elkerülje a CORS hibákat, ha az API nem engedélyezi a `localhost`-ot.

## UX Checklist (12. fejezet)

- [x] **Dokumentum és eszköz**: `lang="hu"`, viewport meta, egyértelmű title/description.
- [x] **Visszajelzés**: Gombok letiltva betöltés alatt, szöveges visszajelzés ("Mentés...").
- [x] **Üres állapotok**: Üzenet, ha a lista üres vagy nincs válasz.
- [x] **Hibaüzelnetek**: Felhasználóbarát hálózati és API hibaüzenetek (401, 429, 4xx).
- [x] **Akadálymentesség**: Label-ek, logikus tab sorrend, kontrasztos színek.
- [x] **Biztonság**: `textContent` használata az API válaszoknál XSS ellen.
- [x] **Segítség**: Rövid leírások a funkciókhoz.

## Deploy megjegyzések

- Élesben **HTTPS** használata kötelező a tokenek biztonsága érdekében.
- Ha nem a gyökér könyvtárban fut az app, állítsd be a `base` opciót a `vite.config.ts`-ben.
