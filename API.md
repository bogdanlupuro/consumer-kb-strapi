# Knowledge Base API Documentation

Base URL: `{STRAPI_URL}/api`

All endpoints return JSON and support localization via the `locale` query parameter.

---

## Authentication

Currently, the Knowledge Base endpoints are **public** (no authentication required). All endpoints are read-only.

---

## Endpoints

### 1. List Articles by Locale

Get all published articles for a specific locale.

**Endpoint:** `GET /articles`

**Query Parameters:**
- `locale` (required): Locale code (`en`, `de`, etc.)
- `populate` (optional): Include related data. Use `populate=category` to include category details.
- `fields` (optional): Specify which fields to return. Example: `fields[0]=title&fields[1]=body`
- `pagination[page]` (optional): Page number (default: 1)
- `pagination[pageSize]` (optional): Items per page (default: 25, max: 100)

**Example:**
```http
GET /api/articles?locale=en&populate=category
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "What is SumUp Pay? Overview and basics",
      "body": "SumUp Pay is an e-money wallet...",
      "featured": true,
      "external_key": "sumup.overview",
      "locale": "en",
      "publishedAt": "2025-10-30T10:01:36.151Z",
      "createdAt": "2025-10-30T10:01:34.956Z",
      "updatedAt": "2025-10-30T10:01:35.958Z",
      "category": {
        "id": 1,
        "name": "Profile & Security",
        "external_key": "cat:profile",
        "description": "Account, verification (KYC), MFA and profile essentials"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 2,
      "total": 31
    }
  }
}
```

---

### 2. Get Featured/Top Articles

Get articles marked as featured (recommended for "most useful" or "top articles" sections).

**Endpoint:** `GET /articles`

**Query Parameters:**
- `locale` (required): Locale code
- `filters[featured][$eq]=true` (required): Filter by featured flag
- `populate` (optional): Use `populate=category` to include category details
- `pagination[page]` (optional): Page number
- `pagination[pageSize]` (optional): Items per page

**Example:**
```http
GET /api/articles?locale=en&filters[featured][$eq]=true&populate=category
```

**Response:**
Same structure as "List Articles", but filtered to only featured articles.

---

### 3. List Available Categories

Get all available categories for a locale.

**Endpoint:** `GET /categories`

**Query Parameters:**
- `locale` (required): Locale code (`en`, `de`, etc.)
- `fields` (optional): Specify fields. Example: `fields[0]=name&fields[1]=external_key`
- `sort` (optional): Sort order. Example: `sort=name:asc`

**Example:**
```http
GET /api/categories?locale=en
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "cat123",
      "name": "Profile & Security",
      "description": "Account, verification (KYC), MFA and profile essentials",
      "external_key": "cat:profile",
      "locale": "en",
      "createdAt": "2025-10-30T10:00:00.000Z",
      "updatedAt": "2025-10-30T10:00:00.000Z"
    },
    {
      "id": 2,
      "documentId": "cat456",
      "name": "Transfers",
      "description": "Sending, receiving, limits and verification checks",
      "external_key": "cat:transfers",
      "locale": "en"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 9
    }
  }
}
```

---

### 4. Get Articles by Category

Filter articles by category.

**Endpoint:** `GET /articles`

**Query Parameters:**
- `locale` (required): Locale code
- `filters[category][external_key][$eq]={category_key}` (recommended): Filter by category external_key (e.g., `cat:profile`)
  - OR `filters[category][name][$eq]={category_name}`: Filter by category name (URL-encoded)
- `populate` (optional): Use `populate=category` to include category details

**Examples:**

By external_key (recommended - most stable):
```http
GET /api/articles?locale=en&filters[category][external_key][$eq]=cat:profile&populate=category
```

By name:
```http
GET /api/articles?locale=en&filters[category][name][$eq]=Profile%20%26%20Security&populate=category
```

**Response:**
Same structure as "List Articles", filtered to articles in the specified category.

