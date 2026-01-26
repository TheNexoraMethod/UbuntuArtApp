# Ubuntu Art Village Backend (Vercel)

This is an API-only backend intended to be deployed to Vercel.

## Routes
- GET `/api/ping`
- GET `/api/rooms` (returns rooms with embedded `images`)
- GET `/api/gallery` (returns `{ images: [...] }`)
- GET `/api/events`

## Local run
```bash
cd apps/backend
npm install
cp .env.example .env
# fill env vars
npm run dev
```
