# Facebook B2B Comments Admin

Facebook B2B Comments admin panel - egy webalkalmazás a Facebook kommentek kezelésére a GLC-RAG API segítségével.

## Funkciók

- **Regisztráció és bejelentkezés** - JWT alapú hitelesítés
- **Facebook profilok kezelése** - Profilok listázása, létrehozása, szerkesztése, törlése
- **Kommentek kezelése** - Kommentek listázása, státuszok, válasz küldése

## Technológia

- **Frontend**: TypeScript, HTML, CSS
- **Build**: Vite
- **API**: GLC-RAG API (https://glc-rag.hu)

## Futtatás

```bash
cd faceboook/app
npm install
npm run dev
```

A fejlesztői szerver elindul a `http://localhost:5173` címen.

## API Endpointok

### Profilok

- `GET /admin/fb/profiles` - Profilok listázása
- `PUT /admin/fb/profiles/{id}` - Profil módosítása
- `POST /admin/fb/profiles` - Új profil létrehozása
- `DELETE /admin/fb/profiles/{id}` - Profil törlése

### Kommentek

- `GET /admin/fb/profiles/{id}/comments` - Kommentek listázása
- `POST /admin/fb/profiles/{id}/comments/{comment_id}/send` - Válasz küldése

## Hitelesítés

JWT (sessionStorage) és opcionálisan `X-API-Key` (env vagy localStorage) a `fb_comment` scope-hoz illő hívásokhoz.

## Konfiguráció

A `.env` fájlban állítható be az API alap URL:

```
VITE_API_BASE_URL=https://glc-rag.hu
VITE_LEGAL_URL=#
```

## Dokumentáció

Részletes API dokumentáció: [`docs/API/26-flow-facebook-b2b-comments.md`](../../docs/API/26-flow-facebook-b2b-comments.md)