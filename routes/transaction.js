const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction');

router.post('/payment', transactionController.stripe);

module.exports = router;
