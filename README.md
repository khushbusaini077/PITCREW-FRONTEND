# PITCREW: frontend

Next.js 15 (App Router) · TypeScript strict · Tailwind 4 · TanStack Query · React Leaflet + OpenStreetMap · Recharts.
Built to CONSTITUTION.md v1.0.0 section 10. Demo data is synthetic and comes from the backend seed.

## Run locally
```bash
cp .env.example .env.local      # set NEXT_PUBLIC_API_BASE_URL to the deployed HTTPS backend
npm install
npm run dev
```
Build / checks: `npm run build` · `npm run typecheck` · `npm run lint`.
If `NEXT_PUBLIC_API_BASE_URL` is missing the app shows a configuration error and never falls back to a default URL.

## Environment variables (public only)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://<service>.onrender.com`, no trailing slash, no `/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | optional, enables Realtime-triggered refetch |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional, read-only anon key |

## Vercel
1. Import the repo, set **Root Directory = `frontend`**, framework Next.js.
2. Add the env vars above for **Production and Preview**.
3. Deploy. Changing env vars needs a redeploy.
4. Backend `ALLOWED_ORIGINS` must contain the Vercel URL (previews are covered by `ALLOWED_ORIGIN_REGEX`).

## API types: ACTION NEEDED
`contracts/openapi.yaml` was not available when this was built, so `src/lib/types/api.d.ts` is a **temporary stand-in copied from Constitution sections 5 and 8**.
Replace it with `npm run gen:types` (reads `../contracts/openapi.yaml`). Only `src/lib/types/models.ts` imports from it; if generated schema names differ (for example `POI` vs `Poi`), fix the aliases there.

## Not defined in the Constitution (isolated, not invented)
- Exact JSON shape of `GET /v1/config`. `configNumber()` in `features/shared/hooks.ts` reads `MAX_PHOTO_MB` and `MAX_CREWS` from a flat object or one nested under `constants`/`config`, and falls back to 5 and 3 (the values the spec states) if absent.
- The dashboard requests up to 500 queue items so the priority queue is not limited by a server-side default page size.

## Structure
`src/app` routes (`/`, `/report`, `/dashboard`, `/crew/[crewId]`) · `src/components/{ui,map,report,dashboard,crew}` · `src/features/{shared,report,dashboard,crew}` (query hooks, keys, mutations) · `src/lib/api/client.ts` (the only `fetch`) · `src/lib/geo.ts` (the only `{lat,lng}` ↔ `[lat,lng]` conversion).

## Demo path
Dashboard → "Why this rank?" → submit on `/report` → 2/3 crews + FCFS toggle → comparison panel → crew view "Mark done".
