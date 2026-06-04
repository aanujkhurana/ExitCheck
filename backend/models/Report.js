const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  condition: { type: String, enum: ['clean', 'fair', 'poor', 'damaged', ''] },
  photos: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true, trim: true },
  moveIn: { type: String, required: true },
  moveOut: { type: String, required: true },
  agentEmail: { type: String, trim: true, lowercase: true },
  rooms: { type: [RoomSchema], default: [] },
  paid: { type: Boolean, default: false },
  stripeSessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
