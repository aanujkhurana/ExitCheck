# ExitCheck — Agent Guide

## Project Overview

ExitCheck is a **React Native (Expo) + Express** mobile app for generating rental property exit condition reports with PDF export. Users inspect rooms, take photos, record notes, and email a PDF to the agent.

- **Frontend**: `frontend/` — Expo/React Native (5 screens: Pin, Onboarding, RoomsList, RoomDetail, Summary)
- **Backend**: `backend/` — Express + Mongoose + Puppeteer + Nodemailer + S3
- **State**: Post initial release. All 4 original phases complete. Additional production hardening in progress.

## Current State

### Implemented
- Backend: Full CRUD API (9 routes + auth), Mongoose schema, Puppeteer PDF generation, S3/local storage upload, Nodemailer email
- Frontend: Navigation stack, camera integration via `expo-image-picker`, forms for all screens, PDF generation + email buttons
- **Custom room** — Text input + "Add custom room" button with duplicate/empty validation
- **Form validation** — Onboarding (required fields, date format YYYY-MM-DD, email format), RoomDetail (condition required), RoomsList (custom room name)
- **Error handling** — try/catch on all API calls, user-facing Alert messages, loading states with disabled buttons
- **Local storage fallback** — `STORAGE_TYPE=local` env var; saves files to `backend/public/uploads/` when S3 not configured
- **Photo upload limit** — 3 photo free tier with Stripe unlock
- **Stripe payments** — Checkout session + webhook for unlimited photos
- **Toast notifications** — `react-native-toast-message` for success feedback
- **Sentry** — Error tracking on both frontend and backend
- **ESLint + Prettier** — Configured for both projects
- **CI** — GitHub Actions workflow (lint + test)
- **EAS** — Expo build config for iOS/Android
- **Quick wins** — memoryStorage, field whitelisting, body limit, global error handler, `unhandledRejection` handler, RefreshControl, splash image, `API_URL` via `expo-constants`, Sentry DSN runtime-configurable, file validation
- **Report edit/delete** — `PUT /:id`, `DELETE /:id`, `DELETE /:id/rooms/:roomId` + delete button on Summary
- **Data export** — `GET /:id/export` returns JSON with download header + "Export JSON" button
- **Email lookup** — `GET /?email=agent@...` returns all reports for that email
- **Empty state** — `ListEmptyComponent` on RoomsList
- **PIN auth** — `POST /api/auth/pin` endpoint + PinScreen, PIN set via `APP_PIN` env var
- **User auth** — `POST /api/auth/register`, `POST /api/auth/login` + LoginScreen/RegisterScreen, reports scoped to user
- **Rate limiting** — `express-rate-limit` (100 req/15min general, 10 req/15min auth)
- **Helmet** — Security headers (XSS, clickjacking, etc.)
- **Health check** — `GET /api/health`
- **Mongoose schema validation** — required fields on Report/Room, enum on condition
- **Compression** — gzip/brotli middleware
- **Graceful shutdown** — SIGTERM/SIGINT handler for clean MongoDB disconnect
- **Stripe webhook** — idempotency (in-memory dedup) + error handling

### Missing / Known Issues
- **Dependency vulnerabilities** — `npm audit` shows 2 issues (moderate, via aws-sdk transitive deps)
- **No TypeScript** — plain JS throughout
- **No end-to-end tests** — only backend API + frontend logic tests
- **No offline support** — requires network for all operations

## Conventions

- Keep backend logic in `routes/` (thin routes) and `utils/` (helpers)
- Keep frontend screens in `src/screens/` — one file per screen
- Avoid comments in code unless explaining non-obvious logic
- Match existing code style (no TypeScript yet, plain JS with React hooks)

## Workflow

- Commit and push after every major step
- Commit message format: `<action>: <brief description>` (e.g. `install: backend dependencies`)
