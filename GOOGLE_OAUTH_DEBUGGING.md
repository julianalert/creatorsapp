# Google OAuth Debugging Guide

## Where to Get More Information

### 1. Supabase Auth Logs (Most Important)

The 500 error is happening at Supabase's callback endpoint. To see the actual error:

1. Go to your **Supabase Dashboard**
2. Navigate to **Logs** → **Auth Logs**
3. Look for entries around the time you tried to sign in
4. The logs will show the exact error message from Supabase

**What to look for:**
- Error messages about OAuth configuration
- Missing or invalid credentials
- Redirect URI mismatches
- Database errors

### 2. Check Your Supabase Project Settings

Go to **Settings** → **API** and verify:
- Your project URL matches: `https://cuguhabyzdwtvrcuynev.supabase.co`
- Your anon key is correct

### 3. Verify Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check **Authorized redirect URIs**:
   - Must be exactly: `https://cuguhabyzdwtvrcuynev.supabase.co/auth/v1/callback`
   - No trailing slash
   - No spaces
   - Must match exactly

### 4. Verify Supabase OAuth Configuration

1. Go to **Authentication** → **Providers** → **Google**
2. Check:
   - Provider is **enabled** (toggle should be ON)
   - **Client ID** matches exactly what's in Google Cloud Console
   - **Client Secret** matches exactly what's in Google Cloud Console
   - No extra spaces or characters

### 5. Check Supabase URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Verify:
   - **Site URL**: `https://yuzuu.co` (no trailing slash, no spaces)
   - **Redirect URLs** includes: `https://yuzuu.co/auth/callback`

### 6. Common Issues That Cause 500 Errors

#### Issue 1: Redirect URI Mismatch
- **Symptom**: 500 error immediately after Google redirect
- **Fix**: Ensure Google Cloud Console redirect URI is exactly: `https://cuguhabyzdwtvrcuynev.supabase.co/auth/v1/callback`

#### Issue 2: Invalid Client Secret
- **Symptom**: 500 error with "invalid_client" or "unauthorized_client"
- **Fix**: Regenerate Client Secret in Google Cloud Console and update in Supabase

#### Issue 3: OAuth Consent Screen Not Configured
- **Symptom**: 500 error with consent screen errors
- **Fix**: Complete OAuth consent screen setup in Google Cloud Console

#### Issue 4: API Not Enabled
- **Symptom**: 500 error with API errors
- **Fix**: Enable Google+ API or Google Identity API in Google Cloud Console

#### Issue 5: Database/RLS Issues
- **Symptom**: 500 error after successful OAuth but before user creation
- **Fix**: Check Supabase Auth Logs for database errors, verify RLS policies

### 7. Test the OAuth Flow Manually

You can test if the redirect URI is correct by:

1. Go to Google Cloud Console → Your OAuth Client
2. Copy the redirect URI: `https://cuguhabyzdwtvrcuynev.supabase.co/auth/v1/callback`
3. Try accessing it directly (it will fail, but you'll see if it's reachable)

### 8. Check Browser Network Tab

1. Open browser DevTools → Network tab
2. Try signing in with Google
3. Look for the request to `https://cuguhabyzdwtvrcuynev.supabase.co/auth/v1/callback`
4. Check the response - it should show the error details

### 9. Verify Environment Variables

Make sure your production environment has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://cuguhabyzdwtvrcuynev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://yuzuu.co
```

### 10. Try Disabling and Re-enabling Google Provider

Sometimes Supabase needs a refresh:
1. Go to **Authentication** → **Providers** → **Google**
2. Disable the provider
3. Save
4. Re-enable it
5. Re-enter Client ID and Client Secret
6. Save again

## Next Steps

1. **Check Supabase Auth Logs first** - This will tell you exactly what's wrong
2. **Share the error message** from the logs so we can fix it
3. **Double-check the redirect URI** - This is the most common issue

## Getting Help

If you've checked everything above and it's still not working:
1. Copy the exact error message from Supabase Auth Logs
2. Take a screenshot of your Google Cloud Console OAuth configuration
3. Take a screenshot of your Supabase Google provider settings
4. Share these details for further debugging

