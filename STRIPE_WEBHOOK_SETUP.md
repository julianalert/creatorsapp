# Setting Up Stripe Webhook for Local Testing

## Step 1: Install Stripe CLI

### Option A: Using Homebrew (Recommended for macOS)

1. **Install Homebrew** (if you don't have it):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

### Option B: Direct Download (Alternative)

1. Go to [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest)
2. Download the macOS version (`.tar.gz` file)
3. Extract and move to `/usr/local/bin/`:
   ```bash
   tar -xzf stripe_X.X.X_macOS_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

### Option C: Using npm (if you prefer)

```bash
npm install -g stripe-cli
```

## Step 2: Login to Stripe

Run this command and follow the prompts:

```bash
stripe login
```

This will:
- Open your browser
- Ask you to authorize the CLI
- Save your API keys locally

## Step 3: Start Your Development Server

Make sure your Next.js app is running:

```bash
npm run dev
```

Your app should be running on `http://localhost:3000`

## Step 4: Forward Webhooks to Local Server

In a **new terminal window**, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important:** Keep this terminal window open while testing!

## Step 5: Copy the Webhook Secret

When you run the `stripe listen` command, you'll see output like this:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**Copy the `whsec_xxxxxxxxxxxxx` value** - this is your webhook signing secret.

## Step 6: Add to Environment Variables

1. Open or create `.env.local` in your project root
2. Add the webhook secret:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx # The secret from step 5
```

3. **Restart your Next.js dev server** for the changes to take effect

## Step 7: Test the Integration

1. Go to `http://localhost:3000/credits`
2. Click "Buy 100 Credits" (or any package)
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
4. Complete the payment
5. Check the `stripe listen` terminal - you should see webhook events
6. Verify credits are added to your account

## Troubleshooting

### "Command not found: stripe"
- Make sure Stripe CLI is installed
- Try restarting your terminal
- Verify installation: `stripe --version`

### "Webhook signature verification failed"
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly in `.env.local`
- Restart your dev server after adding the secret
- Make sure you're using the secret from the `stripe listen` command (not from Stripe Dashboard)

### Webhook not receiving events
- Make sure `stripe listen` is still running
- Check that the URL in the command matches your server URL
- Verify your dev server is running on port 3000

### Credits not being added
- Check the `stripe listen` terminal for webhook events
- Check your server logs for errors
- Verify the database function `add_user_credits` exists in Supabase

## Quick Reference

**Start webhook forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Test card numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

**View webhook events in real-time:**
The `stripe listen` command shows all webhook events as they happen.

## Next Steps

Once local testing works:
1. Deploy your app to production
2. Set up production webhook in Stripe Dashboard
3. Use production Stripe keys
4. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

