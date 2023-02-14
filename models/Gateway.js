const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    ipv4: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Gateway', gatewaySchema);
