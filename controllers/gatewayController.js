const { isIPV4Address } = require('ip-address-validator');
const asyncHandler = require('express-async-handler');

const Gateway = require('../models/Gateway');
const Device = require('../models/Device');

/**
 * @desc Store new gateway
 * @route POST /gateways
 */
const createGateway = asyncHandler(async (req, res) => {
  const { name, ipv4 } = req.body;

  // Validate request body
  if (!name || !ipv4) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate ipv4
  if (!isIPV4Address(ipv4)) {
    return res.status(400).json({ message: 'IPv4 address is not valid' });
  }

  // Check for duplicate ipv4
  const duplicate = await Gateway.findOne({ ipv4 }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ message: 'Duplicate IPv4 address' });
  }

  // Create serial number using timestamp
  const serialNumber = Date.now().toString();

  // Create and store a new gateway
  const gateway = await Gateway.create({ serialNumber, name, ipv4 });

  if (gateway) {
    return res.status(201).json(gateway);
  } else {
    return res.status(400).json({ message: 'Invalid gateway data received' });
  }
});

/**
 * @desc Update a gateway
 * @route PATCH /gateways
 */
const updateGateway = asyncHandler(async (req, res) => {
  const { _id, name, ipv4 } = req.body;

  // Validate request body
  if (!_id || !name || !ipv4) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check duplicates
  const duplicate = await Gateway.findOne({
    ipv4: { $eq: ipv4 },
    _id: { $ne: _id },
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(400).json({ message: 'Gateway is already exists' });
  }

  // Confirm gateway exists to update
  const gateway = await Gateway.findById(_id).exec();

  if (!gateway) {
    return res.status(400).json({ message: 'Gateway not found' });
  }

  gateway.ipv4 = ipv4;
  gateway.name = name;

  const updatedOne = await gateway.save();

  res.json(updatedOne);
});

/**
 * @desc Get all gateways
 * @route GET /gateways
 */
const getAllGateways = asyncHandler(async (req, res) => {
  // Get all gateways from MongoDB
  const gateways = await Gateway.find().lean().exec();

  if (!gateways?.length) {
    return res.json([]);
  }

  // Get gateway devices
  const gatewaysWithDevices = await Promise.all(
    gateways.map(async (gateway) => {
      const devices = await Device.find({ gateway: gateway._id }).lean().exec();

      return { ...gateway, devices };
    }),
  );

  res.json(gatewaysWithDevices);
});

/**
 * @desc Get gateway
 * @route GET /gateways/:id
 */
const getGateway = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get gateway from MongoDB
  const gateway = await Gateway.findById(id).lean().exec();

  if (!gateway) {
    return res.status(400).json({ message: 'Gateway not found' });
  }

  const devices = await Device.find({ gateway: id }).lean().exec();
  const gatewayWithDevices = { ...gateway, devices };

  res.json(gatewayWithDevices);
});

/**
 * @desc Delete gateway
 * @route DELETE /gateways
 * @access private
 */
const deleteGateway = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: 'Gateway id is required' });
  }

  const device = await Device.findOne({ gateway: _id }).lean().exec();

  if (device) {
    return res.status(400).json({ message: 'Gateway has assigned devices' });
  }

  const gateway = await Gateway.findById(_id).exec();

  if (!gateway) {
    return res.status(400).json({ message: 'Gateway not found' });
  }

  const result = await gateway.deleteOne();
  const reply = `Gateway ${result.ipv4} with serial number ${result.serialNumber} is deleted`;

  res.json(reply);
});

module.exports = {
  createGateway,
  updateGateway,
  deleteGateway,
  getAllGateways,
  getGateway,
};
