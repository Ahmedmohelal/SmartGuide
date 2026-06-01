# SmartGuide Admin Dashboard

Separate React app for platform administrators — runs **next to** `frontend/`, not inside it.

## Structure

```
SmartGuideEgypt/
├── frontend/          ← public site (port 5174)
├── admin-dashboard/   ← this app (port 5175)
└── Backend/
```

## Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5175

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | API root, e.g. `https://smartguide.runasp.net/api` |
| `VITE_PUBLIC_SITE_URL` | Main site URL for "Open main site" button |

## Admin login

Use an account with role **Admin** (e.g. seeded: see Backend `IdentitySeeder`).

## Features

- Light / dark theme
- Dashboard with charts (Recharts) + date filter
- Pending guides: approve / reject
- Users, tours, bookings, audit logs
