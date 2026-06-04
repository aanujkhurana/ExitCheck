# ExitCheck — Agent Guide

## Project Overview

ExitCheck is a **React Native (Expo) + Express** mobile app for generating rental property exit condition reports with PDF export. Users inspect rooms, take photos, record notes, and email a PDF to the agent.

- **Frontend**: `frontend/` — Expo/React Native (4 screens: Onboarding, RoomsList, RoomDetail, Summary)
- **Backend**: `backend/` — Express + Mongoose + Puppeteer + Nodemailer + S3
- **State**: Phase 1 complete (Jun 2026). Backend deps installed, local storage fallback, custom rooms, validation, error handling all implemented.

## Current State

### Implemented
- Backend: Full CRUD API (6 routes), Mongoose schema, Puppeteer PDF generation, S3/local storage upload, Nodemailer email
- Frontend: Navigation stack, camera integration via `expo-image-picker`, forms for all screens, PDF generation + email buttons
- **Custom room** — Text input + "Add custom room" button with duplicate/empty validation
- **Form validation** — Onboarding (required fields, date format YYYY-MM-DD, email format), RoomDetail (condition required), RoomsList (custom room name)
- **Error handling** — try/catch on all API calls, user-facing Alert messages, loading states with disabled buttons
- **Local storage fallback** — `STORAGE_TYPE=local` env var; saves files to `backend/public/uploads/` when S3 not configured
- **Backend deps installed**

### Missing / Known Issues
- **Paywall** — README mentions Stripe/free tier (3 photos), but no enforcement exists
- **Photo upload limit** — no frontend or backend limit on photo count
- **No tests** — zero test infrastructure
- **No linting/formatting** — no ESLint, Prettier, or equivalent

## Suggested Next Steps

### Phase 1 — Local Dev Setup & Polish ✅
1. ✅ `cd backend && npm install` to install backend deps
2. ✅ Copy `.env.example` to `.env` and configure local MongoDB + S3 credentials (or add local filesystem fallback for testing)
3. ✅ Implement the "Add custom room" button in `RoomsList.js`
4. ✅ Add basic validation to forms (required fields, email format, etc.)
5. ✅ Add error handling UI (alerts, loading states, retry)

### Phase 2 — Quality ✅
6. ✅ Set up ESLint + Prettier for both frontend and backend
7. ✅ Add backend tests (Jest + Supertest) for all 6 API routes
8. ✅ Add frontend tests (Jest + validation/logic tests)
9. ✅ Add a GitHub CI workflow for tests + lint

### Phase 3 — Production Features
10. Implement photo upload limit enforcement (free tier: 3 photos)
11. Integrate Stripe for payment/subscription
12. Add local filesystem upload option for dev/testing (configurable via env)
13. Add proper loading indicators and toast notifications

### Phase 4 — Release
14. Write comprehensive README with screenshots and usage guide
15. Configure Expo build (EAS) for iOS/Android
16. Deploy backend (Render, Railway, or EC2)
17. Set up monitoring and error tracking (Sentry)

## Conventions

- Keep backend logic in `routes/` (thin routes) and `utils/` (helpers)
- Keep frontend screens in `src/screens/` — one file per screen
- Avoid comments in code unless explaining non-obvious logic
- Match existing code style (no TypeScript yet, plain JS with React hooks)

## Workflow

- Commit and push after every major step
- Commit message format: `<action>: <brief description>` (e.g. `install: backend dependencies`)