---

### 5. Get Single Article

Get a specific article by documentId or external_key.

**Endpoint:** `GET /articles/{documentId}` or filter by external_key

**Query Parameters:**
- `locale` (required): Locale code (required when using documentId)
- `populate` (optional): Use `populate=category` to include category details

**Examples:**

By documentId (recommended - returns the entry for the specified locale):
```http
GET /api/articles/abc123?locale=en&populate=category
```

By external_key:
```http
GET /api/articles?locale=en&filters[external_key][$eq]=sumup.overview&populate=category
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "documentId": "abc123",
    "title": "What is SumUp Pay? Overview and basics",
    "body": "SumUp Pay is an e-money wallet with a virtual Mastercard...",
    "featured": true,
    "external_key": "sumup.overview",
    "locale": "en",
    "publishedAt": "2025-10-30T10:01:36.151Z",
    "createdAt": "2025-10-30T10:01:34.956Z",
    "updatedAt": "2025-10-30T10:01:35.958Z",
    "category": {
      "id": 1,
      "name": "Profile & Security",
      "external_key": "cat:profile",
      "description": "Account, verification (KYC), MFA and profile essentials"
    }
  },
  "meta": {}
}
```

---

### 6. List Action Links by Locale

Get all published action links (deep links) for a specific locale.

**Endpoint:** `GET /action-links`

**Query Parameters:**
- `locale` (required): Locale code (`en`, `de`, etc.)
- `populate` (optional): Include related data. Use `populate=category` to include category details.
- `fields` (optional): Specify which fields to return. Example: `fields[0]=title&fields[1]=path`
- `pagination[page]` (optional): Page number (default: 1)
- `pagination[pageSize]` (optional): Items per page (default: 25, max: 100)

**Example:**
```http
GET /api/action-links?locale=en&populate=category
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "link123",
      "title": "Open Account",
      "description": "Navigate to the identity verification (KYC) process",
      "path": "/kyc",
      "external_key": "action.kyc.show",
      "locale": "en",
      "publishedAt": "2025-10-30T10:01:36.151Z",
      "createdAt": "2025-10-30T10:01:34.956Z",
      "updatedAt": "2025-10-30T10:01:35.958Z",
      "category": {
        "id": 1,
        "name": "Profile & Security",
        "external_key": "cat:profile",
        "description": "Account, verification (KYC), MFA and profile essentials"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 4
    }
  }
}
```

---

### 7. Get Action Links by Category

Filter action links by category.

**Endpoint:** `GET /action-links`

**Query Parameters:**
- `locale` (required): Locale code
- `filters[category][external_key][$eq]={category_key}` (recommended): Filter by category external_key (e.g., `cat:profile`)
  - OR `filters[category][name][$eq]={category_name}`: Filter by category name (URL-encoded)
- `populate` (optional): Use `populate=category` to include category details

**Examples:**

By external_key (recommended - most stable):
```http
GET /api/action-links?locale=en&filters[category][external_key][$eq]=cat:profile&populate=category
```

By name:
```http
GET /api/action-links?locale=en&filters[category][name][$eq]=Profile%20%26%20Security&populate=category
```

**Response:**
Same structure as "List Action Links", filtered to action links in the specified category.

---

### 8. Get Single Action Link

Get a specific action link by documentId or external_key.

**Endpoint:** `GET /action-links/{documentId}` or filter by external_key

**Query Parameters:**
- `locale` (required): Locale code (required when using documentId)
- `populate` (optional): Use `populate=category` to include category details

**Examples:**

By documentId (recommended - returns the entry for the specified locale):
```http
GET /api/action-links/link123?locale=en&populate=category
```

