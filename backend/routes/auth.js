const express = require('express');
const router = express.Router();

router.post('/pin', (req, res) => {
  const { pin } = req.body;
  if (!process.env.APP_PIN) {
    return res.status(503).json({ message: 'PIN not configured on server' });
  }
  if (pin !== process.env.APP_PIN) {
    return res.status(401).json({ message: 'Invalid PIN' });
  }
  res.json({ ok: true });
});

module.exports = router;
