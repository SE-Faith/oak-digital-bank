const express = require('express');
const router = express.Router();
const nibssService = require('../services/nibssService');

router.post('/register', async (req, res) => {
  try {
    const { email, bankName } = req.body;

    if (!email || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Email and bank name are required'
      });
    }

    const result = await nibssService.registerBank(email, bankName);

    res.status(200).json({
      success: true,
      message: 'Registration successful! Check your email for API credentials.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