By external_key:
```http
GET /api/action-links?locale=en&filters[external_key][$eq]=action.kyc.show&populate=category
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "documentId": "link123",
    "title": "Open Account",
    "description": "Navigate to the identity verification (KYC) process",
    "path": "/kyc",
    "external_key": "action.kyc.show",
    "locale": "en",
    "publishedAt": "2025-10-30T10:01:36.151Z",
    "createdAt": "2025-10-30T10:01:34.956Z",
    "updatedAt": "2025-10-30T10:01:35.958Z",
    "category": {
      "id": 1,
      "name": "Profile & Security",
      "external_key": "cat:profile",
      "description": "Account, verification (KYC), MFA and profile essentials"
    }
  },
  "meta": {}
}
```

---

## Field Reference

### Article Fields
- `id` (number): Unique identifier (per locale)
- `documentId` (string): Shared ID across all locales for the same article
- `title` (string): Article title (localized)
- `body` (string): Article content **may contain Markdown**. Render accordingly.
- `featured` (boolean): Whether article is featured/top article
- `external_key` (string): Stable identifier for referencing (not localized)
- `locale` (string): Locale code (e.g., `en`, `de`)
- `publishedAt` (string, ISO 8601): Publication timestamp
- `createdAt` (string, ISO 8601): Creation timestamp
- `updatedAt` (string, ISO 8601): Last update timestamp
- `category` (object, relation): Category details (when populated)

### Category Fields
- `id` (number): Unique identifier (per locale)
- `documentId` (string): Shared ID across all locales
- `name` (string): Category name (localized)
- `description` (string): Category description (localized)
- `external_key` (string): Stable identifier (e.g., `cat:profile`, `cat:transfers`)
- `locale` (string): Locale code

### Action Link Fields
- `id` (number): Unique identifier (per locale)
- `documentId` (string): Shared ID across all locales for the same action link
- `title` (string): Action link title (localized)
- `description` (string): Action link description (localized)
- `path` (string): **Deep link path** (non-localized). Use this path to navigate within the app. Path excludes domain to work across environments.
- `external_key` (string): Stable identifier for referencing (not localized, e.g., `action.kyc.show`)
- `locale` (string): Locale code (e.g., `en`, `de`)
- `publishedAt` (string, ISO 8601): Publication timestamp
- `createdAt` (string, ISO 8601): Creation timestamp
- `updatedAt` (string, ISO 8601): Last update timestamp
- `category` (object, relation): Category details (when populated)

---

## Common Patterns

### Get Featured Articles with Categories
```http
GET /api/articles?locale=en&filters[featured][$eq]=true&populate=category&sort=updatedAt:desc
```

### Get All Categories and Their Article Counts
1. Fetch categories: `GET /api/categories?locale=en`
2. For each category, count articles: `GET /api/articles?locale=en&filters[category][external_key][$eq]={category.external_key}&pagination[pageSize]=1`
   - Use `meta.pagination.total` for the count

### Get Action Links with Categories
```http
GET /api/action-links?locale=en&populate=category&sort=title:asc
```

### Search Articles (Client-Side)
Fetch all articles for locale and filter client-side, or use Strapi's search if configured.

### Error Handling
Standard HTTP status codes:
- `200`: Success
- `400`: Bad request (e.g., invalid locale)
- `404`: Resource not found
- `500`: Server error

Error response format:
```json
{
  "error": {
    "status": 404,
    "message": "Not Found"
  }
}
```

---

## Notes

1. **Markdown in Body**: The `body` field may contain Markdown. Use a Markdown renderer in your mobile app.
2. **External Keys**: Use `external_key` for stable references across locales (e.g., `sumup.overview`, `cat:profile`, `action.kyc.show`).
3. **Locales**: Always specify `locale` in requests. Default locale behavior may vary.
4. **Pagination**: Default pageSize is 25. Use pagination for large result sets.
5. **Relations**: Use `populate=category` to include category details in article/action-link responses and avoid extra API calls.
6. **Action Link Paths**: The `path` field in action links contains deep link paths that exclude the domain (e.g., `/kyc`, `/referafriend/app`). Use these paths to navigate within your mobile app. Paths work across all environments since they're domain-agnostic.

