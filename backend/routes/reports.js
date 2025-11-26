
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/Report');
const upload = multer({ dest: '/tmp/uploads' });
const { uploadToS3, generatePdf, sendEmailWithAttachment } = require('../utils/helpers');

// Create report
router.post('/', async (req,res)=>{
  const r = new Report(req.body);
  await r.save();
  res.json(r);
});

// Add room
router.post('/:id/rooms', async (req,res)=>{
  const report = await Report.findById(req.params.id);
  report.rooms.push(req.body);
  await report.save();
  res.json(report);
});

// Upload photo
router.post('/:id/photos', upload.single('photo'), async (req,res)=>{
  // simple example: upload to s3 and return url
  const filePath = req.file.path;
  const key = `photos/${Date.now()}-${req.file.originalname}`;
  const url = await uploadToS3(filePath, key);
  res.json({ url });
});

// Get report
router.get('/:id', async (req,res)=>{
  const report = await Report.findById(req.params.id);
  res.json(report);
});

// Generate PDF
router.post('/:id/generate', async (req,res)=>{
  const report = await Report.findById(req.params.id);
  const pdfUrl = await generatePdf(report);
  res.json({ url: pdfUrl });
});

// Email PDF
router.post('/:id/email', async (req,res)=>{
  const report = await Report.findById(req.params.id);
  const { to } = req.body;
  const pdfUrl = await generatePdf(report);
  await sendEmailWithAttachment(to, pdfUrl);
  res.json({ ok:true });
});

module.exports = router;
