# API Documentation

## Base URL

- **Production:** `https://app.creatooors.com/api`
- **Development:** `http://localhost:3000/api`

## Authentication

Most endpoints require authentication. Include the Supabase session cookie in requests, or use the Supabase client SDK.

**Unauthenticated requests will receive:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "..."
  },
  "requestId": "...",
  "timestamp": "..."
}
```

## Rate Limiting

Rate limits are applied to prevent abuse:

- **Expensive operations** (scraping, AI): 10 requests/hour
- **Credit operations**: 5 requests/minute
- **External API calls**: 30 requests/hour
- **General API**: 100 requests/minute

Rate limit responses include:
- `X-RateLimit-Limit` header
- `X-RateLimit-Remaining` header
- `X-RateLimit-Reset` header
- `Retry-After` in response body (seconds)

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "requestId": "abc123...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "requestId": "abc123..."
  },
  "requestId": "abc123...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Codes

- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid request
- `VALIDATION_ERROR` (400) - Validation failed
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - Service unavailable
- `TIMEOUT` (408) - Request timeout

## Endpoints

### Health Check

#### `GET /api/health`

Public health check endpoint. No authentication required.

**Response:**
```json
{
  "status": "ok" | "degraded" | "down",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "ok" | "degraded" | "down",
    "api": "ok"
  }
}
```

**Status Codes:**
- `200` - All services healthy
- `200` - Degraded (some services down)
- `503` - Down (critical services unavailable)

---

### User Credits

#### `GET /api/user/credits`

Get current user's credit balance.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "credits": 100
  },
  "requestId": "...",
  "timestamp": "..."
}
```

---

### Agents

#### `GET /api/agents/list`

Get list of available agents.

**Authentication:** Required

**Query Parameters:**
- `category` (optional) - Filter by category
- `slug` (optional) - Get specific agent by slug
- `include_inactive` (optional) - Include inactive agents (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "slug": "conversion-rate-optimizer",
      "title": "Conversion Rate Optimizer",
      "category": "SEO",
      "credits": 1,
      "is_active": true,
      ...
    }
  ]
}
```

#### `GET /api/agents/results`

Get agent execution results for current user.

**Authentication:** Required

**Query Parameters:**
- `agent_slug` (optional) - Filter by agent slug
- `agent_id` (optional) - Filter by agent ID
- `id` (optional) - Get specific result by ID
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "user_id": "...",
      "agent_id": "...",
      "agent_slug": "...",
      "input_params": { ... },
      "result_data": { ... },
      "created_at": "..."
    }
  ]
}
```

#### `POST /api/agents/rate`

Rate an agent (1-5 stars).

**Authentication:** Required

**Request Body:**
```json
{
  "agentId": "uuid",
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "rating": {
    "id": "...",
    "user_id": "...",
    "agent_id": "...",
    "rating": 5,
    "created_at": "..."
  },
  "agentStats": {
    "rating_count": 10,
    "rating_average": 4.5
  }
}
```

#### `GET /api/agents/rate`

Get user's rating for an agent.

**Authentication:** Required

**Query Parameters:**
- `agent_id` (required) - Agent ID

**Response:**
```json
{
  "success": true,
  "rating": {
    "id": "...",
    "user_id": "...",
    "agent_id": "...",
    "rating": 5,
    "created_at": "..."
  } | null
}
```

---

### Agent Execution

#### `POST /api/agents/conversion-rate-optimizer`

Execute Conversion Rate Optimizer agent.

**Authentication:** Required  
**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "url": "https://example.com",
  "conversionGoal": "Sign up for newsletter"
}
```

**Response:**
```json
{
  "success": true,
  "result": "Analysis result...",
  "url": "https://example.com",
  "conversionGoal": "Sign up for newsletter",
  "resultId": "uuid",
  "creditsRemaining": 99
}
```

**Error Codes:**
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `400` - Invalid URL or unsafe URL (SSRF protection)

#### `POST /api/agents/seo-audit`

Execute SEO Audit agent.

**Authentication:** Required  
**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "result": "SEO audit result...",
  "url": "https://example.com",
  "resultId": "uuid",
  "creditsRemaining": 99
}
```

