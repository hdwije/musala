const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    gateway: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Gateway',
    },
    uid: {
      type: Number,
      required: true,
    },
    vendor: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['online', 'offline'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Device', deviceSchema);
