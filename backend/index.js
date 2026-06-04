const express = require('express');
const cors = require('cors');
require('dotenv').config();

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
});

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');

app.use('/api/auth', authRouter);

app.post('/api/reports/stripe-webhook', express.raw({ type: 'application/json' }), reportsRouter.stripeWebhook);

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static('public/uploads'));

app.use('/api/reports', reportsRouter);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || (err.message?.includes('Only image') ? 400 : 500);
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';
  if (status === 500) console.error(err);
  res.status(status).json({ message });
});

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
