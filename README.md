# ExitCheck — Rental Exit Condition Report Generator

A mobile-first app for generating rental property exit condition reports with photo evidence and PDF export. Built with **React Native (Expo)** and **Node.js (Express + MongoDB)**.

## Features

- **Property onboarding** — capture address, move-in/out dates, agent email
- **Room-by-room inspection** — add standard or custom rooms, take photos, record condition and notes
- **Photo upload** — camera integration with free tier limit (3 photos)
- **PDF generation** — auto-generated exit condition report via Puppeteer
- **Email delivery** — send the PDF directly to the agent via Nodemailer
- **Stripe payments** — unlock unlimited photo uploads (optional)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native 0.71 / Expo ~48.0 |
| Navigation | @react-navigation/stack |
| Backend | Node.js, Express 4 |
| Database | MongoDB via Mongoose 7 |
| PDF | Puppeteer |
| Email | Nodemailer |
| Payments | Stripe |
| File storage | S3 (AWS SDK v2) or local filesystem |
| Lint | ESLint 8 + Prettier |
| CI | GitHub Actions |

## Project Structure

```
ExitCheck/
├── backend/
│   ├── index.js          # Express server entry
│   ├── models/Report.js  # Mongoose schema
│   ├── routes/reports.js # API routes (CRUD + PDF + email + Stripe)
│   ├── utils/helpers.js  # File storage, PDF gen, email helpers
│   ├── pdf/template.html # Puppeteer PDF template
│   ├── public/uploads/   # Local file storage
│   ├── tests/            # Jest + Supertest
│   └── .env.example
├── frontend/
│   ├── App.js            # Navigation stack
│   ├── src/
│   │   ├── config.js     # API base URL
│   │   └── screens/
│   │       ├── Onboarding.js   # Property/agent form
│   │       ├── RoomsList.js    # Room list + add custom
│   │       ├── RoomDetail.js   # Photos, condition, notes
│   │       └── Summary.js      # Review, pay, PDF, email
│   ├── src/__tests__/    # Jest tests
│   └── babel.config.js
├── .github/workflows/ci.yml
├── .prettierrc
└── AGENTS.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env   # edit MONGO_URI, set STORAGE_TYPE=local
npm install
npm run dev            # starts on port 4000
```

### Frontend

```bash
cd frontend
npm install
npx expo start         # opens Expo dev tools
```

The app connects to `http://localhost:4000/api` by default. Edit `frontend/src/config.js` for a different URL.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Create a new report |
| GET | `/api/reports/:id` | Fetch a report with all rooms |
| POST | `/api/reports/:id/rooms` | Add a room |
| POST | `/api/reports/:id/photos` | Upload a photo |
| POST | `/api/reports/:id/generate` | Generate PDF |
| POST | `/api/reports/:id/email` | Email PDF to agent |
| POST | `/api/reports/:id/create-checkout-session` | Create Stripe checkout |
| POST | `/api/reports/stripe-webhook` | Stripe webhook (mark paid) |

### Photo Upload Limit

Free tier allows **3 photos per report**. The backend returns `403` when exceeded. After a successful Stripe payment, the `paid` flag is set to `true` and the limit is lifted.

## Stripe Setup

1. Create a [Stripe](https://stripe.com) account
2. Copy your secret key to `STRIPE_SECRET_KEY` in `.env`
3. Create a one-time payment product in Stripe Dashboard
4. Copy the price ID to `STRIPE_PRICE_ID` in `.env`
5. (Optional) Set `STRIPE_WEBHOOK_SECRET` for webhook signature verification

## Storage Options

Set `STORAGE_TYPE` in `.env`:

- **`local`** (default) — files saved to `backend/public/uploads/`
- **`s3`** — files uploaded to S3 (requires AWS credentials)

## Running Tests

```bash
# Backend tests (Jest + Supertest + MongoDB Memory Server)
cd backend && npm test

# Frontend tests (Jest)
cd frontend && npm test
```

## Lint & Format

```bash
cd backend && npm run lint && npm run format
cd frontend && npm run lint && npm run format
```

## Deployment

### Backend (Render / Railway)

1. Set `NODE_ENV=production` and `STORAGE_TYPE=s3`
2. Set `MONGO_URI`, `AWS_*`, `EMAIL_*`, `STRIPE_*` env vars
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && node index.js`

### Frontend (Expo / EAS)

```bash
cd frontend
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Contributing

See [AGENTS.md](./AGENTS.md) for development guide and project conventions.
