const { Customer } = require('../models');
const nibssService = require('../services/nibssService');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const registerCustomer = async (req, res) => {
  try {
    const { email, phone, firstName, lastName, dateOfBirth, password } = req.body;

    if (!email || !phone || !firstName || !lastName || !dateOfBirth || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, phone, firstName, lastName, dateOfBirth, password'
      });
    }

    const existingCustomer = await Customer.findOne({
      where: { email }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    const existingPhone = await Customer.findOne({
      where: { phone }
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    const passwordHash = await hashPassword(password);

    const customer = await Customer.create({
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      password_hash: passwordHash,
      is_verified: false
    });

    const token = generateToken({ customerId: customer.id });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your BVN or NIN to complete onboarding.',
      data: {
        customerId: customer.id,
        email: customer.email,
        phone: customer.phone,
        firstName: customer.first_name,
        lastName: customer.last_name,
        isVerified: customer.is_verified,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
    console.log(error);
  }
};

const verifyBVN = async (req, res) => {
  try {
    const { bvn } = req.body;
    const customerId = req.customer.id;

    if (!bvn) {
      return res.status(400).json({
        success: false,
        message: 'BVN is required'
      });
    }

    const verificationResult = await nibssService.verifyBVN(bvn);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'BVN verification failed',
        details: verificationResult
      })
      console.log(error);
    }

    await Customer.update(
      {
        bvn,
        verification_type: 'BVN',
        is_verified: true
      },
      {
        where: { id: customerId }
      }
    );

    const updatedCustomer = await Customer.findByPk(customerId);

    res.status(200).json({
      success: true,
      message: 'BVN verification successful! You can now create an account.',
      data: {
        customerId: updatedCustomer.id,
        email: updatedCustomer.email,
        isVerified: updatedCustomer.is_verified,
        verificationType: updatedCustomer.verification_type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'BVN verification failed',
      error: error.message
    })
    console.log(error);
  }
};

const verifyNIN = async (req, res) => {
  try {
    const { nin } = req.body;
    const customerId = req.customer.id;

    if (!nin) {
      return res.status(400).json({
        success: false,
        message: 'NIN is required'
      })
      console.log(error);
    }

    const verificationResult = await nibssService.verifyNIN(nin);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'NIN verification failed',
        details: verificationResult
      });
    }

    await Customer.update(
      {
        nin,
        verification_type: 'NIN',
        is_verified: true
      },
      {
        where: { id: customerId }
      }
    );

    const updatedCustomer = await Customer.findByPk(customerId);

    res.status(200).json({
      success: true,
      message: 'NIN verification successful! You can now create an account.',
      data: {
        customerId: updatedCustomer.id,
        email: updatedCustomer.email,
        isVerified: updatedCustomer.is_verified,
        verificationType: updatedCustomer.verification_type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'NIN verification failed',
      error: error.message
    })
    console.log(error);
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const customer = await Customer.findOne({
      where: { email }
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await comparePassword(password, customer.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({ customerId: customer.id });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        customerId: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        isVerified: customer.is_verified,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const customer = await Customer.findByPk(customerId, {
      attributes: ['id', 'email', 'phone', 'first_name', 'last_name', 'is_verified', 'verification_type', 'created_at']
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

module.exports = {
  registerCustomer,
  verifyBVN,
  verifyNIN,
  loginCustomer,
  getProfile
};
