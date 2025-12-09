# Supabase Configuration Guide

## Environment Variables

### Local Development (`.env.local`)

Add these to your `.env.local` file (this file is gitignored and won't be committed):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DON'T set NEXT_PUBLIC_APP_URL here - it will automatically use localhost:3000
```

**Note:** You don't need to set `NEXT_PUBLIC_APP_URL` for localhost - the app will automatically detect `http://localhost:3000` from `window.location.origin`.

### Production Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://yuzuu.co
```

**Important:** Only set `NEXT_PUBLIC_APP_URL` in production. For localhost, leave it unset and it will work automatically.

## Supabase Dashboard Configuration

### 1. Site URL Configuration

1. Go to your Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://yuzuu.co`

### 2. Redirect URLs

Add these redirect URLs in **Authentication** → **URL Configuration** → **Redirect URLs**:

**Production:**
```
https://yuzuu.co/auth/callback
https://yuzuu.co/reset-password
```

**Development (if you want to test locally):**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

Click **Add URL** for each one.

### 3. Email Templates (Optional)

You can customize email templates in **Authentication** → **Email Templates**:
- Confirm signup
- Reset password
- Magic link
- Change email address

### 4. Email Provider Settings

If you want to use a custom SMTP provider (recommended for production):
1. Go to **Authentication** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, AWS SES, etc.)
3. This ensures reliable email delivery

### 5. Google OAuth Configuration

To enable Google sign-in and sign-up:

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application** as the application type
   - Add authorized redirect URIs:
     - Production: `https://[your-project-ref].supabase.co/auth/v1/callback`
     - Development: `https://[your-project-ref].supabase.co/auth/v1/callback` (same for both)
   - Copy the **Client ID** and **Client Secret**

2. **Configure in Supabase:**
   - Go to your Supabase Dashboard → **Authentication** → **Providers**
   - Find **Google** in the list and click to configure
   - Enable the Google provider
   - Paste your **Client ID** and **Client Secret** from Google Cloud Console
   - Click **Save**

3. **Important Notes:**
   - The redirect URI in Google Cloud Console must match **exactly**: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Replace `[your-project-ref]` with your actual Supabase project reference (found in your Supabase project URL)
   - Google OAuth will work for both sign-in and sign-up automatically
   - Users can sign in with Google even if they previously signed up with email/password (if the email matches)

4. **Troubleshooting Google OAuth 500 Errors:**
   
   If you're getting a 500 error when trying to sign in with Google, check the following:
   
   **a. Verify Google Cloud Console Configuration:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID
   - Under **Authorized redirect URIs**, ensure you have **exactly**:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
   - Make sure there are no extra spaces, trailing slashes, or typos
   - The project reference should match your Supabase project URL (e.g., if your Supabase URL is `https://cuguhabyzdwtvrcuynev.supabase.co`, use `cuguhabyzdwtvrcuynev`)
   
   **b. Verify Supabase Configuration:**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - **Site URL** should be set to: `https://yuzuu.co` (no trailing slash, no spaces)
   - **Redirect URLs** should include:
     ```
     https://yuzuu.co/auth/callback
     ```
   - Make sure there are no extra spaces or formatting issues
   
   **c. Verify Google OAuth Credentials in Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Ensure the provider is **enabled**
   - Verify the **Client ID** and **Client Secret** match exactly what's in Google Cloud Console
   - Try disabling and re-enabling the Google provider, then save again
   
   **d. Check Supabase Logs:**
   - Go to Supabase Dashboard → **Logs** → **Auth Logs**
   - Look for any error messages related to the OAuth callback
   - This will give you more specific information about what's failing
   
   **e. Common Issues:**
   - **Mismatched redirect URI**: The redirect URI in Google Cloud Console must match Supabase's callback URL exactly
   - **Wrong project reference**: Make sure you're using the correct Supabase project reference in the redirect URI
   - **Site URL mismatch**: The Site URL in Supabase must match your actual website URL
   - **Extra spaces**: Check for any extra spaces in URLs (common copy-paste issue)
   - **HTTP vs HTTPS**: Make sure all URLs use `https://` (not `http://`)

   **f. Still Getting 500 Errors?**
   - See `GOOGLE_OAUTH_DEBUGGING.md` for detailed troubleshooting steps
   - **Most important**: Check **Supabase Dashboard → Logs → Auth Logs** for the exact error message
   - The error message in the logs will tell you exactly what's wrong

## Testing

1. **Local Development:**
   - **Don't set** `NEXT_PUBLIC_APP_URL` in `.env.local` - it will automatically use `http://localhost:3000`
   - Make sure Supabase redirect URLs include `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`
   - Test signup, signin, and password reset flows

2. **Production:**
   - Set `NEXT_PUBLIC_APP_URL=https://yuzuu.co` in your hosting platform's environment variables
   - Verify redirect URLs are configured in Supabase dashboard for production
   - Test the authentication flows on your live site

## Security Notess

- Never commit `.env.local` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side (it's already configured correctly)
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Make sure your redirect URLs match exactly what's configured in Supabase

