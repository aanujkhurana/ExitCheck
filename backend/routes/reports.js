const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Report = require('../models/Report');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files allowed'));
  },
});
const { saveBuffer, generatePdf, sendEmailWithAttachment } = require('../utils/helpers');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// Create report
router.post('/', async (req, res) => {
  const { address, moveIn, moveOut, agentEmail } = req.body;
  const r = new Report({ address, moveIn, moveOut, agentEmail });
  await r.save();
  res.status(201).json(r);
});

// Add room
router.post('/:id/rooms', async (req, res) => {
  const report = await Report.findById(req.params.id);
  const { name, notes, condition, photos } = req.body;
  report.rooms.push({ name, notes, condition, photos });
  await report.save();
  res.status(201).json(report);
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

  const ext = path.extname(req.file.originalname).toLowerCase();
  const safeName = `${Date.now()}${ext || '.jpg'}`;
  const key = `photos/${safeName}`;
  const url = await saveBuffer(req.file.buffer, key);
  res.json({ url });
});

// Get report
router.get('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id);
  res.json(report);
});

// Update report
router.put('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const { address, moveIn, moveOut, agentEmail } = req.body;
  if (address !== undefined) report.address = address;
  if (moveIn !== undefined) report.moveIn = moveIn;
  if (moveOut !== undefined) report.moveOut = moveOut;
  if (agentEmail !== undefined) report.agentEmail = agentEmail;
  await report.save();
  res.json(report);
});

// Delete report
router.delete('/:id', async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json({ ok: true });
});

// Delete room from report
router.delete('/:id/rooms/:roomId', async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { $pull: { rooms: { _id: req.params.roomId } } },
    { new: true },
  );
  if (!report) return res.status(404).json({ message: 'Report not found' });
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
