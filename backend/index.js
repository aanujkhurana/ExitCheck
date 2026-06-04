const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

app.use('/api/reports', require('./routes/reports'));

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
