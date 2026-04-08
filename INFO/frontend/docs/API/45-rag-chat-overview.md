# RAG chat – áttekintés

Ez a rövid dokumentum összeköti a **RAG chat** fogalmát a meglévő chat endpointokkal és a RAG dokumentumokkal.

## Mi a RAG chat?

A **RAG chat** az a belső (internal) csatornás chat, amely az **indexelt dokumentumokra** épül. Amikor a felhasználó küld egy üzenetet (POST /chat vagy POST /chat/stream, `channel: "internal"`), a rendszer a tenant RAG adatbázisából releváns szakaszokat keres, és a válasz generálásánál ezeket használja. A válasz **sources** mezője pontosan ezekre a forrásokra (doc_id, chunk_id, score stb.) mutat.

## Mely endpointok a RAG chatot szolgálják?

- **POST /chat** (szinkron) – [10-chat-sync.md](10-chat-sync.md)
- **POST /chat/stream** (SSE stream) – [11-chat-stream.md](11-chat-stream.md)
- **POST /api/v1/chat** – egyszerűsített kérés, szintén használja a RAG-ot – [12-api-v1-chat.md](12-api-v1-chat.md)

Mindegyiknél **JWT** hitelesítés kell (internal csatornához), és a válaszban a **sources** tartalmazza a felhasznált RAG forrásokat.

## Kapcsolat a dokumentumokkal

1. **Dokumentum feltöltés:** [42-rag-documents-ingest.md](42-rag-documents-ingest.md) – POST /ingest (PDF, DOCX).
2. **Indexelés:** A feltöltés után a dokumentum az indexelési sorba kerül; az indexelés aszinkron. Az állapot: [43-rag-documents-admin.md](43-rag-documents-admin.md) – GET /admin/documents.
3. **Chat:** Ha a dokumentum indexelése kész (COMPLETED), a fenti chat endpointok a válaszadáshoz már használhatják. A válasz **sources** mezője az indexelt dokumentumokra hivatkozik.

Nincs külön „RAG chat” endpoint: a meglévő internal chat (POST /chat, POST /chat/stream) **az** a RAG chat.

## Teljes folyamat (feltöltés → indexelés → chat)

A lépésenkénti flow (bejelentkezés, feltöltés, állapot ellenőrzés, chat) a [46-flow-rag-upload-index-chat.md](46-flow-rag-upload-index-chat.md) dokumentumban található.

---

## További információ

- Chat sync: [10-chat-sync.md](10-chat-sync.md)
- Chat stream: [11-chat-stream.md](11-chat-stream.md)
- Flow JWT-val: [20-flow-chat-jwt.md](20-flow-chat-jwt.md)
- RAG flow: [46-flow-rag-upload-index-chat.md](46-flow-rag-upload-index-chat.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
