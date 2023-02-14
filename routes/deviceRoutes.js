const express = require('express');

const deviceController = require('../controllers/deviceController');

const router = express.Router();

router
  .route('/')
  .get(deviceController.getAllDevices)
  .post(deviceController.createDevice)
  .patch(deviceController.updateDevice)
  .delete(deviceController.deleteDevice);

router.route('/:id').get(deviceController.getDevice);

module.exports = router;
