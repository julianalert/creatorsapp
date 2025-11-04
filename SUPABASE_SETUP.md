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
NEXT_PUBLIC_APP_URL=https://app.creatooors.com
```

**Important:** Only set `NEXT_PUBLIC_APP_URL` in production. For localhost, leave it unset and it will work automatically.

## Supabase Dashboard Configuration

### 1. Site URL Configuration

1. Go to your Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://app.creatooors.com`

### 2. Redirect URLs

Add these redirect URLs in **Authentication** → **URL Configuration** → **Redirect URLs**:

**Production:**
```
https://app.creatooors.com/auth/callback
https://app.creatooors.com/reset-password
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

## Testing

1. **Local Development:**
   - **Don't set** `NEXT_PUBLIC_APP_URL` in `.env.local` - it will automatically use `http://localhost:3000`
   - Make sure Supabase redirect URLs include `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`
   - Test signup, signin, and password reset flows

2. **Production:**
   - Set `NEXT_PUBLIC_APP_URL=https://app.creatooors.com` in your hosting platform's environment variables
   - Verify redirect URLs are configured in Supabase dashboard for production
   - Test the authentication flows on your live site

## Security Notes

- Never commit `.env.local` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side (it's already configured correctly)
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Make sure your redirect URLs match exactly what's configured in Supabase

