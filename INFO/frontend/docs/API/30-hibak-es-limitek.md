# Hibák és limiték

Ez a dokumentum összefoglalja a GLC-RAG API lehetséges hibáit és limitjeit.

## HTTP státuskódok

### 400 Bad Request

A kérés érvénytelen vagy hiányos.

#### Lehetőségek

- Hiányzó kötelező mező a request body-ban
- Érvénytelen JSON formátum
- Üres text mező (chat endpointoknál)

#### Példa válasz

```json
{
  "detail": "text is required"
}
```

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/chat"
payload = {}  # Hiányzó text mező

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

### 401 Unauthorized

A kérés hitelesítetlen vagy az hitelesítő adatok érvénytelenek.

#### Lehetőségek

- Hiányzó Authorization header (internal channel)
- Érvénytelen JWT token
- Lejárt JWT token
- Érvénytelen widget token_id
- Nem létező widget token

#### Példa válasz

```json
{
  "detail": "Invalid or expired JWT token"
}
```

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/chat" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"channel":"internal","text":"Hello","session_id":"123"}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/chat"
payload = {
    "channel": "internal",
    "text": "Hello",
    "session_id": "123"
}

headers = {
    "Authorization": "Bearer invalid_token",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

### 403 Forbidden

A kérés engedélyezett, de a felhasználónak nincs megfelelő jogosultsága.

#### Lehetőségek

- Widget token disabled
- Widget token allowed_origins nem tartalmazza az origin-t
- Email nem megerősítve (login endpoint)
- Kvóta kimerült

#### Példa válasz

```json
{
  "detail": "Token is disabled"
}
```

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","token_id":"invalid_token"}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/widget/chat"
payload = {
    "text": "Hello",
    "token_id": "invalid_token"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

### 402 Payment Required

Az egyenleg kimerült.

#### Lehetőségek

- Tenant egyenlege 0 vagy negatív
- Widget token kvóta kimerült

#### Példa válasz

```json
{
  "detail": "Az egyenleg kimerült. Kérjük, töltse fel az egyenleget."
}
```

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"channel":"internal","text":"Hello","session_id":"123"}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/chat"
payload = {
    "channel": "internal",
    "text": "Hello",
    "session_id": "123"
}

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

### 429 Too Many Requests

Rate limit túllépés.

#### Lehetőségek

- IP alapú rate limit túllépés (landing/widget chat)
- Token alapú rate limit túllépés (widget chat)
- Órai rate limit túllépés

#### Példa válasz

A válasz body általában csak a `detail` mezőt tartalmazza. A várakozási idő másodpercre a **`Retry-After`** HTTP header-ben érkezik:

```json
{
  "detail": "Rate limit exceeded. Retry after 60 seconds."
}
```

#### Retry-After header

A **`Retry-After`** header tartalmazza a másodpercben, amíg újra próbálkozni lehet (pl. `Retry-After: 60`).

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/landing/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text":"Hello","session_id":"123"}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Hello",
    "session_id": "123"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 429:
    retry_after = response.headers.get('Retry-After', '60')
    print(f"Retry-After: {retry_after} seconds")
    print(f"Response: {response.text}")
```

---

### 503 Service Unavailable

A szolgáltatás ideiglenesen nem elérhető.

#### Lehetőségek

- Landing chat nem engedélyezett
- Landing chat nincs konfigurálva
- LLM endpoint nem elérhető
- Database connection hiba

#### Példa válasz

```json
{
  "detail": "Landing chat is not enabled"
}
```

#### Példa (cURL)

```bash
curl -X POST "$BASE_URL/landing/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text":"Hello","session_id":"123"}'
```

#### Példa (Python)

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Hello",
    "session_id": "123"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

## Rate limit

### IP alapú rate limit (landing/chat)

Az endpoint IP alapú rate limitelést alkalmaz.

| Limit | Leírás |
|-------|--------|
| **Per IP** | Max. 60 kérés/perc |
| **Per IP** | Max. 1000 kérés/óra |

#### Rate limit túllépés kezelése

```python
import requests
import time

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Hello",
    "session_id": "123"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}

while True:
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 60))
        print(f"Rate limit exceeded. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
    else:
        break
```

### Token alapú rate limit (widget/chat)

Az endpoint token alapú rate limitelést alkalmaz.

| Limit | Leírás |
|-------|--------|
| **Per token** | Max. 60 kérés/perc |
| **Per token** | Max. 1000 kérés/óra |
| **Per token** | Max. 1000000 token/óra |

#### Rate limit túllépés kezelése

```python
import requests
import time

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/widget/chat"
payload = {
    "text": "Hello",
    "token_id": "widget_token_abc123",
    "session_id": "123"
}

headers = {
    "Content-Type": "application/json"
}

while True:
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 60))
        print(f"Rate limit exceeded. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
    else:
        break
```

---

## Tippek

- **Rate limit figyelése**: Mindig ellenőrizd a `Retry-After` header-t, ha 429-es hivatkozást kapsz.
- **Token élettartam**: A JWT token élettartama általában 24 óra. Ha a token lejárt, új bejelentkezést kell végezni.
- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez.
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.
- **Hiba kezelés**: Mindig kezelj hiba esetén a response status code-ot és a response body-t.

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
