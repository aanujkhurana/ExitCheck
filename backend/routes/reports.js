const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/Report');
const upload = multer({ dest: '/tmp/uploads' });
const { saveFile, generatePdf, sendEmailWithAttachment } = require('../utils/helpers');

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

// Email PDF
router.post('/:id/email', async (req, res) => {
  const report = await Report.findById(req.params.id);
  const { to } = req.body;
  const pdfUrl = await generatePdf(report);
  await sendEmailWithAttachment(to, pdfUrl);
  res.json({ ok: true });
});

module.exports = router;
