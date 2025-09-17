# Database Setup Instructions

## ✅ Issues Fixed

1. **Forum Storage SQL**: Fixed duplicate policy errors with IF NOT EXISTS checks
2. **Trail Routes RLS**: Updated policies to allow public inserts for data seeding
3. **Data Insertion**: Clarified execution methods (Node.js vs SQL Editor)

## 📋 Step-by-Step Setup

### Step 1: Fix Trail Routes Schema
**Run in Supabase SQL Editor:**
```bash
# Copy and paste the contents of fix-trail-routes-corrected.sql
```

### Step 2: Setup Forum Storage
**Run in Supabase SQL Editor:**
```bash
# Copy and paste the contents of setup-forum-storage.sql
```

### Step 3: Insert Trail Routes Data
**Run in Terminal (NOT SQL Editor):**
```bash
node insert-corrected-data.cjs
```

## ⚠️ Important Notes

- **SQL files** (.sql) → Run in **Supabase SQL Editor**
- **JavaScript files** (.cjs) → Run in **Terminal with Node.js**
- The insert-corrected-data.cjs file contains Node.js code and will fail if run in SQL Editor

## 🔍 Verification

After completing all steps, run:
```bash
node final-status-check.cjs
```

This will verify that all data has been inserted correctly.