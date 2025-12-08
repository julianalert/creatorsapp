# Stripe Integration Setup Guide

This guide will help you set up Stripe for one-time credit purchases in the app.

## Prerequisites

1. A Stripe account (you mentioned you have one ready)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
   - For testing, use the **Test mode** keys
   - For production, use the **Live mode** keys

## Step 2: Set Environment Variables

Add these to your `.env.local` file (for local development):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (optional, if you need it client-side)
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret (see Step 3)
```

For production, add these to your hosting platform (Vercel, etc.):

```bash
STRIPE_SECRET_KEY=sk_live_... # Your live Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_live_... # Your live publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your production webhook secret
```

## Step 3: Set Up Stripe Webhook

### For Local Development (using Stripe CLI):

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### For Production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to your production environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 4: Credit Packages Configuration

The credit packages are configured in `/app/api/stripe/checkout/route.ts`:

- **100 credits**: $17.00
- **500 credits**: $85.00
- **1,000 credits**: $97.00

To modify these, edit the `CREDIT_PACKAGES` object in the checkout route.

## Step 5: Test the Integration

### Test Mode:

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date, any CVC, any ZIP

2. Test the flow:
   - Go to `/credits`
   - Click "Buy 100 Credits" (or any package)
   - Complete the checkout with a test card
   - Verify credits are added to your account

### Production:

1. Switch to live mode keys in your environment variables
2. Test with a real card (you can refund yourself)
3. Monitor webhook events in Stripe Dashboard

## How It Works

1. **User clicks "Buy Credits"** → Frontend calls `/api/stripe/checkout`
2. **Checkout session created** → User redirected to Stripe Checkout
3. **Payment completed** → Stripe sends webhook to `/api/stripe/webhook`
4. **Credits added** → Webhook handler calls `add_user_credits` database function
5. **User redirected** → Success page shows updated credit balance

## Troubleshooting

### Webhook not receiving events:

- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook endpoint URL is correct in Stripe Dashboard
- For local development, ensure Stripe CLI is running and forwarding events
- Check server logs for webhook errors

### Credits not being added:

- Check webhook is receiving `checkout.session.completed` events
- Verify database function `add_user_credits` exists and works
- Check server logs for errors in webhook handler
- Ensure user_id is correctly stored in checkout session metadata

### Checkout not loading:

- Verify `STRIPE_SECRET_KEY` is set correctly
- Check network tab for API errors
- Ensure user is authenticated (checkout requires login)

## Security Notes

- Never commit Stripe keys to version control
- Use environment variables for all sensitive keys
- Webhook signature verification is required for security
- Always use HTTPS in production

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)

