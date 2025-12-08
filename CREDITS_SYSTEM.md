# Credits System Documentation

## Overview

The credits system manages user consumption of AI agents. Each agent has a credit cost, and users must have sufficient credits to run an agent.

## Database Schema

### `user_credits` Table

Stores the credit balance for each user.

- `id` (UUID, Primary Key)
- `user_id` (UUID, Unique, Foreign Key to `auth.users`)
- `credits` (INTEGER, Default: 0, Check: >= 0)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Automatic Credit Creation

When a new user signs up, a trigger automatically creates a `user_credits` entry with **10 credits** by default.

## Database Functions

### `deduct_user_credits(p_user_id UUID, p_credits_to_deduct INTEGER)`

Atomically checks and deducts credits from a user's balance.

- **Returns**: New balance (INTEGER) if successful, NULL if insufficient credits
- **Security**: Uses `SECURITY DEFINER` to bypass RLS
- **Race Condition Protection**: Uses `FOR UPDATE` row lock to prevent concurrent deduction issues

### `get_user_credits(p_user_id UUID)`

Gets the current credit balance for a user.

- **Returns**: Current credits (INTEGER), or 0 if user doesn't have a record
- **Security**: Uses `SECURITY DEFINER` to bypass RLS

### `add_user_credits(p_user_id UUID, p_credits_to_add INTEGER)`

Adds credits to a user's balance (for refunds or manual additions).

- **Returns**: New balance (INTEGER)
- **Security**: Uses `SECURITY DEFINER` to bypass RLS

## API Endpoints

### `GET /api/user/credits`

Fetches the current user's credit balance.

**Response:**
```json
{
  "success": true,
  "credits": 10
}
```

### Agent Routes (POST)

All agent routes (`/api/agents/*`) now:

1. **Check credits before execution**: Verify user has sufficient credits
2. **Deduct credits atomically**: Use `deduct_user_credits` function
3. **Refund on failure**: If agent execution fails, credits are refunded
4. **Return remaining balance**: Include `creditsRemaining` in successful responses

**Error Response (Insufficient Credits):**
```json
{
  "error": "Insufficient credits. This agent costs 1 credit. Please purchase more credits.",
  "insufficientCredits": true
}
```
Status Code: `402 Payment Required`

## Frontend Integration

### Display Credits

Credits are displayed in the profile dropdown (`components/dropdown-profile.tsx`):
- Shows current credit balance
- Updates automatically when credits change
- Displays coin icon with credit count

### Agent Execution Flow

1. User clicks to run an agent
2. API checks credits before execution
3. If insufficient: Error message displayed
4. If sufficient: Credits deducted, agent runs
5. On success: Result displayed, remaining credits shown
6. On failure: Credits refunded, error displayed

## Credit Costs

Each agent has a `credits` column in the `agents` table:
- Default: 1 credit per agent run
- Can be customized per agent
- Stored in database, not hardcoded

## Security

- **Row Level Security (RLS)**: Users can only view/update their own credits
- **Atomic Operations**: Credit deduction uses database transactions to prevent race conditions
- **SECURITY DEFINER Functions**: Database functions bypass RLS for internal operations while maintaining security

## Setup Instructions

1. **Run the SQL migration:**
   ```sql
   -- Execute supabase_user_credits_table.sql in Supabase SQL Editor
   ```

2. **Verify trigger creation:**
   - Check that `on_auth_user_created` trigger exists on `auth.users`
   - New users should automatically get 10 credits

3. **Test credit system:**
   - Sign up a new user
   - Verify they have 10 credits
   - Run an agent and verify credits are deducted
   - Check that insufficient credits error appears when balance is too low

## Future Enhancements

- Credit purchase/payment integration
- Credit history/transaction log
- Credit expiration dates
- Promotional credit codes
- Admin credit management interface