---

### Scraping

#### `POST /api/scrape`

Scrape a website and generate brand profile.

**Authentication:** Required  
**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "contentType": "text/markdown",
  "body": "...",
  "markdown": "...",
  "status": 200,
  "finalUrl": "https://example.com",
  "websiteId": "uuid",
  "brandProfile": {
    "industry": "...",
    "niche": "...",
    "tone": "...",
    ...
  },
  "brandProfileError": null
}
```

**Error Codes:**
- `400` - Invalid or unsafe URL (SSRF protection)
- `429` - Rate limit exceeded
- `408` - Request timeout

---

### Instagram

#### `GET /api/instagram/profile`

Get Instagram profile data.

**Authentication:** Required  
**Rate Limit:** 30 requests/hour

**Query Parameters:**
- `handle` (required) - Instagram handle (without @)

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "...",
    "full_name": "...",
    "biography": "...",
    "follower_count": 1000,
    "following_count": 500,
    ...
  }
}
```

#### `GET /api/instagram/posts`

Get Instagram posts for a user.

**Authentication:** Required  
**Rate Limit:** 30 requests/hour

**Query Parameters:**
- `handle` (required) - Instagram handle
- `next_max_id` (optional) - Pagination token

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "next_max_id": "...",
    ...
  }
}
```

---

### Payments (Stripe)

#### `POST /api/stripe/checkout`

Create Stripe checkout session.

**Authentication:** Required  
**Rate Limit:** 5 requests/minute

**Request Body:**
```json
{
  "packageId": "100" | "500" | "1000"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Credit Packages:**
- `100` - 100 credits for $17.00
- `500` - 500 credits for $85.00
- `1000` - 1000 credits for $97.00

#### `POST /api/stripe/webhook`

Stripe webhook endpoint (handled by Stripe).

**Authentication:** Stripe signature verification

**Note:** This endpoint is called by Stripe, not by your application.

#### `POST /api/stripe/manual-credit`

Manual credit addition (development only).

**Authentication:** Required  
**Environment:** Development/Test only (blocked in production)

**Request Body:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Response:**
```json
{
  "success": true,
  "creditsAdded": 100,
  "newBalance": 110,
  "message": "Successfully added 100 credits. New balance: 110"
}
```

---

### Image Proxy

#### `GET /api/image-proxy`

Proxy Instagram images (CORS bypass).

**Authentication:** Not required (public)

**Query Parameters:**
- `url` (required) - Instagram CDN URL

**Response:**
- Image binary data with appropriate content-type headers

**Security:**
- Only allows Instagram CDN URLs
- Validates content type
- 10MB size limit
- 10 second timeout

---

## Request Headers

### Optional Headers

- `X-Request-ID` - Custom request ID for tracing (auto-generated if not provided)

### Response Headers

- `X-Request-ID` - Request ID for tracing
- `X-RateLimit-Limit` - Rate limit maximum
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `Retry-After` - Seconds to wait (rate limited)

## Security

### URL Validation

All endpoints that accept URLs validate them to prevent SSRF attacks:
- Only HTTPS URLs allowed in production
- Private IP ranges blocked
- Localhost blocked
- Internal network addresses blocked

### Input Validation

- All inputs are validated and sanitized
- Type checking on all parameters
- Size limits on request bodies (1MB)
- Rate limiting on all endpoints

### Error Handling

- Generic error messages in production
- Detailed errors logged server-side only
- Request IDs for tracing
- Consistent error format

## Examples

### Using Fetch

```javascript
// Get user credits
const response = await fetch('/api/user/credits', {
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
console.log(data.data.credits)
```

### Using Supabase Client

```javascript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
// Supabase handles authentication automatically
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/agents/list')
  const data = await response.json()
  
  if (!data.success) {
    console.error('Error:', data.error.message)
    console.log('Request ID:', data.requestId)
  }
} catch (error) {
  console.error('Network error:', error)
}
```

## Versioning

Current API version: **v1** (implicit)

Future versions will use `/api/v2/...` structure.

## Support

For issues or questions:
- Check error messages and request IDs
- Review rate limit headers
- Verify authentication status
- Check URL validation for SSRF-protected endpoints

