const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
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
app.use(compression());
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/reports/stripe-webhook', express.raw({ type: 'application/json' }), reportsRouter.stripeWebhook);

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/', limiter);
app.use('/uploads', express.static('public/uploads'));

app.use('/api/reports', reportsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

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

let server;
if (process.env.NODE_ENV !== 'test') {
  const mongoose = require('mongoose');
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('mongo connected'))
    .catch((e) => console.error(e));
  server = app.listen(PORT, () => console.log('listening', PORT));
}

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) server.close();
  if (process.env.NODE_ENV !== 'test') {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
