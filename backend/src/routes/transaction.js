const express = require('express');
const router = express.Router();
const {
  nameEnquiry,
  transferFunds,
  getTransactionHistory,
  checkTransactionStatus
} = require('../controllers/transactionController');
const { authenticate, requireVerification } = require('../middlewares/auth');

router.post('/name-enquiry', authenticate, nameEnquiry);
router.post('/transfer', authenticate, requireVerification, transferFunds);
router.get('/history', authenticate, getTransactionHistory);
router.get('/status/:reference', authenticate, checkTransactionStatus);

module.exports = router;
