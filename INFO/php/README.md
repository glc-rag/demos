# GLC-RAG API PHP Demo

This directory contains a PHP demo application for the GLC-RAG Info API.

## About GLC-RAG

**GLC-RAG** (Generic Large-scale Context - Retrieval Augmented Generation) is an advanced AI-powered API service that enables intelligent information retrieval and chatbot capabilities. The system provides:

- **Info Management**: Create, read, update, and delete informational content
- **Smart Indexing**: Automatic indexing of content for fast retrieval
- **LLM-Powered Chat**: Query indexed information through natural language questions
- **Multi-tenant Support**: Secure isolation between different tenants
- **Role-Based Access**: Support for different user roles (admin, editor, viewer)

For more information about GLC-RAG, visit the main API documentation.

## About PHP

**PHP** (PHP: Hypertext Preprocessor) is a widely-used open-source server-side scripting language particularly suited for web development. This demo requires:

- **PHP 7.4+** or PHP 8.x
- **curl** command-line utility (for HTTP requests)
- **JSON** support (built-in)

PHP is known for its:
- Broad database support
- Extensive framework ecosystem (Laravel, Symfony, etc.)
- Easy integration with web servers
- Large community and documentation

## Demo Overview

The `info_demo.php` script demonstrates the complete workflow of the GLC-RAG Info API:

1. **Authentication** - Login with JWT tokens
2. **Create Info** - Create new informational content
3. **List Info** - Retrieve and filter info items
4. **Query via LLM** - Ask questions in natural language using the `/info` chat mode
5. **Delete Info** - Remove info items

## Installation

1. Ensure PHP is installed on your system:
   ```bash
   php --version
   ```

2. Ensure curl is available:
   ```bash
   curl --version
   ```

## Configuration

Before running the demo, edit the configuration section in `info_demo.php`:

```php
// Configuration
define('BASE_URL', 'https://glc-rag.hu');
define('TENANT', 'YOUR_TENANT_ID');
define('USER', 'YOUR_USER_ID');
define('PASSWORD', 'YOUR_PASSWORD');
```

## Usage

From this directory (`INFO/php`), run:

```bash
php info_demo.php
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
| `/admin/info/{id}` | DELETE | Delete info item |
| `/chat` | POST | Query via LLM (with `/info` prefix) |

## Sample Output

```
============================================================
Step 1: Login
============================================================
Login credentials:
  Tenant ID: teszt
  User ID: teszt
  Password: ***

Login successful!
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

============================================================
Step 5: Query Info via Chat (LLM)
============================================================
Asking question about info content:
  Question: Mi ez a rendszer?

Answer:
Ez a GLC-RAG rendszer info API-janak demo tartalma...
```

## Troubleshooting

- **"curl is not recognized"**: Install curl or ensure it's in your PATH
- **"Failed to execute curl command"**: Check that curl is properly installed
- **Authentication failed**: Verify your credentials and server URL

## License

This demo is provided as-is for demonstration purposes. Refer to the GLC-RAG documentation for API terms of use.