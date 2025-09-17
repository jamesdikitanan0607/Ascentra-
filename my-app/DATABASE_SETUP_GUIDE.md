# Database Setup Guide

## Overview
This guide will help you set up all the necessary tables for your hiking mobile app in your new Supabase database.

## Prerequisites
- Access to your Supabase dashboard
- The new database credentials are already configured in your `.env` file

## Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `tppimfexrhptzdxlxcbj`
3. Navigate to the SQL Editor in the left sidebar

### Step 2: Execute SQL Files in Order
Execute the following SQL files **in this exact order**:

#### 1. Create Profiles Table
- File: `01-create-profiles-table.sql`
- Purpose: User profiles and authentication setup
- **Execute this first** - other tables depend on it

#### 2. Create Hiking Spots Table  
- File: `02-create-hiking-spots-table.sql`
- Purpose: Main hiking locations with GPS coordinates
- **Execute second** - reviews and routes depend on it

#### 3. Create Trail Routes Table
- File: `03-create-trail-routes-table.sql`
- Purpose: Specific trails within hiking spots
- **Execute third** - depends on hiking_spots table

#### 4. Create Reviews Table
- File: `04-create-reviews-table.sql`
- Purpose: User reviews for hiking spots
- **Execute fourth** - depends on profiles and hiking_spots

#### 5. Create Hike Records Table
- File: `05-create-hike-records-table.sql`
- Purpose: User's personal hiking activity records
- **Execute last** - depends on all other tables

### Step 3: Verify Setup
After executing all SQL files, verify the setup by running this query in the SQL Editor:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see these tables:
- `profiles`
- `hiking_spots`
- `trail_routes`
- `reviews`
- `hike_records`

### Step 4: Test Basic Functionality
Run this test query to ensure everything is working:

```sql
-- Test basic table relationships
SELECT 
  h.name as hiking_spot,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM hiking_spots h
LEFT JOIN reviews r ON h.hiking_spot_id = r.hiking_spot_id
GROUP BY h.hiking_spot_id, h.name
LIMIT 5;
```

## What Each File Creates

### 01-create-profiles-table.sql
- User profiles table linked to Supabase Auth
- Automatic profile creation on user signup
- User preferences and settings

### 02-create-hiking-spots-table.sql
- Main hiking locations with GPS coordinates
- PostGIS support for location queries
- Rating aggregation from reviews
- Automatic coordinate point generation

### 03-create-trail-routes-table.sql
- Specific trails within hiking spots
- GPX data support
- Difficulty ratings and trail information

### 04-create-reviews-table.sql
- User reviews and ratings
- Automatic rating calculation for hiking spots
- Photo and weather condition support

### 05-create-hike-records-table.sql
- Personal hiking activity tracking
- GPS track recording
- Performance metrics and photos

## Security Features
- Row Level Security (RLS) enabled on all tables
- Proper authentication policies
- Data isolation between users
- Public read access for hiking spots and reviews

## Next Steps
After completing the database setup:
1. Test the mobile app connection
2. Verify data operations work correctly
3. Add sample data if needed for testing

## Troubleshooting
If you encounter any errors:
1. Check that files are executed in the correct order
2. Ensure your Supabase project has the required extensions enabled
3. Verify your database credentials are correct
4. Check the Supabase logs for detailed error messages