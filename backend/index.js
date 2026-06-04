const express = require('express');
const cors = require('cors');
require('dotenv').config();

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const app = express();
app.use(cors());

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

const reportsRouter = require('./routes/reports');

app.post('/api/reports/stripe-webhook', express.raw({ type: 'application/json' }), reportsRouter.stripeWebhook);

app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

app.use('/api/reports', reportsRouter);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  const mongoose = require('mongoose');
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('mongo connected'))
    .catch((e) => console.error(e));
  app.listen(PORT, () => console.log('listening', PORT));
}

module.exports = app;
