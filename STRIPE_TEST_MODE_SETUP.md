# Fix: "Your card was declined - Production mode with test card"

## The Problem

You're seeing this error:
> "Votre carte a été refusée. Votre demande a été effectuée dans le mode production mais a utilisé une carte de test connue."

This means you're using **production Stripe keys** (`sk_live_...`) but trying to use a **test card** (`4242 4242 4242 4242`).

## The Solution

You need to use **test mode keys** for local development and testing.

## Step 1: Get Your Test Mode Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Make sure you're in TEST MODE** (toggle in the top right should say "Test mode")
3. Go to **Developers** → **API keys**
4. Copy your **Secret key** (it should start with `sk_test_...`)
5. Copy your **Publishable key** (it should start with `pk_test_...`) - optional

## Step 2: Update Your `.env.local` File

Open or create `.env.local` in your project root and add:

```bash
# Stripe Test Mode Keys (for development)
STRIPE_SECRET_KEY=sk_test_... # Your test secret key
STRIPE_WEBHOOK_SECRET=whsec_... # For webhooks (see below)
```

**Important:** 
- ✅ Use keys that start with `sk_test_` (not `sk_live_`)
- ✅ Make sure you're in **Test mode** in Stripe Dashboard when copying keys

## Step 3: Restart Your Dev Server

After updating `.env.local`:

```bash
# Stop your server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test Again

1. Go to `/credits`
2. Click "Buy 100 Credits"
3. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

It should work now! ✅

## Test vs Production Keys

| Mode | Secret Key Format | Use Case |
|------|------------------|----------|
| **Test** | `sk_test_...` | Development, testing |
| **Production** | `sk_live_...` | Real payments, live site |

## How to Switch Between Test and Production

### For Local Development:
```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_... # Test mode
```

### For Production:
```bash
# Production environment variables (Vercel, etc.)
STRIPE_SECRET_KEY=sk_live_... # Production mode
```

## Test Cards

In **test mode**, you can use these cards:

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔒 Requires 3D Secure |

## Webhook Secret for Testing

For local testing, you have two options:

### Option 1: Stripe CLI (Recommended)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_... secret that appears
```

### Option 2: Skip Webhook (Manual Testing)
For quick testing, you can temporarily skip webhooks and manually verify credits were added.

## Still Having Issues?

1. **Double-check your `.env.local` file:**
   - Make sure keys start with `sk_test_`
   - No extra spaces or quotes
   - File is in project root

2. **Verify Stripe Dashboard:**
   - Toggle is set to "Test mode"
   - You're copying keys from the Test mode section

3. **Check server logs:**
   - Look for any Stripe API errors
   - Verify the key is being loaded correctly

4. **Clear cache and restart:**
   ```bash
   rm -rf .next
   npm run dev
   ```

## Quick Checklist

- [ ] Stripe Dashboard is in **Test mode**
- [ ] Using `sk_test_...` key (not `sk_live_...`)
- [ ] Key is in `.env.local` file
- [ ] Dev server restarted after adding key
- [ ] Using test card `4242 4242 4242 4242`

Once all checked, the payment should work! 🎉

