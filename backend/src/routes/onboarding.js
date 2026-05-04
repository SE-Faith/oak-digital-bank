const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  verifyBVN,
  verifyNIN,
  loginCustomer,
  getProfile
} = require('../controllers/onboardingController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/verify/bvn', authenticate, verifyBVN);
router.post('/verify/nin', authenticate, verifyNIN);
router.get('/profile', authenticate, getProfile);

module.exports = router;
