# RAG dokumentum feltöltés (ingest)

Ez a dokumentum a **POST /ingest** endpointot mutatja be: dokumentum feltöltés és indexelési sorba helyezés.

**OpenAPI:** tag **Documents**, path `POST /ingest` (openapi.json / Redoc).

## Leírás

A POST /ingest endpointtal PDF vagy DOCX fájlt tölthetsz fel. A fájl az indexelési sorba kerül; az indexelés aszinkron (háttérben fut). A válasz a `job_id`-t és a `status: queued` értéket adja vissza. Az indexelés állapotát a **GET /admin/documents** listán vagy az admin felületen ellenőrizheted.

**Hitelesítés:** JWT kötelező (Authorization: Bearer &lt;token&gt;). Szerepkör: EDITOR, TENANT_ADMIN vagy SYSTEM_ADMIN. Az egyenlegnek pozitívnak kell lennie (402 egyébként).

## Request

### Endpoint

```
POST /ingest
```

### Request body (multipart/form-data)

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **file** | File | Igen | PDF vagy DOCX fájl. |
| **scope** | string | Nem | `internal` (alapértelmezett) vagy `public`. |
| **file_path** | string | Nem | Opcionális útvonal; ha nincs, a rendszer generál. |

### Headers

| Header | Érték | Leírás |
|--------|-------|--------|
| **Authorization** | Bearer &lt;token&gt; | JWT token. |
| **Content-Type** | multipart/form-data | A kliens általában automatikusan beállítja. |

## Válasz

Sikeres válasz példa:

```json
{
  "job_id": "uuid",
  "status": "queued",
  "message": "Document queued for indexing"
}
```

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/ingest"
token = "<token>"

with open("document.pdf", "rb") as f:
    files = {"file": ("document.pdf", f, "application/pdf")}
    data = {"scope": "internal"}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(url, files=files, data=data, headers=headers)

print(response.status_code)
print(response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url = `${BASE_URL}/ingest`;
const token = "<token>";

const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("scope", "internal");

const response = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
});
const result = await response.json();
console.log(response.status, result);
```

### cURL

```bash
curl -X POST "$BASE_URL/ingest" \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "scope=internal"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url = $BASE_URL . "/ingest";
$token = "<token>";
$cfile = new CURLFile("document.pdf", "application/pdf", "document.pdf");

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, ["file" => $cfile, "scope" => "internal"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo $code . "\n" . $response . "\n";
?>
```

---

## Tippek

- **Aszinkron indexelés:** A feltöltés után a dokumentum sorban áll; az állapot (PENDING, PROCESSING, COMPLETED, FAILED) a **GET /admin/documents** listán látható.
- **Támogatott formátumok:** Csak PDF és DOCX. DOC (régi formátum) nem támogatott.
- **Egyenleg:** A feltöltés és indexelés tokenegyenleget használ; 402 esetén töltse fel az egyenleget.

---

## További információ

- Dokumentum lista és állapot: [43-rag-documents-admin.md](43-rag-documents-admin.md)
- RAG chat (internal): [10-chat-sync.md](10-chat-sync.md), [20-flow-chat-jwt.md](20-flow-chat-jwt.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
