const express = require('express');
const router = express.Router();
const telebirrPaymentController = require('../controllers/telebirrPaymentController');

// Telebirr payment routes
router.post('/telebirr/create', telebirrPaymentController.createPayment);
router.get('/telebirr/verify/:outTradeNo', telebirrPaymentController.verifyPayment);
router.post('/telebirr/callback', telebirrPaymentController.handleCallback);

// Payment result pages
router.get('/telebirr/success/:outTradeNo', telebirrPaymentController.successPage);
router.get('/telebirr/failure/:outTradeNo', telebirrPaymentController.failurePage);
router.get('/telebirr/cancel/:outTradeNo', telebirrPaymentController.cancelPage);

module.exports = router; 