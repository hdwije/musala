const asyncHandler = require('express-async-handler');
const nuid = require('number-uid');

const { maxDevicesCount } = require('../config/settings');
const Device = require('../models/Device');
const Gateway = require('../models/Gateway');

/**
 * @desc Store new device
 * @route POST /devices
 */
const createDevice = asyncHandler(async (req, res) => {
  const { gateway, vendor, status } = req.body;

  // Validate request body
  if (!gateway || !vendor || !['online', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const gatewayDevices = await Device.find({ gateway }).lean().exec();

  if (gatewayDevices?.length >= maxDevicesCount) {
    return res
      .status(400)
      .json({ message: 'Gateway devices count is exceeded' });
  }

  // Check duplicates for device
  const duplicate = await Device.findOne({ gateway, vendor }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ message: 'Duplicate device' });
  }

  const uid = parseInt(nuid(10));

  // Create and store a new device
  const device = await Device.create({ gateway, uid, vendor, status });

  if (device) {
    return res.status(201).json(device);
  } else {
    return res.status(400).json({ message: 'Invalid device data received' });
  }
});

/**
 * @desc Update a device
 * @route PATCH /devices
 */
const updateDevice = asyncHandler(async (req, res) => {
  const { _id, gateway, vendor, status } = req.body;

  // Validate request body
  if (!_id || !gateway || !vendor || !['online', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Confirm device exists to update
  const device = await Device.findById(_id).exec();

  if (!device) {
    return res.status(400).json({ message: 'Device not found' });
  }

  // Check duplicates for device
  const duplicate = await Device.findOne({
    gateway: { $eq: gateway },
    vendor: { $eq: vendor },
    uid: { $ne: device.uid },
    _id: { $ne: _id },
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(400).json({ message: 'Duplicate device' });
  }

  device.gateway = gateway;
  device.vendor = vendor;
  device.status = status;

  const updatedOne = await device.save();

  res.json(updatedOne);
});

/**
 * @desc Get all devices
 * @route GET /devices
 */
const getAllDevices = asyncHandler(async (req, res) => {
  // Get all devices from MongoDB
  const devices = await Device.find().lean();

  if (!devices || !devices.length) {
    return res.json([]);
  }

  // Add gateway to each device before sending the response
  const devicesWithGateway = await Promise.all(
    devices.map(async (device) => {
      const gateway = await Gateway.findById(device.gateway).lean().exec();

      return { ...device, gateway: gateway._id };
    }),
  );

  res.json(devicesWithGateway);
});

/**
 * @desc Get device
 * @route GET /devices
 */
const getDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get device from MongoDB
  const device = await Device.findById(id).populate('gateway').lean().exec();

  if (!device) {
    return res.status(400).json({ message: 'Device not found' });
  }

  res.json(device);
});

/**
 * @desc Delete device
 * @route DELETE /devices
 */
const deleteDevice = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: 'Device id is required' });
  }

  const device = await Device.findById(_id).exec();

  if (!device) {
    return res.status(400).json({ message: 'Device not found' });
  }

  const result = await device.deleteOne();
  const reply = `Device ${result.uid} is deleted`;

  res.json(reply);
});

module.exports = {
  createDevice,
  updateDevice,
  deleteDevice,
  getAllDevices,
  getDevice,
};
