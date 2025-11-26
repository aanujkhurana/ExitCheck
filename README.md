
# Exit Report Generator - Quick Start

Contents
- frontend/ReactNative - minimal React Native app
- backend/express - minimal Node + Express API with MongoDB + S3 + PDF export
- pdf/template.html - HTML template for PDF generation

Quick goals
1. Capture property, rooms, photos, notes and timestamps
2. Generate a clean PDF report
3. Allow emailing the PDF to the agent
4. Simple paywall for PDF export

Local dev assumptions
- Node 18+
- npm or yarn
- MongoDB Atlas URI
- AWS S3 bucket for images (or use local filesystem for testing)
- Stripe for payments (optional at start)

Setup - Backend
1. cd backend
2. cp .env.example .env and fill values
3. npm install
4. npm run dev

Setup - Frontend
1. cd frontend
2. npm install
3. Configure the API_URL in config.js
4. npx expo start (this scaffold uses Expo for speed)

API summary
- POST /api/reports - create report metadata
- GET /api/reports/:id - fetch report
- POST /api/reports/:id/photos - upload photo (returns S3 URL)
- POST /api/reports/:id/generate - generate PDF and return URL
- POST /api/reports/:id/email - email the PDF to agent

Export policy
- Free tier allows basic editing and 3 photo uploads
- Paid unlocks generate endpoint

Notes
- The scaffold contains example Mongoose schemas and an HTML PDF template compatible with Puppeteer or html-pdf.
- This is meant to be a launchable MVP. Tweak styles, privacy, validation, and payment integration before production.
