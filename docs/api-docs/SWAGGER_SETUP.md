# Swagger UI Setup Guide

This guide explains how to use and set up Swagger UI for the Pi Docs API.

## Files

- **`swagger.yaml`** - Enhanced OpenAPI 3.0 specification with detailed examples
- **`swagger-ui.html`** - Standalone Swagger UI HTML file
- **`openapi.yaml`** - Original OpenAPI specification (simpler version)

## Quick Start

### Option 1: Open Standalone HTML File

1. Open `swagger-ui.html` in your browser
2. The Swagger UI will automatically load `swagger.yaml`
3. Start exploring and testing the API!

**Note**: For this to work, both files must be in the same directory and served via HTTP (not `file://`). Use Option 2 or 3 if opening directly doesn't work.

### Option 2: Use Swagger Editor Online

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. File → Import File → Select `swagger.yaml`
3. View interactive API documentation
4. Test endpoints directly in the browser

### Option 3: Serve Locally

#### Using Python

```bash
cd docs/api-docs
python -m http.server 8080
# Or Python 3
python3 -m http.server 8080
```

Then open: `http://localhost:8080/swagger-ui.html`

#### Using Node.js (http-server)

```bash
npm install -g http-server
cd docs/api-docs
http-server -p 8080
```

Then open: `http://localhost:8080/swagger-ui.html`

#### Using PHP

```bash
cd docs/api-docs
php -S localhost:8080
```

Then open: `http://localhost:8080/swagger-ui.html`

### Option 4: Integrate into API Server

Add Swagger UI to your Express API server:

```javascript
// In apps/api/src/index.ts
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/api-docs/swagger.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Then access at: `http://localhost:3001/api-docs`

## Features

### Interactive API Testing

- **Try It Out**: Click "Try it out" on any endpoint
- **Fill Parameters**: Enter request parameters
- **Execute**: Click "Execute" to send the request
- **View Response**: See the actual API response

### Authentication

1. Click the "Authorize" button (top right)
2. Enter your JWT token: `Bearer <your-token>`
3. Click "Authorize"
4. All authenticated requests will include the token

### Examples

All endpoints include:
- Request examples
- Response examples
- Error examples
- Parameter descriptions

## Customization

### Change API Server URL

Edit `swagger.yaml`:

```yaml
servers:
  - url: https://api.yourdomain.com/api
    description: Production server
  - url: http://localhost:3001/api
    description: Development server
```

### Add More Examples

Add examples to any endpoint in `swagger.yaml`:

```yaml
examples:
  myExample:
    summary: Example name
    value:
      field1: value1
      field2: value2
```

### Customize Swagger UI

Edit `swagger-ui.html` to customize:

- Theme colors
- Layout
- Plugins
- Validator URL

## Exporting

### Export to Postman

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Import `swagger.yaml`
3. Generate Client → Postman Collection
4. Download and import into Postman

### Generate Client SDKs

Using OpenAPI Generator:

```bash
# Install
npm install @openapitools/openapi-generator-cli -g

# Generate JavaScript client
openapi-generator-cli generate \
  -i docs/api-docs/swagger.yaml \
  -g javascript \
  -o ./generated/js-client

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/api-docs/swagger.yaml \
  -g typescript-axios \
  -o ./generated/ts-client

# Generate Python client
openapi-generator-cli generate \
  -i docs/api-docs/swagger.yaml \
  -g python \
  -o ./generated/python-client
```

## Troubleshooting

### CORS Errors

If you see CORS errors when testing:
1. Ensure your API server has CORS enabled
2. Check `CORS_ORIGINS` includes your Swagger UI URL
3. For local testing, you can disable CORS temporarily

### YAML Not Loading

If `swagger.yaml` doesn't load:
1. Ensure both files are in the same directory
2. Serve via HTTP (not `file://`)
3. Check browser console for errors
4. Verify YAML syntax is valid

### Authentication Not Working

1. Make sure you clicked "Authorize" and entered the token
2. Token format: `Bearer <token>` (include "Bearer ")
3. Check token hasn't expired (7 days)
4. Verify API server is running

## Best Practices

1. **Use Development Server**: Always test against development server first
2. **Save Tokens**: Copy tokens from login/register responses
3. **Check Examples**: Review examples before making requests
4. **Read Descriptions**: Each endpoint has detailed descriptions
5. **Test Error Cases**: Try invalid inputs to see error responses

## Integration with CI/CD

You can host Swagger UI in your deployment:

### Vercel/Netlify

1. Add `swagger-ui.html` and `swagger.yaml` to your web app
2. Deploy
3. Access at: `https://yourdomain.com/api-docs/swagger-ui.html`

### GitHub Pages

1. Push files to `docs/api-docs/`
2. Enable GitHub Pages
3. Access at: `https://yourusername.github.io/pi-docs/api-docs/swagger-ui.html`

## Support

- For API issues, see [API.md](./API.md)
- For OpenAPI spec issues, check [OpenAPI Specification](https://swagger.io/specification/)
- For Swagger UI issues, see [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
