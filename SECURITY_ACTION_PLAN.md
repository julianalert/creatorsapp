# Security Action Plan

**Based on:** Comprehensive Security Audit (January 2025)  
**Status:** Ready for Implementation  
**Total Issues:** 18 (0 Critical, 4 High, 8 Medium, 6 Low)

---

## 🚨 Priority 0: Must Fix Before Launch

### 1. Implement Production-Ready Rate Limiting
**Issue:** In-memory rate limiting won't work in production  
**Time:** 4-6 hours  
**Files to Modify:**
- `lib/utils/rate-limit.ts`
- Add Redis/Upstash integration
- Update all API routes using rate limiting

**Action Items:**
- [ ] Set up Upstash Redis (or similar)
- [ ] Create Redis-based rate limiter
- [ ] Keep in-memory as fallback for development
- [ ] Test rate limiting across multiple instances
- [ ] Update rate limit configurations

**Acceptance Criteria:**
- Rate limits persist across server restarts
- Works correctly in multi-instance deployments
- Memory usage is bounded
- Fallback to in-memory for development

---

### 2. Implement CSRF Protection
**Issue:** CSRF protection utilities exist but aren't used  
**Time:** 6-8 hours  
**Files to Modify:**
- All API routes with POST/PUT/DELETE/PATCH
- Frontend forms making API calls
- `lib/utils/csrf.ts` (already exists)

**Action Items:**
- [ ] Add CSRF token generation to forms
- [ ] Add CSRF token validation to API routes
- [ ] Update frontend to include CSRF tokens in requests
- [ ] Test CSRF protection
- [ ] Document CSRF implementation

**Endpoints to Protect:**
- [ ] `/api/stripe/checkout` (POST)
- [ ] `/api/agent-requests` (POST)
- [ ] `/api/agents/feedback` (POST)
- [ ] `/api/agents/rate` (POST)
- [ ] Any other state-changing endpoints

**Acceptance Criteria:**
- All state-changing operations require CSRF token
- CSRF tokens are validated server-side
- Forms include CSRF tokens
- API requests include CSRF tokens
- Tests verify CSRF protection works

---

### 3. Implement Server-Side Account Lockout
**Issue:** Client-side lockout can be bypassed  
**Time:** 4-6 hours  
**Files to Modify:**
- `lib/utils/account-lockout.ts` (keep for UX)
- Create Supabase function for server-side lockout
- Update signin API/auth flow

**Action Items:**
- [ ] Create Supabase database function for failed attempt tracking
- [ ] Implement server-side lockout logic
- [ ] Update authentication flow to check server-side lockout
- [ ] Keep client-side lockout as UX enhancement
- [ ] Add progressive delays (exponential backoff)
- [ ] Log failed attempts server-side

**Acceptance Criteria:**
- Server-side lockout cannot be bypassed
- Failed attempts are tracked in database
- Lockout persists across sessions
- Progressive delays implemented
- Client-side lockout works for UX

---

### 4. Configure Request Size Limits
**Issue:** No request body size limits  
**Time:** 2-3 hours  
**Files to Modify:**
- `next.config.js`
- Individual API routes (if needed)

**Action Items:**
- [ ] Configure body size limits in `next.config.js`
- [ ] Add explicit size checks in API routes
- [ ] Set appropriate limits per endpoint type
- [ ] Test with large requests
- [ ] Add error handling for oversized requests

**Configuration:**
```javascript
// next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Default
    },
    responseLimit: '8mb',
  },
}
```

**Acceptance Criteria:**
- Request size limits configured
- Appropriate limits per endpoint
- Clear error messages for oversized requests
- Tests verify limits work

---

## ⚠️ Priority 1: Should Fix Before Launch

### 5. Add Input Length Validation
**Time:** 2-3 hours  
**Action Items:**
- [ ] Review all API endpoints for missing length limits
- [ ] Add maximum length validation
- [ ] Standardize limits across similar endpoints
- [ ] Add both client and server-side validation

**Endpoints to Update:**
- [ ] `/api/agent-requests` - Add max length to `requestText`
- [ ] Review all other endpoints

---

