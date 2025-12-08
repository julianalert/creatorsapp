# Agent Migration Guide

This guide explains how to migrate from static agent data to Supabase-based agent management.

## Overview

The agent system has been migrated from static TypeScript files to a Supabase database. This allows for:
- Dynamic agent management
- Easy addition/removal of agents
- Better scalability
- Agent results linked to database records

## Database Setup

### Step 1: Create the Agents Table

Run the SQL in `supabase_agents_table.sql` in your Supabase SQL Editor:

```sql
-- This creates the agents table with all necessary fields
-- Includes RLS policies for public read access
```

### Step 2: Populate Agents Table

Run the SQL in `supabase_populate_agents.sql` to insert all existing agents:

```sql
-- This inserts all 9 existing agents into the database
-- Note: Update thumbnail_url and hero_image_url with actual image URLs if needed
```

### Step 3: Update Agent Results Table

Run the SQL in `supabase_agent_results_table_updated.sql` to add the `agent_id` foreign key:

```sql
-- This adds agent_id column and migrates existing data
-- Keeps agent_slug for backward compatibility during migration
```

## Migration Steps

### 1. Run Database Migrations

Execute the SQL files in this order:
1. `supabase_agents_table.sql` - Creates the agents table
2. `supabase_populate_agents.sql` - Populates with existing agents
3. `supabase_agent_results_table_updated.sql` - Updates agent_results table

### 2. Verify Data

Check that all agents are in the database:
```sql
SELECT slug, title, category, is_active FROM agents;
```

### 3. Test the Application

1. Visit the home page - should show all agents from database
2. Visit an agent detail page - should load agent data from database
3. Run an agent - should save with agent_id
4. Check results page - should show results with agent names

## Database Schema

### Agents Table

- `id` (UUID, Primary Key)
- `slug` (TEXT, Unique) - URL-friendly identifier
- `title` (TEXT) - Display name
- `summary` (TEXT) - Short description
- `category` (TEXT) - Category for grouping
- `use_case` (TEXT) - When to use this agent
- `persona` (TEXT) - Target users
- `thumbnail_url` (TEXT) - Thumbnail image URL
- `hero_image_url` (TEXT) - Hero image URL
- `stats` (JSONB) - Statistics array
- `sequence` (JSONB) - Process steps
- `samples` (JSONB) - Sample outputs
- `insights` (JSONB) - Insights array
- `tags` (TEXT[]) - Tags array
- `is_active` (BOOLEAN) - Whether agent is active
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Agent Results Table (Updated)

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `agent_id` (UUID, Foreign Key to agents) - **NEW**
- `agent_slug` (TEXT) - Kept for backward compatibility
- `input_params` (JSONB)
- `result_data` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## RLS Policies

### Agents Table
- **Public Read**: Anyone can view active agents
- **Authenticated Read**: Authenticated users can view all agents (including inactive)

### Agent Results Table
- Users can only view/insert/update/delete their own results
- Results are linked to agents via `agent_id`

## API Changes

### New Endpoints

- `GET /api/agents/list` - Fetch all agents
  - Query params: `category`, `slug`, `include_inactive`

### Updated Endpoints

- `POST /api/agents/conversion-rate-optimizer` - Now saves `agent_id`
- `POST /api/agents/seo-audit` - Now saves `agent_id`
- `GET /api/agents/results` - Now includes agent data via join

## Code Changes

### Pages Updated

1. **`app/page.tsx`** - Now fetches agents from Supabase
2. **`app/agent/[slug]/page.tsx`** - Now fetches agent from Supabase
3. **`app/(default)/agents/results/page.tsx`** - Now uses agent data from API

### Components

- All components now work with database-fetched agents
- Agent data structure remains compatible with existing components

## Adding New Agents

To add a new agent:

1. Insert into the `agents` table:
```sql
INSERT INTO agents (slug, title, summary, category, use_case, persona, ...)
VALUES ('new-agent-slug', 'New Agent Title', ...);
```

2. Create the API route if needed: `app/api/agents/[agent-slug]/route.ts`

3. Update the agent interface component if needed

## Backward Compatibility

- `agent_slug` is kept in `agent_results` for backward compatibility
- Old results without `agent_id` will still work
- Migration script updates existing results with `agent_id`

## Troubleshooting

### Agents not showing
- Check `is_active = true` in database
- Verify RLS policies are correct
- Check browser console for errors

### Results not saving
- Verify agent exists in database
- Check user is authenticated
- Verify RLS policies allow insert

### Image URLs not working
- Update `thumbnail_url` and `hero_image_url` in database
- Ensure images are accessible via the URLs
- Consider using Next.js Image component with proper src handling

## Next Steps

1. After migration is stable, you can:
   - Remove `agent_slug` from `agent_results` (make `agent_id` NOT NULL)
   - Remove static template-data.ts file (optional, keep for reference)
   - Add admin interface for managing agents

2. Consider adding:
   - Agent versioning
   - Agent analytics
   - Agent usage tracking

