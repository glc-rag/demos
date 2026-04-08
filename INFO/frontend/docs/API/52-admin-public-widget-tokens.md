# Admin: Public Widget Tokens API

Ez a dokumentum az **Admin Dashboard → Integrációk → Public Widget Tokens** funkcióhoz tartozó REST API-t írja le. A végpontok **JWT** hitelesítést igényelnek (`Authorization: Bearer <token>`).

**OpenAPI:** tag **Admin**, path-ok `POST /admin/public-widget-tokens`, `GET /admin/public-widget-tokens`, `GET /admin/public-widget-tokens/{token_id}`, `PUT ...`, `POST .../rotate`, `GET .../embed-snippet` (openapi.json / Redoc).

**Gyors út a widgethez:** először **POST**-tal hozd létre a tokent (a válaszban megjelenik a titkos `token` és a nyilvános `token_id`), majd a titkos értéket használd a public chat hívásokban – lásd [02-auth-widget-token.md](02-auth-widget-token.md). Az admin felületen a **Code** / embed a `token_id`-t használja az iframe URL-ben.

## Szerepkör

| Művelet | Szerepkör |
|---------|-----------|
| Létrehozás, lista, részletek, szerkesztés, rotáció, embed snippet | **TENANT_ADMIN** vagy **SYSTEM_ADMIN** |

**TENANT_ADMIN** csak a **saját** `tenant_id`-jához tartozó tokeneket kezelheti; létrehozáskor a body `tenant_id` mezőjének egyeznie kell a JWT-ben lévő tenanttal.

## Endpointok áttekintése

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| POST | /admin/public-widget-tokens | Új token (a titkos `token` csak a válaszban, egyszer) |
| GET | /admin/public-widget-tokens | Token lista (titkos érték nélkül) |
| GET | /admin/public-widget-tokens/{token_id} | Egy token metaadatai |
| PUT | /admin/public-widget-tokens/{token_id} | Engedélyezés, originök, rate limit mezők |
| POST | /admin/public-widget-tokens/{token_id}/rotate | Régi token letiltása, új `token_id` + új titkos `token` |
| GET | /admin/public-widget-tokens/{token_id}/embed-snippet | Beágyazó HTML/JS snippet (`snippet` mező a JSON-ban) |

## POST /admin/public-widget-tokens – token létrehozás (quick start)

**Kötelező body mező:** `tenant_id` (string) – TENANT_ADMIN esetén legyen a bejelentkezett tenant azonosítója.

**Opcionális mezők:**

| Mező | Típus | Leírás |
|------|-------|--------|
| `allowed_origins` | string[] | Engedélyezett böngésző originök (pl. `https://example.com`); üres = nincs origin szűrés |
| `rate_limit_policy_id` | string \| null | Opcionális policy azonosító |
| `requests_per_minute` | int \| null | Percenkénti kéréslimit |
| `requests_per_hour` | int \| null | Óránkénti kéréslimit |
| `quota_per_hour` | int \| null | Óránkénti kvóta |

**Válasz (200):** `token_id`, `token` (titkos, **csak most látható**), `tenant_id`, `allowed_origins`, rate limit mezők, `created_at`.

Válasz példa:

```json
{
  "token_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "token": "xYz...urlsafe-secret-only-once...",
  "tenant_id": "tenant_001",
  "allowed_origins": ["https://example.com"],
  "rate_limit_policy_id": null,
  "requests_per_minute": null,
  "requests_per_hour": null,
  "quota_per_hour": null,
  "created_at": "2026-04-06T12:00:00+00:00"
}
```

### Példa – token létrehozása

#### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
JWT = "<your-jwt-token>"
TENANT_ID = "<your-tenant-id>"

url = f"{BASE_URL}/admin/public-widget-tokens"
headers = {
    "Authorization": f"Bearer {JWT}",
    "Content-Type": "application/json",
}
payload = {
    "tenant_id": TENANT_ID,
    "allowed_origins": ["https://example.com"],
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(response.status_code, data)
# A titkos token: data["token"] — mentsd el azonnal; később nem kérhető le újra.
```

#### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const JWT = "<your-jwt-token>";
const TENANT_ID = "<your-tenant-id>";

const response = await fetch(`${BASE_URL}/admin/public-widget-tokens`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${JWT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tenant_id: TENANT_ID,
    allowed_origins: ["https://example.com"],
  }),
});
const data = await response.json();
console.log(response.status, data);
```

#### cURL

```bash
curl -X POST "$BASE_URL/admin/public-widget-tokens" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "<your-tenant-id>",
    "allowed_origins": ["https://example.com"]
  }'
```

#### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$payload = json_encode([
    "tenant_id" => "<your-tenant-id>",
    "allowed_origins" => ["https://example.com"],
]);

$ch = curl_init($BASE_URL . "/admin/public-widget-tokens");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response . "\n";
?>
```

## GET /admin/public-widget-tokens – lista

A válasz `tokens` tömbje **nem** tartalmazza a titkos tokent; metaadatok: `token_id`, `tenant_id`, `enabled`, `allowed_origins`, rate limit mezők, időbélyegek.

### cURL

```bash
curl -X GET "$BASE_URL/admin/public-widget-tokens" \
  -H "Authorization: Bearer <token>"
```

## GET /admin/public-widget-tokens/{token_id} – részletek

Ugyanaz a séma mint a lista egy eleme (titkos token nélkül).

## PUT /admin/public-widget-tokens/{token_id} – frissítés

Body (minden mező opcionális): `enabled`, `allowed_origins`, `rate_limit_policy_id`, `requests_per_minute`, `requests_per_hour`, `quota_per_hour`. A rate limit mezőknél a `null` érték az alapértelmezésre állítást jelentheti.

### cURL

```bash
curl -X PUT "$BASE_URL/admin/public-widget-tokens/{token_id}" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"allowed_origins":["https://example.com"]}'
```

## POST /admin/public-widget-tokens/{token_id}/rotate – rotáció

A régi rekord letiltásra kerül; új `token_id` és új titkos `token` jön létre (válasz ugyanaz a séma, mint a létrehozásnál). A beágyazott widget URL-t a **új** `token_id`-re kell cserélni.

### cURL

```bash
curl -X POST "$BASE_URL/admin/public-widget-tokens/{token_id}/rotate" \
  -H "Authorization: Bearer <token>"
```

## GET /admin/public-widget-tokens/{token_id}/embed-snippet

JSON válasz: `snippet` (teljes HTML+CSS+JS beillesztő), `token_id`, `note`. Az iframe a frontend `/widget?token_id=...&embed=1` útvonalat tölti; a **FRONTEND_URL** környezeti beállítás hatással van a generált URL-re.

### cURL

```bash
curl -X GET "$BASE_URL/admin/public-widget-tokens/{token_id}/embed-snippet" \
  -H "Authorization: Bearer <token>"
```

---

## Tippek

- A titkos **`token`** értéket csak **létrehozáskor és rotációkor** kapod meg; tárold biztonságosan (pl. titokkezelő). A **`token_id`** nyilvános azonosító (URL, embed).
- **`allowed_origins`**: ha be van állítva, a public csatornás kéréseknél az origin validáció érvényesül.
- **403**: más tenant tokenje, vagy nem TENANT_ADMIN / SYSTEM_ADMIN szerepkör.
- **404**: ismeretlen `token_id`.

## További információ

- Widget token használata chatben: [02-auth-widget-token.md](02-auth-widget-token.md)
- Public widget folyamat: [21-flow-public-widget.md](21-flow-public-widget.md)
- Bejelentkezés (JWT): [01-auth-jwt.md](01-auth-jwt.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
