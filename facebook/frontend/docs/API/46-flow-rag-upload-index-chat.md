# Teljes folyamat: RAG feltöltés → indexelés → chat

Ez a dokumentum egy teljes RAG folyamatot mutat be: bejelentkezés, dokumentum feltöltés, indexelés állapotának ellenőrzése, majd chat hívás (amely az indexelt dokumentumokat használja).

## A folyamat lépései

1. **Bejelentkezés** – JWT token lekérése (POST /auth/login).
2. **Dokumentum feltöltés** – POST /ingest (PDF vagy DOCX); válasz: job_id, status queued.
3. **Indexelés állapota** – GET /admin/documents; várjuk, amíg a job statusa COMPLETED (vagy rövid várakozás).
4. **Chat** – POST /chat vagy POST /chat/stream (channel: internal); a válasz **sources** mezője az indexelt dokumentumokra mutat.

---

## Lépés 1: Bejelentkezés

POST /auth/login – body: pl. email, password (a backend LoginRequest szerint). Válasz: access_token. A tokent használjuk a következő lépésekben.

Részletek: [01-auth-jwt.md](01-auth-jwt.md), [23-flow-login-then-chat.md](23-flow-login-then-chat.md).

---

## Lépés 2: Dokumentum feltöltés

POST /ingest – multipart/form-data: file (PDF/DOCX), scope (internal). Válasz: job_id, status "queued".

### Python

```python
import requests
BASE_URL = "https://<your-api-host>"
token = "<token>"
with open("doc.pdf", "rb") as f:
    r = requests.post(
        f"{BASE_URL}/ingest",
        files={"file": ("doc.pdf", f, "application/pdf")},
        data={"scope": "internal"},
        headers={"Authorization": f"Bearer {token}"}
    )
data = r.json()
job_id = data["job_id"]
print("Job ID:", job_id)
```

### cURL

```bash
curl -X POST "$BASE_URL/ingest" \
  -H "Authorization: Bearer <token>" \
  -F "file=@doc.pdf" \
  -F "scope=internal"
```

---

## Lépés 3: Indexelés állapotának ellenőrzése

GET /admin/documents – query: scope=internal (opcionális limit, offset). A válasz documents listájában keressük a job_id-hoz tartozó elemét; a **status** mező: PENDING, PROCESSING, COMPLETED vagy FAILED. Ha COMPLETED, a dokumentum már használható a chatben.

### Python

```python
import time
while True:
    r = requests.get(
        f"{BASE_URL}/admin/documents",
        headers={"Authorization": f"Bearer {token}"},
        params={"scope": "internal", "limit": 100}
    )
    docs = r.json().get("documents", [])
    job = next((d for d in docs if d["job_id"] == job_id), None)
    if job and job["status"] == "COMPLETED":
        print("Indexelés kész.")
        break
    if job and job["status"] == "FAILED":
        print("Indexelés sikertelen:", job.get("error_message"))
        break
    time.sleep(2)
```

### cURL

```bash
curl -X GET "$BASE_URL/admin/documents?scope=internal&limit=100" \
  -H "Authorization: Bearer <token>"
```

---

## Lépés 4: Chat (RAG válasz)

POST /chat – body: channel "internal", text (kérdés), session_id. Válasz: trace_id, text, **sources** (RAG források). A feltöltött és indexelt dokumentum tartalma a válasz generálásánál és a sources-ben jelenik meg.

### Python

```python
r = requests.post(
    f"{BASE_URL}/chat",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={
        "channel": "internal",
        "text": "Összefoglalód a feltöltött dokumentumból!",
        "session_id": "flow-rag-session-1"
    }
)
data = r.json()
print("Válasz:", data.get("text"))
print("Források:", data.get("sources", []))
```

### cURL

```bash
curl -X POST "$BASE_URL/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"channel":"internal","text":"Összefoglalód a feltöltött dokumentumból!","session_id":"flow-rag-session-1"}'
```

---

## Tippek

- **Session_id:** Tetszőleges egyedi azonosító (pl. UUID); a chat kontextusához.
- **Stream:** POST /chat/stream ugyanazzal a body-val SSE választ ad; a források a stream eseményekben is megjelenhetnek.
- **Időzítés:** Az indexelés másodpercektől akár percekig is tarthat; a 3. lépésben érdemes poll-olni vagy rövid várakozás után chatelni.

---

## Kapcsolódó dokumentumok

- Bejelentkezés és chat: [23-flow-login-then-chat.md](23-flow-login-then-chat.md)
- Ingest: [42-rag-documents-ingest.md](42-rag-documents-ingest.md)
- Admin documents: [43-rag-documents-admin.md](43-rag-documents-admin.md)
- RAG chat áttekintés: [45-rag-chat-overview.md](45-rag-chat-overview.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
