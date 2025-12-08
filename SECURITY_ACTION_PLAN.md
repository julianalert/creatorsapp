# 🛡️ SECURITY ACTION PLAN - QUICK REFERENCE

## 🔴 PHASE 1: CRITICAL FIXES (DO FIRST - 2-3 days)

### 1. Disable Manual Credit Endpoint in Production
**File:** `app/api/stripe/manual-credit/route.ts`  
**Fix:** Add environment check at start of POST handler
```typescript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
}
```

### 2. Add Authentication to All API Routes
**Files:** 
- `app/api/hello/route.ts` - Remove or add auth
- `app/api/agents/list/route.ts` - Add auth check
- Verify all other routes

**Fix:** Use `requireAuth` helper or add auth check:
```typescript
const { user, error } = await requireAuth(request)
if (!user || error) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 3. Implement Rate Limiting
**Approach:** Use Vercel Edge Config + Upstash Redis or Next.js middleware

**Priority Endpoints:**
- `/api/scrape` - 10 req/hour
- `/api/agents/*` - 20 req/hour  
- `/api/stripe/*` - 5 req/minute
- `/api/instagram/*` - 30 req/hour
- General API - 100 req/minute

### 4. Add SSRF Protection
**Files:** `app/api/scrape/route.ts`, `app/api/agents/conversion-rate-optimizer/route.ts`, `app/api/agents/seo-audit/route.ts`

**Fix:** Add comprehensive URL validation function (see full report for code)

### 5. Verify Service Role Key Security
**Action:** 
- Verify it's never in client code
- Add build-time check
- Review all usages

---

## 🟠 PHASE 2: HIGH PRIORITY (3-5 days)

### 6. Verify All RLS Policies
**Action:** 
- Check Supabase dashboard
- Verify `website` table has RLS
- Test with different user accounts

### 7. Sanitize Error Messages
**Files:** All API routes  
**Fix:** Use generic errors in production, log details server-side

### 8. Add CSRF Protection
**Action:**
- Verify cookie SameSite settings
- Add Origin header validation
- Consider CSRF tokens for sensitive operations

### 9. Add Request Size Limits
**File:** `next.config.js` + route handlers  
**Fix:**
```javascript
api: {
  bodyParser: { sizeLimit: '1mb' }
}
```

### 10. Verify Cookie Security
**Action:**
- Check Supabase cookie settings
- Verify HttpOnly, Secure, SameSite flags
- Test in production

### 11. Add Content Security Policy
**File:** `next.config.js`  
**Fix:** Add CSP header (see full report for example)

### 12. Add Logging & Monitoring
**Action:**
- Set up structured logging
- Add monitoring for:
  - Failed auth attempts
  - Credit operations
  - Rate limit violations
- Set up alerts

### 13. Add Request Timeouts
**Files:** All external API calls  
**Fix:** Use AbortController with timeout (see image-proxy for example)

---

## 🟡 PHASE 3: MEDIUM PRIORITY (2-3 days)

### 14. Strengthen Password Requirements
**File:** `app/(auth)/signup/page.tsx`  
**Fix:** Increase minLength to 8, add complexity requirements

### 15. Add Account Lockout
**Action:** Implement lockout after 5 failed attempts (check Supabase settings)

### 16. Verify Input Sanitization
**Action:** Audit all user input rendering, ensure React escaping is used

### 17. Add API Versioning
**Action:** Migrate to `/api/v1/...` structure

### 18. Add Request Tracing
**Action:** Add request IDs to all responses and logs

### 19. Standardize Error Handling
**Action:** Create error handling utility, use consistent format

### 20. Add Health Check
**File:** `app/api/health/route.ts`  
**Fix:** Create endpoint that checks DB and external services

---

## 🟢 PHASE 4: LOW PRIORITY (1-2 days)

### 21. Remove Hello Endpoint
**File:** `app/api/hello/route.ts`  
**Action:** Delete or convert to health check

### 22. Add API Documentation
**Action:** Create OpenAPI/Swagger docs

### 23. Audit Dependencies
**Action:** Run `npm audit`, fix vulnerabilities, set up Dependabot

---

## ✅ TESTING CHECKLIST

- [ ] Test all API routes without auth
- [ ] Test RLS with different users
- [ ] Test SSRF with private IPs
- [ ] Test rate limiting
- [ ] Test payment flow
- [ ] Test session security
- [ ] Test input validation
- [ ] Test error handling

---

## 📊 PROGRESS TRACKING

**Phase 1 (Critical):** ⬜ 0/5 complete  
**Phase 2 (High):** ⬜ 0/8 complete  
**Phase 3 (Medium):** ⬜ 0/7 complete  
**Phase 4 (Low):** ⬜ 0/3 complete

**Total Progress:** 0/23 issues addressed

---

## 🎯 SUCCESS CRITERIA

✅ All critical issues fixed  
✅ All high priority issues fixed  
✅ Security testing completed  
✅ Monitoring and logging in place  
✅ Documentation updated

---

**Start with Phase 1 - these are blocking production launch!**

