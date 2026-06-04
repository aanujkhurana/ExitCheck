# ExitCheck — Agent Guide

## Project Overview

ExitCheck is a **React Native (Expo) + Express** mobile app for generating rental property exit condition reports with PDF export. Users inspect rooms, take photos, record notes, and email a PDF to the agent.

- **Frontend**: `frontend/` — Expo/React Native (4 screens: Onboarding, RoomsList, RoomDetail, Summary)
- **Backend**: `backend/` — Express + Mongoose + Puppeteer + Nodemailer + S3
- **State**: Single-commit scaffold, last modified Nov 2025. Backend deps not installed. No tests.

## Current State

### Implemented
- Backend: Full CRUD API (6 routes), Mongoose schema, Puppeteer PDF generation, S3 upload, Nodemailer email
- Frontend: Navigation stack, camera integration via `expo-image-picker`, forms for all screens, PDF generation + email buttons

### Missing / Known Issues
- **Add custom room** — `RoomsList.js:21` has a `{/* quick hack: implement later */}` placeholder; button exists but is non-functional
- **Paywall** — README mentions Stripe/free tier (3 photos), but no enforcement exists
- **Photo upload limit** — no frontend or backend limit on photo count
- **Validation** — no form validation on any screen
- **Error handling** — minimal error UI in the app
- **S3-only uploads** — no local filesystem fallback for testing
- **No tests** — zero test infrastructure
- **No linting/formatting** — no ESLint, Prettier, or equivalent
- **Backend deps not installed** — `backend/node_modules/` is empty

## Suggested Next Steps

### Phase 1 — Local Dev Setup & Polish
1. `cd backend && npm install` to install backend deps
2. Copy `.env.example` to `.env` and configure local MongoDB + S3 credentials (or add local filesystem fallback for testing)
3. Implement the "Add custom room" button in `RoomsList.js`
4. Add basic validation to forms (required fields, email format, etc.)
5. Add error handling UI (alerts, loading states, retry)

### Phase 2 — Quality
6. Set up ESLint + Prettier for both frontend and backend
7. Add backend tests (Jest + Supertest) for all 6 API routes
8. Add frontend tests (Jest + React Native Testing Library)
9. Add a GitHub CI workflow for tests + lint

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
