# Tasks API

Ez a dokumentum a Tasks API-t mutatja be, amely projekt- és feladatkezelést tesz lehetővé.

## Leírás

A Tasks API lehetővé teszi a felhasználóknak, hogy projekteket és feladatokat kezeljenek. Az API JWT vagy X-API-Key hitelesítést igényel.

**Fontos:** Ez az endpoint csak EDITOR vagy magasabb szerepkörrel érhető el.

## Hitelesítés

Az API két módon hitelesíthető:

1. **JWT token**: `Authorization: Bearer &lt;token&gt;`
2. **X-API-Key**: `X-API-Key: &lt;api_key&gt;`

### Headers

| Header | Érték | Leírás |
|--------|-------|--------|
| **Authorization** | Bearer &lt;token&gt; | JWT token hitelesítés. |
| **X-API-Key** | &lt;api_key&gt; | API kulcs hitelesítés. |

## Endpointok

### GET /admin/tasks/projects

Projekt lista lekérése (tenant scope).

#### Query paraméterek

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| **q** | string | Keresés a projekt nevében és leírásában. |
| **is_active** | boolean | True: csak aktívak, False: csak inaktívak, nincs: mind. |
| **limit** | int | Limit (default: 100). |
| **offset** | int | Offset (default: 0). |

#### Válasz struktúra

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Projekt neve",
      "description": "Projekt leírása",
      "owner_id": "uuid",
      "is_active": true,
      "created_at": "2026-03-12T12:00:00Z",
      "updated_at": "2026-03-12T12:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /admin/tasks/projects

Új projekt létrehozása.

#### Request body

```json
{
  "name": "Projekt neve",
  "description": "Projekt leírása"
}
```

#### Válasz struktúra

```json
{
  "id": "uuid",
  "name": "Projekt neve",
  "description": "Projekt leírása",
  "owner_id": "uuid",
  "is_active": true,
  "created_at": "2026-03-12T12:00:00Z",
  "updated_at": "2026-03-12T12:00:00Z"
}
```

### GET /admin/tasks/tasks

Feladat lista lekérése.

#### Query paraméterek

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| **project_id** | string | Projekt ID szűrésre. |
| **limit** | int | Limit (default: 100). |
| **offset** | int | Offset (default: 0). |

#### Válasz struktúra

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Feladat címe",
      "description": "Feladat leírása",
      "project_id": "uuid",
      "category_id": "uuid",
      "assignee_id": "uuid",
      "priority": "NORMAL",
      "due_at": "2026-03-12T12:00:00Z",
      "status": "TODO",
      "created_at": "2026-03-12T12:00:00Z",
      "updated_at": "2026-03-12T12:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /admin/tasks/tasks

Új feladat létrehozása.

#### Request body

```json
{
  "title": "Feladat címe",
  "description": "Feladat leírása",
  "project_id": "uuid",
  "category_id": "uuid",
  "assignee_id": "uuid",
  "priority": "NORMAL",
  "due_at": "2026-03-12T12:00:00Z"
}
```

#### Válasz struktúra

```json
{
  "id": "uuid",
  "title": "Feladat címe",
  "description": "Feladat leírása",
  "project_id": "uuid",
  "category_id": "uuid",
  "assignee_id": "uuid",
  "priority": "NORMAL",
  "due_at": "2026-03-12T12:00:00Z",
  "status": "TODO",
  "created_at": "2026-03-12T12:00:00Z",
  "updated_at": "2026-03-12T12:00:00Z"
}
```

### GET /admin/tasks/tasks/{task_id}

Egyetlen feladat lekérése.

#### Válasz struktúra

```json
{
  "id": "uuid",
  "title": "Feladat címe",
  "description": "Feladat leírása",
  "project_id": "uuid",
  "category_id": "uuid",
  "assignee_id": "uuid",
  "priority": "NORMAL",
  "due_at": "2026-03-12T12:00:00Z",
  "status": "TODO",
  "created_at": "2026-03-12T12:00:00Z",
  "updated_at": "2026-03-12T12:00:00Z"
}
```

### GET /admin/tasks/projects/{project_id}

Egy projekt lekérése (path param: project_id). A válasz tartalmazza a projekt mezőit és opcionálisan a projekthez tartozó feladatok rövid listáját.

#### Válasz struktúra

