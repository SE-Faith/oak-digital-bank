const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccount,
  checkBalance
} = require('../controllers/accountController');
const { authenticate, requireVerification } = require('../middlewares/auth');

router.post('/create', authenticate, requireVerification, createAccount);
router.get('/', authenticate, getAccount);
router.get('/balance', authenticate, checkBalance);

module.exports = router;
