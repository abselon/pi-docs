# API Quick Reference

Quick reference card for Pi Docs API endpoints.

## Base URL

```
https://api.yourdomain.com/api
```

## Authentication

```
Authorization: Bearer <token>
```

---

## Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Check API status |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login and get token |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/logout` | ✅ | Logout |
| POST | `/auth/send-verification` | ✅ | Resend verification email |
| POST | `/auth/verify-email` | ❌ | Verify email with token |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password with token |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get user profile |
| PATCH | `/users/me` | ✅ | Update user profile |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents` | ✅ | List documents |
| POST | `/documents` | ✅ | Create document |
| GET | `/documents/:id` | ✅ | Get document |
| PATCH | `/documents/:id` | ✅ | Update document |
| DELETE | `/documents/:id` | ✅ | Delete document |
| GET | `/documents/:id/download` | ✅ | Download file |

**Query Parameters** (GET /documents):
- `categoryId` - Filter by category
- `search` - Search in title/description

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ✅ | List categories |
| POST | `/categories` | ✅ | Create category |
| PATCH | `/categories/:id` | ✅ | Update category |
| DELETE | `/categories/:id` | ✅ | Delete category |

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | ✅ | Get settings |
| PATCH | `/settings` | ✅ | Update settings |

### Statistics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats/overview` | ✅ | Get document stats |

---

## Common Request Examples

### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Authenticated Request

```bash
GET /documents
Authorization: Bearer <token>
```

### Create Document with File

```bash
POST /documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=Passport
description=US Passport
categoryId=uuid
file=@passport.pdf
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

---

## Data Types

### Document Status
- `ACTIVE` - Document is active
- `EXPIRING` - Expires within 30 days
- `EXPIRED` - Already expired

### Storage Provider
- `LOCAL` - Local file storage
- `S3` - AWS S3 storage

---

## Quick Start

1. **Register or Login**
   ```bash
   POST /auth/register
   # Returns: { token, user }
   ```

2. **Store Token**
   ```javascript
   localStorage.setItem('token', response.token);
   ```

3. **Make Authenticated Requests**
   ```javascript
   fetch('/api/documents', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

---

For detailed documentation, see [API.md](./API.md)