```json
{
  "id": "uuid",
  "name": "Projekt neve",
  "description": "Projekt leírása",
  "owner_id": "uuid",
  "is_active": true,
  "created_at": "2026-03-12T12:00:00Z",
  "updated_at": "2026-03-12T12:00:00Z",
  "tasks": []
}
```

### PATCH /admin/tasks/projects/{project_id}

Projekt módosítása. A body mezők opcionálisak; csak a megadott mezők frissülnek.

#### Request body

```json
{
  "name": "Projekt neve",
  "description": "Projekt leírása",
  "is_active": true
}
```

#### Válasz struktúra

A frissített projekt objektum (mezők: id, name, description, owner_id, is_active, created_at, updated_at).

### DELETE /admin/tasks/projects/{project_id}

Projekt végleges törlése. Csak TENANT_ADMIN vagy SYSTEM_ADMIN szerepkörrel. Válasz: 204 No Content vagy success üzenet.

### PATCH /admin/tasks/tasks/{task_id}

Feladat módosítása. A body mezők opcionálisak; csak a megadott mezők frissülnek.

#### Request body

```json
{
  "title": "Feladat címe",
  "description": "Feladat leírása",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignee_id": "uuid",
  "due_at": "2026-03-15T12:00:00Z"
}
```

#### Válasz struktúra

A frissített feladat objektum (id, title, description, project_id, category_id, assignee_id, priority, due_at, status, created_at, updated_at stb.).

### DELETE /admin/tasks/tasks/{task_id}

Feladat törlése. Válasz: 204 No Content vagy success üzenet.

### GET /admin/tasks/task-categories

Feladatkategória lista (tenant scope). A feladat létrehozásakor a category_id megadásához használható.

#### Query paraméterek

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| (nincs kötelező) | – | Alapértelmezett kategóriák visszaadása. |

#### Válasz struktúra

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Kategória neve",
      "slug": "slug",
      "sort_order": 0
    }
  ]
}
```

### GET /admin/tasks/users

Tenant felhasználók listája (pl. assignee_id választáshoz a feladat létrehozásakor vagy módosításakor).

#### Query paraméterek

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| **q** | string | Keresés user_id vagy email alapján. |
| **limit** | int | Limit (default: 50, max: 100). |

#### Válasz struktúra

```json
{
  "users": [
    {
      "user_id": "uuid",
      "email": "user@example.com"
    }
  ]
}
```

## További Tasks API endpointok (OpenAPI)

A Tasks API további endpointjai (projekt dokumentumok, tevékenység, ügyfelek, költségkeret, ügyfél űrlapok, üzenetek, workflow, PDF export, akciók stb.) az OpenAPI specban találhatók.

| Method | Path (prefix: /admin/tasks) | Leírás |
|--------|-----------------------------|--------|
| GET | /projects/{id}/documents | Projekt dokumentumai |
| GET | /projects/{id}/activity-feed | Projekt tevékenység |
| GET/POST/PATCH/DELETE | /projects/{id}/clients | Projekt ügyfelei |
| GET/PATCH | /projects/{id}/budget | Projekt költségkeret |
| GET | /projects/{id}/cost-summary | Költség összesítő |
| GET/POST/… | /tasks/{id}/client-forms, …/documents | Ügyfél űrlapok |
| GET/POST | /tasks/{id}/messages, …/messages/summary | Üzenetek |
| GET/POST/… | /workflow-processes, /workflow-rules | Workflow folyamatok és szabályok |
| GET | /tasks/{id}/export-pdf, /projects/{id}/export-pdf | PDF export |
| POST | /tasks/{id}/duplicate, …/notify-assignee, …/postpone-due, …/add-to-calendar, …/add-reminder | Akciók |
| GET/POST/… | /cost-types, /tasks/{id}/cost-entries | Költségtípusok és bejegyzések |
| GET | /inbox-summary | Bejövő összesítő |

**Részletes paraméterek és válaszok:** OpenAPI (openapi.json) / Redoc, „Tasks” vagy „admin/tasks” tag alatt.

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url_projects = f"{BASE_URL}/admin/tasks/projects"
url_tasks = f"{BASE_URL}/admin/tasks/tasks"

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

# Projekt lista lekérése
response = requests.get(url_projects, headers=headers)
print(f"Projects Status: {response.status_code}")
print(f"Projects Response: {response.json()}")

# Új projekt létrehozása
new_project = {
    "name": "Új projekt",
    "description": "Új projekt leírása"
}
response = requests.post(url_projects, json=new_project, headers=headers)
print(f"Create Project Status: {response.status_code}")
print(f"Create Project Response: {response.json()}")

# Feladat lista lekérése
response = requests.get(url_tasks, headers=headers)
print(f"Tasks Status: {response.status_code}")
print(f"Tasks Response: {response.json()}")

# Új feladat létrehozása
new_task = {
    "title": "Új feladat",
    "description": "Új feladat leírása",
    "project_id": "project_uuid"
}
response = requests.post(url_tasks, json=new_task, headers=headers)
print(f"Create Task Status: {response.status_code}")
print(f"Create Task Response: {response.json()}")
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url_projects = `${BASE_URL}/admin/tasks/projects`;
const url_tasks = `${BASE_URL}/admin/tasks/tasks`;

const token = "<token>";

const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

// Projekt lista lekérése
const response = await fetch(url_projects, {
    method: "GET",
    headers: headers
});
console.log("Projects Status:", response.status);
console.log("Projects Response:", await response.json());

// Új projekt létrehozása
const newProject = {
    "name": "Új projekt",
    "description": "Új projekt leírása"
};
const createResponse = await fetch(url_projects, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(newProject)
});
console.log("Create Project Status:", createResponse.status);
console.log("Create Project Response:", await createResponse.json());

// Feladat lista lekérése
const tasksResponse = await fetch(url_tasks, {
    method: "GET",
    headers: headers
});
console.log("Tasks Status:", tasksResponse.status);
console.log("Tasks Response:", await tasksResponse.json());

// Új feladat létrehozása
const newTask = {
    "title": "Új feladat",
    "description": "Új feladat leírása",
    "project_id": "project_uuid"
};
const taskCreateResponse = await fetch(url_tasks, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(newTask)
});
console.log("Create Task Status:", taskCreateResponse.status);
console.log("Create Task Response:", await taskCreateResponse.json());
```

