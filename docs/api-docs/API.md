# Pi Docs API Documentation

Complete REST API documentation for Pi Docs. This API can be used by web frontends, mobile apps, and third-party integrations.

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Data Models](#data-models)
5. [Endpoints](#endpoints)
   - [Health](#health)
   - [Authentication](#authentication-endpoints)
   - [Users](#users)
   - [Documents](#documents)
   - [Categories](#categories)
   - [Settings](#settings)
   - [Statistics](#statistics)

---

## Base URL & Authentication

### Base URL

```
Production: https://api.yourdomain.com/api
Development: http://localhost:3001/api
```

### Authentication

Pi Docs API uses **Bearer Token Authentication** (JWT). Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

**Token Expiration**: 7 days

**Getting a Token**: 
- Register: `POST /auth/register`
- Login: `POST /auth/login`

---

## Authentication

### Authentication Flow

1. **Register** or **Login** to get a JWT token
2. Include token in `Authorization` header for protected endpoints
3. Token expires after 7 days - user must login again

### Example Request

```bash
curl -X GET https://api.yourdomain.com/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Resource deleted successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database or service unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | Missing or invalid authentication token |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `EMAIL_IN_USE` | Email already registered |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `EMAIL_SEND_FAILED` | Failed to send email |
| `INVALID_TOKEN` | Invalid or expired token |
| `DATABASE_ERROR` | Database operation failed |

---

## Data Models

### User

```typescript
{
  id: string;              // UUID
  email: string;           // Email address
  name: string;            // User's display name
  emailVerified: boolean; // Email verification status
  createdAt: string;      // ISO 8601 datetime
}
```

### Document

```typescript
{
  id: string;                    // UUID
  userId: string;                // Owner's user ID
  categoryId: string | null;     // Category UUID or null
  title: string;                 // Document title
  description: string | null;   // Optional description
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
  issuedAt: string | null;       // ISO 8601 datetime or null
  expiresAt: string | null;      // ISO 8601 datetime or null
  fileName: string | null;       // Original filename
  fileMime: string | null;       // MIME type (e.g., "application/pdf")
  fileSize: number | null;        // File size in bytes
  storageProvider: "LOCAL" | "S3";
  storageKey: string | null;      // Storage key for file retrieval
  createdAt: string;              // ISO 8601 datetime
  updatedAt: string;              // ISO 8601 datetime
}
```

### Category

```typescript
{
  id: string;              // UUID
  name: string;           // Category name
  icon: string;           // Icon identifier
  documentsCount: number; // Number of documents in category
}
```

### Settings

```typescript
{
  id: string;                    // UUID
  userId: string;                // User ID
  darkMode: boolean;             // Dark mode preference
  biometricEnabled: boolean;     // Biometric authentication enabled
  autoLockMinutes: number;       // Auto-lock timeout (0-240 minutes)
  storageProvider: "LOCAL" | "S3"; // File storage provider
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

### Statistics Overview

```typescript
{
  overview: {
    total: number;    // Total documents
    active: number;   // Active documents (not expired, not expiring soon)
    expiring: number; // Documents expiring within 30 days
  }
}
```

---

## Endpoints

## Health

### GET /health

Check API health status.

**Authentication**: Not required

**Response**: `200 OK`

```json
{
  "status": "ok",
  "message": "Pi Docs API is running"
}
```

**Example**:

```bash
curl https://api.yourdomain.com/api/health
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Validation**:
- `email`: Valid email address (required)
- `password`: Minimum 8 characters (required)
- `name`: Minimum 1 character (optional, defaults to "User")

**Response**: `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

**Error Responses**:
- `409 Conflict`: Email already registered
- `400 Bad Request`: Validation error

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

```javascript
const response = await fetch('https://api.yourdomain.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
    name: 'John Doe'
  })
});
const data = await response.json();
// Store data.token for future requests
```

**Notes**:
- Creates default categories: Personal IDs, Financial, Medical, Education, Insurance, Legal
- Sends verification email automatically
- Returns JWT token for immediate use

---

### POST /auth/login

Authenticate and get access token.

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid email or password

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

```python
import requests

response = requests.post(
    'https://api.yourdomain.com/api/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'securepassword123'
    }
)
data = response.json()
token = data['token']
```

---

### GET /auth/me

Get current authenticated user information.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

**Example**:

```bash
curl https://api.yourdomain.com/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### POST /auth/logout

Logout (client-side token clearing).

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

**Note**: Since JWT tokens are stateless, logout is primarily handled client-side by removing the token. This endpoint exists for API consistency.

---

### POST /auth/send-verification

Resend email verification.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "message": "Verification email sent"
}
```

**Error Responses**:
- `400 Bad Request`: Email already verified
- `500 Internal Server Error`: Failed to send email

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/send-verification \
  -H "Authorization: Bearer <token>"
```

---

### POST /auth/verify-email

Verify email address with token.

**Authentication**: Not required

**Request Body**:

```json
{
  "token": "verification-token-from-email"
}
```

**Response**: `200 OK`

```json
{
  "message": "Email verified successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

---

### POST /auth/forgot-password

Request password reset email.

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**: `200 OK`

```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note**: Always returns success message for security (doesn't reveal if email exists).

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### POST /auth/reset-password

Reset password with token.

**Authentication**: Not required

**Request Body**:

```json
{
  "token": "password-reset-token-from-email",
  "password": "newsecurepassword123"
}
```

**Validation**:
- `password`: Minimum 8 characters

**Response**: `200 OK`

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "password-reset-token-from-email",
    "password": "newsecurepassword123"
  }'
```

---

## Users

### GET /users/me

Get current user profile.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example**:

```bash
curl https://api.yourdomain.com/api/users/me \
  -H "Authorization: Bearer <token>"
```

```javascript
const response = await fetch('https://api.yourdomain.com/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

---

### PATCH /users/me

Update current user profile.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Jane Doe"
}
```

**Validation**:
- `name`: Minimum 1 character (optional)

**Response**: `200 OK`

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "Jane Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example**:

```bash
curl -X PATCH https://api.yourdomain.com/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

---

## Documents

### GET /documents

List all documents for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `categoryId` (optional): Filter by category UUID
- `search` (optional): Search in title and description

**Response**: `200 OK`

```json
{
  "documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-id",
      "categoryId": "category-id",
      "title": "Passport",
      "description": "US Passport",
      "status": "ACTIVE",
      "issuedAt": "2020-01-01T00:00:00.000Z",
      "expiresAt": "2030-01-01T00:00:00.000Z",
      "fileName": "passport.pdf",
      "fileMime": "application/pdf",
      "fileSize": 1024000,
      "storageProvider": "LOCAL",
      "storageKey": "key",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Example**:

```bash
# Get all documents
curl https://api.yourdomain.com/api/documents \
  -H "Authorization: Bearer <token>"

# Filter by category
curl "https://api.yourdomain.com/api/documents?categoryId=category-uuid" \
  -H "Authorization: Bearer <token>"

# Search documents
curl "https://api.yourdomain.com/api/documents?search=passport" \
  -H "Authorization: Bearer <token>"
```

```javascript
// Get all documents
const response = await fetch('https://api.yourdomain.com/api/documents', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

// Search documents
const searchResponse = await fetch(
  'https://api.yourdomain.com/api/documents?search=passport',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

### POST /documents

Create a new document.

**Authentication**: Required

**Request**: `multipart/form-data` or `application/json`

**Form Data Fields**:
- `title` (required): Document title
- `description` (optional): Document description
- `categoryId` (optional): Category UUID
- `issuedAt` (optional): ISO 8601 date string
- `expiresAt` (optional): ISO 8601 date string
- `file` (optional): File to upload

**Response**: `201 Created`

```json
{
  "document": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-id",
    "categoryId": "category-id",
    "title": "Passport",
    "description": "US Passport",
    "status": "ACTIVE",
    "issuedAt": "2020-01-01T00:00:00.000Z",
    "expiresAt": "2030-01-01T00:00:00.000Z",
    "fileName": "passport.pdf",
    "fileMime": "application/pdf",
    "fileSize": 1024000,
    "storageProvider": "LOCAL",
    "storageKey": "key",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid categoryId or validation error

**Example**:

```bash
# With file upload
curl -X POST https://api.yourdomain.com/api/documents \
  -H "Authorization: Bearer <token>" \
  -F "title=Passport" \
  -F "description=US Passport" \
  -F "categoryId=category-uuid" \
  -F "issuedAt=2020-01-01T00:00:00.000Z" \
  -F "expiresAt=2030-01-01T00:00:00.000Z" \
  -F "file=@/path/to/passport.pdf"

# Without file
curl -X POST https://api.yourdomain.com/api/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Passport",
    "description": "US Passport",
    "categoryId": "category-uuid",
    "issuedAt": "2020-01-01T00:00:00.000Z",
    "expiresAt": "2030-01-01T00:00:00.000Z"
  }'
```

```javascript
// With file upload
const formData = new FormData();
formData.append('title', 'Passport');
formData.append('description', 'US Passport');
formData.append('categoryId', 'category-uuid');
formData.append('issuedAt', '2020-01-01T00:00:00.000Z');
formData.append('expiresAt', '2030-01-01T00:00:00.000Z');
formData.append('file', fileInput.files[0]);

const response = await fetch('https://api.yourdomain.com/api/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type - browser will set it with boundary
  },
  body: formData
});
```

```python
import requests

# With file upload
files = {'file': open('passport.pdf', 'rb')}
data = {
    'title': 'Passport',
    'description': 'US Passport',
    'categoryId': 'category-uuid',
    'issuedAt': '2020-01-01T00:00:00.000Z',
    'expiresAt': '2030-01-01T00:00:00.000Z'
}

response = requests.post(
    'https://api.yourdomain.com/api/documents',
    headers={'Authorization': f'Bearer {token}'},
    files=files,
    data=data
)
```

**Notes**:
- Status is automatically computed based on `expiresAt`:
  - `EXPIRED`: Already expired
  - `EXPIRING`: Expires within 30 days
  - `ACTIVE`: Otherwise
- File is optional - documents can be created without files
- File storage provider is determined by user settings

---

### GET /documents/:id

Get a specific document by ID.

**Authentication**: Required

**Path Parameters**:
- `id`: Document UUID

**Response**: `200 OK`

```json
{
  "document": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-id",
    "categoryId": "category-id",
    "title": "Passport",
    "description": "US Passport",
    "status": "ACTIVE",
    "issuedAt": "2020-01-01T00:00:00.000Z",
    "expiresAt": "2030-01-01T00:00:00.000Z",
    "fileName": "passport.pdf",
    "fileMime": "application/pdf",
    "fileSize": 1024000,
    "storageProvider": "LOCAL",
    "storageKey": "key",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Document not found or not owned by user

**Example**:

```bash
curl https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### PATCH /documents/:id

Update a document.

**Authentication**: Required

**Path Parameters**:
- `id`: Document UUID

**Request Body**:

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "categoryId": "new-category-id",
  "issuedAt": "2020-01-01T00:00:00.000Z",
  "expiresAt": "2030-01-01T00:00:00.000Z"
}
```

**Validation**:
- All fields are optional
- Set to `null` to clear optional fields
- `title`: Minimum 1 character if provided
- `categoryId`: Must be valid UUID owned by user

**Response**: `200 OK`

```json
{
  "document": {
    // Updated document object
  }
}
```

**Error Responses**:
- `404 Not Found`: Document not found
- `400 Bad Request`: Invalid categoryId

**Example**:

```bash
curl -X PATCH https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "expiresAt": "2035-01-01T00:00:00.000Z"
  }'
```

**Note**: Status is automatically recomputed if `expiresAt` is updated.

---

### GET /documents/:id/download

Download document file.

**Authentication**: Required

**Path Parameters**:
- `id`: Document UUID

**Response**: `200 OK`

- Content-Type: File MIME type
- Content-Disposition: `attachment; filename="filename"`
- Body: File binary data

**Error Responses**:
- `404 Not Found`: Document not found or no file attached

**Example**:

```bash
curl https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000/download \
  -H "Authorization: Bearer <token>" \
  -o passport.pdf
```

```javascript
const response = await fetch(
  'https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000/download',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const blob = await response.blob();
// Create download link or display file
const url = URL.createObjectURL(blob);
```

```python
import requests

response = requests.get(
    'https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000/download',
    headers={'Authorization': f'Bearer {token}'},
    stream=True
)

with open('passport.pdf', 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)
```

---

### DELETE /documents/:id

Delete a document.

**Authentication**: Required

**Path Parameters**:
- `id`: Document UUID

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: Document not found

**Example**:

```bash
curl -X DELETE https://api.yourdomain.com/api/documents/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

**Note**: Also deletes associated file from storage.

---

## Categories

### GET /categories

List all categories for the authenticated user.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "categories": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Personal IDs",
      "icon": "id-card",
      "documentsCount": 5
    }
  ]
}
```

**Example**:

```bash
curl https://api.yourdomain.com/api/categories \
  -H "Authorization: Bearer <token>"
```

---

### POST /categories

Create a new category.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Travel Documents",
  "icon": "plane"
}
```

**Validation**:
- `name`: Minimum 1 character (required)
- `icon`: Minimum 1 character (optional, defaults to "folder")

**Response**: `201 Created`

```json
{
  "category": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Travel Documents",
    "icon": "plane",
    "userId": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `409 Conflict`: Category name already exists

**Example**:

```bash
curl -X POST https://api.yourdomain.com/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Travel Documents",
    "icon": "plane"
  }'
```

---

### PATCH /categories/:id

Update a category.

**Authentication**: Required

**Path Parameters**:
- `id`: Category UUID

**Request Body**:

```json
{
  "name": "Updated Name",
  "icon": "updated-icon"
}
```

**Validation**:
- Both fields optional
- `name`: Minimum 1 character if provided
- `icon`: Minimum 1 character if provided

**Response**: `200 OK`

```json
{
  "category": {
    // Updated category object
  }
}
```

**Error Responses**:
- `404 Not Found`: Category not found

**Example**:

```bash
curl -X PATCH https://api.yourdomain.com/api/categories/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

---

### DELETE /categories/:id

Delete a category.

**Authentication**: Required

**Path Parameters**:
- `id`: Category UUID

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: Category not found

**Note**: Documents in this category will have `categoryId` set to `null`.

**Example**:

```bash
curl -X DELETE https://api.yourdomain.com/api/categories/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

## Settings

### GET /settings

Get user settings.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "settings": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-id",
    "darkMode": true,
    "biometricEnabled": false,
    "autoLockMinutes": 5,
    "storageProvider": "LOCAL",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note**: Creates default settings if they don't exist.

**Example**:

```bash
curl https://api.yourdomain.com/api/settings \
  -H "Authorization: Bearer <token>"
```

---

### PATCH /settings

Update user settings.

**Authentication**: Required

**Request Body**:

```json
{
  "darkMode": true,
  "biometricEnabled": true,
  "autoLockMinutes": 10,
  "storageProvider": "S3"
}
```

**Validation**:
- All fields optional
- `autoLockMinutes`: Integer between 0 and 240
- `storageProvider`: "LOCAL" or "S3"

**Response**: `200 OK`

```json
{
  "settings": {
    // Updated settings object
  }
}
```

**Example**:

```bash
curl -X PATCH https://api.yourdomain.com/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "darkMode": true,
    "autoLockMinutes": 10
  }'
```

---

## Statistics

### GET /stats/overview

Get document statistics overview.

**Authentication**: Required

**Response**: `200 OK`

```json
{
  "overview": {
    "total": 50,
    "active": 35,
    "expiring": 10
  }
}
```

**Notes**:
- `active`: Documents that are not expired and not expiring soon
- `expiring`: Documents expiring within 30 days
- `total`: Total number of documents

**Example**:

```bash
curl https://api.yourdomain.com/api/stats/overview \
  -H "Authorization: Bearer <token>"
```

---

## Rate Limiting

Currently, the API does not enforce rate limiting. However, it's recommended to:

- Implement client-side rate limiting
- Cache responses when appropriate
- Batch requests when possible

Rate limiting may be added in future versions.

---

## Best Practices

### 1. Token Management

- Store tokens securely (use secure storage on mobile, httpOnly cookies on web)
- Handle token expiration gracefully
- Implement token refresh if needed
- Clear tokens on logout

### 2. Error Handling

- Always check response status codes
- Parse error responses for user-friendly messages
- Implement retry logic for transient errors
- Log errors for debugging

### 3. File Uploads

- Validate file types and sizes client-side before upload
- Show upload progress for large files
- Handle upload failures gracefully
- Compress images before upload when possible

### 4. Performance

- Use pagination for large lists (when implemented)
- Cache frequently accessed data
- Implement request debouncing for search
- Use appropriate HTTP methods (GET for reads, POST/PATCH/DELETE for writes)

### 5. Security

- Never expose tokens in URLs or logs
- Use HTTPS in production
- Validate all user input
- Implement proper CORS policies

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class PiDocsAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(data.token);
    return data;
  }

  async getDocuments() {
    return this.request<{ documents: any[] }>('/documents');
  }

  async createDocument(document: any, file?: File) {
    const formData = new FormData();
    Object.entries(document).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    if (file) {
      formData.append('file', file);
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }
}

// Usage
const api = new PiDocsAPI('https://api.yourdomain.com/api');
await api.login('user@example.com', 'password');
const documents = await api.getDocuments();
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class PiDocsAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None

    def set_token(self, token: str):
        self.token = token

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        headers = kwargs.pop('headers', {})
        headers['Content-Type'] = 'application/json'
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        response = requests.request(
            method,
            f'{self.base_url}{endpoint}',
            headers=headers,
            **kwargs
        )
        response.raise_for_status()
        return response.json()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        data = self._request(
            'POST',
            '/auth/login',
            json={'email': email, 'password': password}
        )
        self.set_token(data['token'])
        return data

    def get_documents(self) -> Dict[str, Any]:
        return self._request('GET', '/documents')

    def create_document(self, document: Dict[str, Any], file_path: Optional[str] = None) -> Dict[str, Any]:
        data = document.copy()
        files = None
        
        if file_path:
            files = {'file': open(file_path, 'rb')}

        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        response = requests.post(
            f'{self.base_url}/documents',
            headers=headers,
            data=data,
            files=files
        )
        response.raise_for_status()
        return response.json()

# Usage
api = PiDocsAPI('https://api.yourdomain.com/api')
api.login('user@example.com', 'password')
documents = api.get_documents()
```

---

## Support

For API support:
- Check the [Deployment Guide](../DEPLOYMENT.md) for setup
- Review [Environment Setup](../SETUP_ENV.md) for configuration
- Open an issue on GitHub for bugs or feature requests

---

**API Version**: 1.0.0  
**Last Updated**: 2024-01-11
