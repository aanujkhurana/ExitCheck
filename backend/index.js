const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('mongo connected'))
  .catch((e) => console.error(e));

app.use('/api/reports', require('./routes/reports'));

app.listen(PORT, () => console.log('listening', PORT));
