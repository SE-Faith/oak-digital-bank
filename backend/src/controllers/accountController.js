const { Account, Customer } = require('../models');
const nibssService = require('../services/nibssService');

const createAccount = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // 🔒 Ensure user is verified
    if (!customer.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Account creation denied. Please complete BVN/NIN verification first.'
      });
    }

    // 🚫 Prevent multiple accounts
    const existingAccount = await Account.findOne({
      where: { customer_id: customerId }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'You already have an account.',
        data: {
          accountNumber: existingAccount.account_number,
          accountName: existingAccount.account_name,
          balance: parseFloat(existingAccount.balance)
        }
      });
    }

    // 🧾 Prepare KYC data
    const kycType = customer.verification_type;
    const kycID =
      kycType === 'BVN' ? customer.bvn : customer.nin;

    const dob = customer.date_of_birth;

    // 🏦 Call NIBSS
    const nibssResponse = await nibssService.createAccount(
      kycType,
      kycID,
      dob
    );

    console.log('🔍 NIBSS RESPONSE:', nibssResponse);

    // ✅ Correct extraction (CRITICAL FIX)
    const accountData = nibssResponse?.account;

const accountNumber = accountData?.accountNumber;
const bankCode = accountData?.bankCode;
const bankName = accountData?.bankName;
const balance = accountData?.balance || 15000.00;

    // 🛑 Safety check (prevents DB crash)
    if (!accountNumber) {
      return res.status(500).json({
        success: false,
        message: 'Account number not returned from NIBSS',
        raw: nibssResponse
      });
    }

    // 👤 Account name
    const accountName = `${customer.first_name} ${customer.last_name}`;

    // 💾 Save to DB
    const account = await Account.create({
      customer_id: customerId,
      account_number: accountNumber,
      account_name: accountName,
      balance,
      status: 'ACTIVE'
    });

    // 🎉 Response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Pre-funded with ₦15,000.',
      data: {
        accountId: account.id,
        accountNumber: account.account_number,
        accountName: account.account_name,
        balance: parseFloat(account.balance),
        bankCode,
        bankName,
        status: account.status,
        createdAt: account.createdAt
      }
    });

  } catch (error) {
    console.error('❌ CREATE ACCOUNT ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Account creation failed',
      error: error.message
    });
  }
};

const getAccount = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const account = await Account.findOne({
      where: { customer_id: customerId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please create an account first.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        accountId: account.id,
        accountNumber: account.account_number,
        accountName: account.account_name,
        balance: parseFloat(account.balance),
        status: account.status,
        createdAt: account.createdAt,
        customer: account.customer
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch account details',
      error: error.message
    });
  }
};

const checkBalance = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const account = await Account.findOne({
      where: { customer_id: customerId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please create an account first.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        accountNumber: account.account_number,
        accountName: account.account_name,
        balance: parseFloat(account.balance),
        currency: 'NGN'
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check balance',
      error: error.message
    });
  }
};

module.exports = {
  createAccount,
  getAccount,
  checkBalance
};