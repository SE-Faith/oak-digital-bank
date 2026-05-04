const { verifyToken } = require('../utils/auth');
const { Customer } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const customer = await Customer.findByPk(decoded.customerId);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Customer not found.'
      });
    }

    req.customer = {
      id: customer.id,
      email: customer.email,
      isVerified: customer.is_verified
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const requireVerification = (req, res, next) => {
  if (!req.customer.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account not verified. Please complete BVN/NIN verification.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireVerification
};
