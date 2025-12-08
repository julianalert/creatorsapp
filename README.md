# CreatorsApp

A Next.js application for creator management and marketing automation.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Security Checks

```bash
# Check for exposed secrets
npm run check-secrets

# Check for dependency vulnerabilities
npm run check-dependencies

# Run all security checks
npm run security-check
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Security

This application has undergone comprehensive security auditing. See:

- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Full security audit
- [SECURITY_ACTION_PLAN.md](./SECURITY_ACTION_PLAN.md) - Action plan
- [CRITICAL_FIXES_SUMMARY.md](./CRITICAL_FIXES_SUMMARY.md) - Critical fixes
- [HIGH_PRIORITY_FIXES_SUMMARY.md](./HIGH_PRIORITY_FIXES_SUMMARY.md) - High priority fixes
- [MEDIUM_PRIORITY_FIXES_SUMMARY.md](./MEDIUM_PRIORITY_FIXES_SUMMARY.md) - Medium priority fixes

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── (default)/        # Main application pages
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   └── utils/            # Utility functions
└── scripts/               # Build and security scripts
```

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SCRAPING_BEE_API_KEY` - ScrapingBee API key
- `SCRAPE_CREATORS_API_KEY` - ScrapeCreators API key
- `OPENAI_API_KEY` - OpenAI API key

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

See [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