### cURL

```bash
# Projekt lista lekérése
curl -X GET "$BASE_URL/admin/tasks/projects" \
  -H "Authorization: Bearer <token>"

# Új projekt létrehozása
curl -X POST "$BASE_URL/admin/tasks/projects" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Új projekt","description":"Új projekt leírása"}'

# Feladat lista lekérése
curl -X GET "$BASE_URL/admin/tasks/tasks" \
  -H "Authorization: Bearer <token>"

# Új feladat létrehozása
curl -X POST "$BASE_URL/admin/tasks/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Új feladat","description":"Új feladat leírása","project_id":"project_uuid"}'
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url_projects = $BASE_URL . "/admin/tasks/projects";
$url_tasks = $BASE_URL . "/admin/tasks/tasks";

$token = "<token>";

$headers = [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
];

// Projekt lista lekérése
$response = file_get_contents($url_projects, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'GET',
        'content' => ''
    ]
]);
echo "Projects Status: " . http_response_code() . "\n";
echo "Projects Response: " . print_r(json_decode($response, true), true);

// Új projekt létrehozása
$newProject = [
    "name" => "Új projekt",
    "description" => "Új projekt leírása"
];
$response = file_get_contents($url_projects, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'POST',
        'content' => json_encode($newProject)
    ]
]);
echo "Create Project Status: " . http_response_code() . "\n";
echo "Create Project Response: " . print_r(json_decode($response, true), true);

// Feladat lista lekérése
$response = file_get_contents($url_tasks, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'GET',
        'content' => ''
    ]
]);
echo "Tasks Status: " . http_response_code() . "\n";
echo "Tasks Response: " . print_r(json_decode($response, true), true);

// Új feladat létrehozása
$newTask = [
    "title" => "Új feladat",
    "description" => "Új feladat leírása",
    "project_id" => "project_uuid"
];
$response = file_get_contents($url_tasks, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'POST',
        'content' => json_encode($newTask)
    ]
]);
echo "Create Task Status: " . http_response_code() . "\n";
echo "Create Task Response: " . print_r(json_decode($response, true), true);
?>
```

---

## Tippek

- **Szerepkör**: Az API csak EDITOR vagy magasabb szerepkörrel érhető el.
- **Hitelesítés**: Egyik kötelező: JWT token (Bearer) vagy X-API-Key; nem kell mindkettő.
- **Tenant scope**: Az API csak a felhasználó tenantjének projekteit és feladatait listázza.
- **Audit log**: Minden művelet audit logba kerül.

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
