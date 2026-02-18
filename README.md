# 📌 Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Live URL
https://smart-bookmark-app-pi-opal.vercel.app

## GitHub
https://github.com/RenukaPatil3122/smart-bookmark-app

---

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Google OAuth, PostgreSQL, Row Level Security)
- **Tailwind CSS**
- **Deployed on Vercel**

---

## Features
- Google OAuth login (no email/password)
- Private bookmarks per user
- Add and delete bookmarks
- Instant UI updates (optimistic updates)
- Real-time cross-tab sync (BroadcastChannel)

---

## Problems I Faced & How I Solved Them

### 1. Bookmarks not appearing in real-time after adding
**Problem:** When adding a bookmark, it only appeared after a page refresh. The app had two separate components — `AddBookmark` and `BookmarkList` — with no shared state. The insert happened in one component but the list lived in another, so the UI never knew to update.

**Solution:** Merged both into a single `BookmarkList` component and implemented optimistic updates — the bookmark is added to local React state immediately on button click, before the database even responds. If the insert fails, it rolls back automatically.

### 2. Duplicate bookmarks appearing after add
**Problem:** After fixing the real-time issue, bookmarks were appearing twice every time one was added. Supabase realtime was firing the INSERT event, but the optimistic update had already added it to the UI — resulting in two entries.

**Solution:** Replaced Supabase realtime INSERT listener with the browser's built-in `BroadcastChannel` API. Now:
- Same tab: optimistic update handles the UI instantly, no realtime involved
- Other tabs: BroadcastChannel broadcasts the new bookmark so other open tabs update in real-time

This completely eliminated the duplicate issue.

### 3. User privacy (Row Level Security)
**Problem:** Needed to ensure users can only see and modify their own bookmarks.

**Solution:** Enabled Row Level Security (RLS) on the bookmarks table in Supabase with three policies:
- SELECT: only rows where `user_id = auth.uid()`
- INSERT: only allowed if `user_id = auth.uid()`
- DELETE: only allowed if `user_id = auth.uid()`

### 4. Route protection
**Problem:** Needed to prevent unauthenticated users from accessing the dashboard.

**Solution:** Used Next.js middleware (`middleware.ts`) to check for a valid Supabase session on every request to `/dashboard`. If no session exists, it redirects to the home page.

---

## How to Run Locally

```bash
git clone https://github.com/RenukaPatil3122/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

---

## AI Tools Used
I used Claude (Anthropic) to help debug the real-time duplicate bookmark issue and understand optimistic UI patterns.
