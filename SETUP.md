# Setup Guide

## Prerequisites

1. Node.js (version 18 or higher)
2. A Supabase account and project

## Database Setup

### Required Tables

Your Supabase database should have the following tables:

#### `comments`
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'approved', 'rejected')),
  parent_comment_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);
```

#### `newsletter_subscriptions`
```sql
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ NULL,
  source TEXT DEFAULT 'website'
);
```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is configured with the Node.js adapter for deployment. Build the application:

```bash
npm run build
```

The built application will be in the `dist/` directory and can be deployed to any Node.js hosting platform.

## Features

- ✅ Multi-language support (French, English, Spanish)
- ✅ Dynamic magazine/blog system
- ✅ Comment system with moderation
- ✅ Newsletter subscription
- ✅ SEO-friendly URLs
- ✅ Responsive design