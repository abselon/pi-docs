# API Documentation

Complete API documentation for Pi Docs REST API.

## Documentation Files

- **[API.md](./API.md)** - Complete API reference with detailed endpoint documentation, examples, and SDK code samples
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card with all endpoints in a table format
- **[swagger.yaml](./swagger.yaml)** - Enhanced OpenAPI 3.0 specification with detailed examples (recommended)
- **[openapi.yaml](./openapi.yaml)** - Original OpenAPI 3.0 specification (simpler version)
- **[swagger-ui.html](./swagger-ui.html)** - Standalone Swagger UI HTML file for interactive API testing
- **[SWAGGER_SETUP.md](./SWAGGER_SETUP.md)** - Guide for setting up and using Swagger UI

## Quick Start

1. **Read the Quick Reference** for a fast overview: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Read the Full Documentation** for detailed information: [API.md](./API.md)
3. **Use the OpenAPI Spec** with tools like Postman, Swagger UI, or API clients: [openapi.yaml](./openapi.yaml)

## Using Swagger UI (Interactive API Testing)

### Quick Start

1. **Serve the files locally:**
   ```bash
   cd docs/api-docs
   node serve-swagger.js
   # Or use Python: python -m http.server 8080
   ```

2. **Open in browser:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

3. **Test the API:**
   - Click "Try it out" on any endpoint
   - Fill in parameters
   - Click "Execute"
   - View the response

### Alternative Methods

- **Swagger Editor**: Go to [editor.swagger.io](https://editor.swagger.io/) → Import `swagger.yaml`
- **Standalone HTML**: Open `swagger-ui.html` directly (requires HTTP server)
- **Postman**: Import `swagger.yaml` into Postman

See [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) for detailed setup instructions.

### Code Generation

Generate client SDKs using OpenAPI Generator:

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate JavaScript client
openapi-generator-cli generate \
  -i docs/api-docs/openapi.yaml \
  -g javascript \
  -o ./generated/js-client

# Generate Python client
openapi-generator-cli generate \
  -i docs/api-docs/openapi.yaml \
  -g python \
  -o ./generated/python-client

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/api-docs/openapi.yaml \
  -g typescript-axios \
  -o ./generated/ts-client
```

## API Base URL

- **Production**: `https://api.yourdomain.com/api`
- **Development**: `http://localhost:3001/api`

## Authentication

All protected endpoints require Bearer Token authentication:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by registering or logging in:
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

## Example Usage

### JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('https://api.yourdomain.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// Get documents
const documentsResponse = await fetch('https://api.yourdomain.com/api/documents', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { documents } = await documentsResponse.json();
```

### Python

```python
import requests

# Login
response = requests.post(
    'https://api.yourdomain.com/api/auth/login',
    json={'email': 'user@example.com', 'password': 'password123'}
)
token = response.json()['token']

# Get documents
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('https://api.yourdomain.com/api/documents', headers=headers)
documents = response.json()['documents']
```

### cURL

```bash
# Login
TOKEN=$(curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Get documents
curl https://api.yourdomain.com/api/documents \
  -H "Authorization: Bearer $TOKEN"
```

## Support

- For API issues, check the [Full API Documentation](./API.md)
- For deployment help, see [Deployment Guide](../DEPLOYMENT.md)
- For environment setup, see [Environment Setup Guide](../SETUP_ENV.md)
