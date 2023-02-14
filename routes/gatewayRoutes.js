const express = require('express');

const gatewayController = require('../controllers/gatewayController');

const router = express.Router();

router
  .route('/')
  .get(gatewayController.getAllGateways)
  .post(gatewayController.createGateway)
  .patch(gatewayController.updateGateway)
  .delete(gatewayController.deleteGateway);

router.route('/:id').get(gatewayController.getGateway);

module.exports = router;
