# Fix: Google OAuth Error - Extra Spaces in URL

## The Problem

The error from Supabase logs shows:
```
parse "   https://yuzuu.co": first path segment in URL cannot contain colon
```

This means there are **3 extra spaces** before the URL `https://yuzuu.co` in your Supabase configuration.

## The Fix

### Step 1: Fix Supabase Site URL (CRITICAL)

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Find the **Site URL** field
4. **Remove ALL spaces** before and after the URL
5. It should be exactly: `https://yuzuu.co`
   - No spaces before
   - No spaces after
   - No trailing slash
6. Click **Save**

### Step 2: Check Environment Variables

Make sure your environment variables don't have extra spaces:

**In your hosting platform (Vercel, etc.):**
```bash
NEXT_PUBLIC_APP_URL=https://yuzuu.co
```

**Important:** 
- No spaces before or after
- No quotes around the URL
- No trailing slash

### Step 3: Verify Redirect URLs

1. Still in **Authentication** → **URL Configuration**
2. Check **Redirect URLs**
3. Make sure `https://yuzuu.co/auth/callback` is listed
4. **Remove any spaces** before or after the URL
5. Click **Save**

### Step 4: Test Again

After fixing the spaces:
1. Try signing in with Google again
2. The error should be resolved

## Why This Happened

This usually happens when:
- Copy-pasting URLs with extra spaces
- Supabase UI sometimes adds spaces when saving
- Environment variables with quotes or spaces

## Prevention

Always:
- Type URLs manually or carefully copy-paste
- Check for spaces before saving
- Verify the URL looks correct in the Supabase dashboard

