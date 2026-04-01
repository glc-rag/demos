# GLC-RAG API Python Demo

This directory contains a Python demo application for the GLC-RAG Info API.

## About GLC-RAG

**GLC-RAG** (Generic Large-scale Context - Retrieval Augmented Generation) is an advanced AI-powered API service that enables intelligent information retrieval and chatbot capabilities. The system provides:

- **Info Management**: Create, read, update, and delete informational content
- **Smart Indexing**: Automatic indexing of content for fast retrieval
- **LLM-Powered Chat**: Query indexed information through natural language questions
- **Multi-tenant Support**: Secure isolation between different tenants
- **Role-Based Access**: Support for different user roles (admin, editor, viewer)

For more information about GLC-RAG, visit the main API documentation.

## About Python

**Python** is a widely-used high-level programming language known for its readability and versatility. This demo requires:

- **Python 3.7+**
- **requests** library (for HTTP requests)

Python is known for its:
- Simple, readable syntax
- Extensive standard library
- Large ecosystem of third-party packages
- Strong community support

## Demo Overview

The `info_demo.py` script demonstrates the complete workflow of the GLC-RAG Info API:

1. **Authentication** - Login with JWT tokens
2. **Create Info** - Create new informational content
3. **List Info** - Retrieve and filter info items
4. **Query via LLM** - Ask questions in natural language using the `/info` chat mode
5. **Delete Info** - Remove info items

## Installation

1. Ensure Python is installed on your system:
   ```bash
   python --version
   ```

2. Install the required requests library:
   ```bash
   pip install requests
   ```

## Configuration

Before running the demo, edit the configuration section in `info_demo.py`:

```python
# Configuration - Replace with your actual credentials for testing
BASE_URL = "https://glc-rag.hu"
USER_ID = "dummy"
TENANT_ID = "dummy"
PASSWORD = "dummy"
```

## Usage

Run the demo from the command line:

```bash
python info_demo.py
```

The program will:
1. Authenticate with the GLC-RAG server
2. Create a sample info item
3. Wait for indexing to complete
4. List all info items
5. Query the indexed content via LLM
6. Clean up by deleting the created item

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate and get JWT token |
| `/admin/info` | GET | List info items |
| `/admin/info` | POST | Create new info item |
| `/admin/info/{id}` | GET | Get specific info item |
| `/admin/info/{id}` | DELETE | Delete info item |
| `/chat` | POST | Query via LLM (with `/info` prefix) |

## Sample Output

```
============================================================
STEP 1: Login
============================================================
URL: https://glc-rag.hu/auth/login
Payload: {"user_id": "dummy", "tenant_id": "dummy", "password": "dummy"}
Status: 200
[OK] Login successful! Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

============================================================
STEP 2: Create Info
============================================================
[OK] Info created! ID: 749218e7-32ae-4a9d-a8af-86b71d5f724b

============================================================
WAITING FOR INDEXING
============================================================
[OK] Indexing complete!

============================================================
STEP 3: List Info Items
============================================================
Total items: 1

Found 1 info items:
  - ID: 749218e7-32ae-4a9d-a8af-86b71d5f724b
    Title: Gyakori kerdesek
    Status: INDEXED

============================================================
STEP 6: Chat /info Query
============================================================
Response:
  trace_id: 61f1a2b9-b968-4fa7-9bea-f326a5487af4
  mode: CREATIVE
  status_code: OK
  text: (length=391)

============================================================
DEMO COMPLETED SUCCESSFULLY!
============================================================
```

## Troubleshooting

- **ImportError: No module named 'requests'**: Run `pip install requests`
- **Authentication failed**: Verify your credentials and server URL
- **HTTP Error 401**: Token may be expired, try running the demo again
- **HTTP Error 429**: Rate limit exceeded, wait before trying again
- **Unicode encoding errors**: Ensure your terminal supports UTF-8

## License

This demo is provided as-is for demonstration purposes. Refer to the GLC-RAG documentation for API terms of use.
