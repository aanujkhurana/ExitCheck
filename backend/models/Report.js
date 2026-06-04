const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: String,
  notes: String,
  condition: String,
  photos: [String],
  createdAt: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema({
  address: String,
  moveIn: String,
  moveOut: String,
  agentEmail: String,
  rooms: [RoomSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
