const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/Report');
const upload = multer({ dest: '/tmp/uploads' });
const { saveFile, generatePdf, sendEmailWithAttachment } = require('../utils/helpers');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// Create report
router.post('/', async (req, res) => {
  const r = new Report(req.body);
  await r.save();
  res.json(r);
});

// Add room
router.post('/:id/rooms', async (req, res) => {
  const report = await Report.findById(req.params.id);
  report.rooms.push(req.body);
  await report.save();
  res.json(report);
});

// Upload photo
const PHOTO_LIMIT_FREE = parseInt(process.env.PHOTO_LIMIT_FREE || '3', 10);

router.post('/:id/photos', upload.single('photo'), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  const totalPhotos = report.rooms.reduce((sum, r) => sum + (r.photos ? r.photos.length : 0), 0);
  if (!report.paid && totalPhotos >= PHOTO_LIMIT_FREE) {
    return res.status(403).json({
      message: `Free tier limited to ${PHOTO_LIMIT_FREE} photos. Please upgrade to unlock unlimited uploads.`,
    });
  }

  const filePath = req.file.path;
  const key = `photos/${Date.now()}-${req.file.originalname}`;
  const url = await saveFile(filePath, key);
  res.json({ url });
});

// Get report
router.get('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id);
  res.json(report);
});

// Generate PDF
router.post('/:id/generate', async (req, res) => {
  const report = await Report.findById(req.params.id);
  const pdfUrl = await generatePdf(report);
  res.json({ url: pdfUrl });
});

// Create Stripe Checkout Session
router.post('/:id/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  if (report.paid) return res.status(400).json({ message: 'Already paid' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    metadata: { reportId: report._id.toString() },
    success_url: `${process.env.FRONTEND_URL}/?payment=success&reportId=${report._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/?payment=cancelled&reportId=${report._id}`,
  });

  report.stripeSessionId = session.id;
  await report.save();

  res.json({ url: session.url });
});

// Stripe Webhook handler (exported separately for raw body handling)
router.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });

  let event;
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } else {
    event = req.body;
  }

  if (event.type === 'checkout.session.completed') {
    const reportId = event.data.object.metadata.reportId;
    await Report.findByIdAndUpdate(reportId, { paid: true });
  }

  res.json({ received: true });
};

// Email PDF
router.post('/:id/email', async (req, res) => {
  const report = await Report.findById(req.params.id);
  const { to } = req.body;
  const pdfUrl = await generatePdf(report);
  await sendEmailWithAttachment(to, pdfUrl);
  res.json({ ok: true });
});

module.exports = router;
