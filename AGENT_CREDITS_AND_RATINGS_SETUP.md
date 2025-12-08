# Agent Credits and Ratings Setup Guide

This guide explains the new features added to the agent system: credits, ratings, and usage tracking.

## Database Changes

### 1. Agents Table Updates

Run `supabase_agents_table_updates.sql` to add:
- `credits` (INTEGER) - Number of credits required to use this agent (default: 1)
- `use_count` (INTEGER) - Total number of times this agent has been used (default: 0)
- `rating_count` (INTEGER) - Total number of users who have rated this agent (default: 0)
- `rating_average` (DECIMAL(3,2)) - Average rating from 1-5 stars (default: 0.00)

### 2. Agent Ratings Table

Run `supabase_agent_ratings_table.sql` to create:
- `agent_ratings` table to store individual user ratings
- Each user can rate each agent once (enforced by UNIQUE constraint)
- Ratings are 1-5 stars
- Automatic triggers update agent statistics when ratings change

### 3. Usage Tracking

Run `supabase_update_agent_use_count.sql` to:
- Automatically increment `use_count` when an agent result is saved
- Uses database triggers for automatic tracking

## Migration Steps

Execute the SQL files in this order:

1. **`supabase_agents_table_updates.sql`** - Adds new columns to agents table
2. **`supabase_agent_ratings_table.sql`** - Creates ratings table and triggers
3. **`supabase_update_agent_use_count.sql`** - Creates trigger for usage tracking
4. **`supabase_populate_agents.sql`** - (Re-run if needed) Updates existing agents with credits

## API Endpoints

### Rate an Agent

**POST** `/api/agents/rate`

Request body:
```json
{
  "agentId": "uuid-of-agent",
  "rating": 5
}
```

Response:
```json
{
  "success": true,
  "rating": { ... },
  "agentStats": {
    "rating_count": 10,
    "rating_average": 4.5
  }
}
```

### Get User's Rating

**GET** `/api/agents/rate?agent_id=uuid`

Response:
```json
{
  "success": true,
  "rating": { "rating": 5, ... } // or null if not rated
}
```

## Features

### Credits System
- Each agent has a `credits` field indicating how many credits it costs to use
- Default is 1 credit for all agents
- Can be updated in the database for different pricing tiers

### Rating System
- Users can rate agents from 1-5 stars
- Each user can only rate each agent once (can update their rating)
- Ratings are aggregated automatically:
  - `rating_count`: Total number of users who rated
  - `rating_average`: Average of all ratings (1-5)

### Usage Tracking
- `use_count` automatically increments when an agent is used
- Tracked via database trigger when `agent_results` are inserted
- No code changes needed - works automatically

## Database Schema

### Agents Table (Updated)
```sql
credits INTEGER DEFAULT 1 NOT NULL
use_count INTEGER DEFAULT 0 NOT NULL
rating_count INTEGER DEFAULT 0 NOT NULL
rating_average DECIMAL(3, 2) DEFAULT 0.00 NOT NULL
```

### Agent Ratings Table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
agent_id UUID REFERENCES agents(id)
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
created_at TIMESTAMP
updated_at TIMESTAMP
UNIQUE(user_id, agent_id)
```

## RLS Policies

### Agent Ratings
- **Public Read**: Anyone can view all ratings (for displaying on agent pages)
- **User Write**: Users can only create/update/delete their own ratings

## Usage Examples

### Check Agent Credits
```sql
SELECT slug, title, credits FROM agents WHERE slug = 'on-page-seo-audit';
```

### View Agent Statistics
```sql
SELECT 
  slug,
  title,
  credits,
  use_count,
  rating_count,
  rating_average
FROM agents
WHERE is_active = true;
```

### Get All Ratings for an Agent
```sql
SELECT 
  rating,
  COUNT(*) as count
FROM agent_ratings
WHERE agent_id = 'uuid'
GROUP BY rating
ORDER BY rating DESC;
```

## Next Steps

1. **Frontend Components**: Create rating UI components (star rating)
2. **Credits Display**: Show credits required on agent cards
3. **Usage Stats**: Display use_count and rating stats on agent pages
4. **Credits Management**: Implement user credits system (separate from this)

## Notes

- All agents are set to 1 credit by default
- Use count increments automatically via database trigger
- Rating statistics update automatically via database trigger
- Users can update their rating (upsert behavior)