### 6. Implement IP-Based Rate Limiting
**Time:** 3-4 hours  
**Action Items:**
- [ ] Add IP detection utility
- [ ] Implement IP-based rate limiting
- [ ] Combine with user-based limits
- [ ] Apply to public/unauthenticated endpoints
- [ ] Test IP-based limits

---

### 7. Set Up Security Monitoring
**Time:** 6-8 hours  
**Action Items:**
- [ ] Choose monitoring service (Sentry, LogRocket, etc.)
- [ ] Set up logging for security events
- [ ] Configure alerts for:
  - Failed authentication spikes
  - Rate limit violations
  - Unusual API usage
  - Error rate spikes
- [ ] Create security dashboard
- [ ] Document monitoring setup

---

### 8. Review Error Message Sanitization
**Time:** 2-3 hours  
**Action Items:**
- [ ] Review all API error responses
- [ ] Ensure no internal details leaked
- [ ] Use error codes for debugging
- [ ] Log detailed errors server-side only
- [ ] Test error responses

---

## 📋 Priority 2: Nice to Have

### 9. Implement CSP Nonces
**Time:** 4-6 hours  
**Action Items:**
- [ ] Implement Next.js CSP nonce support
- [ ] Remove `'unsafe-inline'` directives
- [ ] Test all functionality
- [ ] Verify CSP headers

---

### 10. Add Request ID Tracking
**Time:** 3-4 hours  
**Action Items:**
- [ ] Apply request ID middleware to all API routes
- [ ] Include request IDs in error responses
- [ ] Log request IDs with security events
- [ ] Use existing `lib/utils/request-id.ts` pattern

---

### 11. Document API Key Rotation
**Time:** 2-3 hours  
**Action Items:**
- [ ] Document key rotation procedures
- [ ] Create runbook for emergency rotation
- [ ] Set up key usage monitoring
- [ ] Consider secret management service

---

## 🔧 Priority 3: Low Priority

### 12. Set Up Dependency Automation
**Time:** 1 hour  
**Action Items:**
- [ ] Set up Dependabot or Renovate
- [ ] Configure security updates
- [ ] Set up auto-merge for patch updates (optional)

---

### 13. Create Security.txt File
**Time:** 30 minutes  
**Action Items:**
- [ ] Create `public/.well-known/security.txt`
- [ ] Add security contact email
- [ ] Follow RFC 9116 format

---

### 14. Add Security Documentation
**Time:** 2-3 hours  
**Action Items:**
- [ ] Create security best practices guide
- [ ] Document security features
- [ ] Add security section to README
- [ ] Create developer security guidelines

---

## 📊 Progress Tracking

### Pre-Launch Checklist
- [ ] All P0 issues fixed
- [ ] All P1 issues fixed (or documented as acceptable risk)
- [ ] Security testing completed
- [ ] Penetration testing completed
- [ ] Security monitoring active
- [ ] Incident response plan created
- [ ] Team trained on security procedures

### Post-Launch
- [ ] Schedule quarterly security audits
- [ ] Set up regular dependency updates
- [ ] Monitor security events
- [ ] Review and update security measures

---

## 📅 Suggested Timeline

### Week 1: Critical Fixes (P0)
- Day 1-2: Rate limiting (Redis)
- Day 3-4: CSRF protection
- Day 5: Server-side account lockout
- Day 6-7: Request size limits + testing

### Week 2: Important Fixes (P1)
- Day 1: Input length validation
- Day 2: IP-based rate limiting
- Day 3-4: Security monitoring setup
- Day 5: Error message review

### Week 3: Testing & Documentation
- Day 1-2: Security testing
- Day 3: Penetration testing (external)
- Day 4-5: Documentation and runbooks

---

## 🎯 Success Metrics

- ✅ Zero critical vulnerabilities
- ✅ All P0 issues resolved
- ✅ Security monitoring active
- ✅ Penetration testing passed
- ✅ Team trained on security
- ✅ Incident response plan ready

---

## 📝 Notes

- Focus on P0 issues first - these are blockers for launch
- P1 issues should be addressed but can be done post-launch if needed
- P2/P3 issues are improvements that can be done over time
- Regular security audits should be scheduled quarterly
- Keep security documentation updated

---

**Last Updated:** January 2025  
**Next Review:** After P0 fixes completed
