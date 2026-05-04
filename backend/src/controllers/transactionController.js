const { Account } = require('../models');
const nibssService = require('../services/nibssService');
const transactionService = require('../services/transactionService');



const nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account number is required"
      });
    }

    // 1. intra-bank check
    const account = await Account.findOne({
      where: { account_number: accountNumber }
    });

    if (account) {
      return res.status(200).json({
        success: true,
        data: {
          accountNumber: account.account_number,
          accountName: account.account_name,
          bankName: "Oak Bank",
          type: "INTRA_BANK"
        }
      });
    }

    // 2. inter-bank (NIBSS)
    const result = await nibssService.nameEnquiry(accountNumber);

    return res.status(200).json({
      success: true,
      data: {
        accountNumber: result.accountNumber || result.account_number,
        accountName: result.accountName || result.account_name,
        bankName: result.bankName,
        type: "INTER_BANK"
      }
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**const transferFunds = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { recipientAccountNumber, amount, narration } = req.body;

    if (!recipientAccountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Recipient account number and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero'
      });
    }

    const senderAccount = await Account.findOne({
      where: { customer_id: customerId }
    });

    if (!senderAccount) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please create an account first.'
      });
    }

    const recipientAccount = await Account.findOne({
      where: { account_number: recipientAccountNumber }
    });

    let result;

    if (recipientAccount) {
      result = await transactionService.processIntraBankTransfer(
        senderAccount.id,
        recipientAccountNumber,
        amount,
        narration || 'Transfer'
      );

      return res.status(200).json({
        success: true,
        message: 'Intra-bank transfer successful',
        data: {
          reference: result.reference,
          amount: result.amount,
          recipientName: result.recipientName,
          recipientAccountNumber: result.recipientAccountNumber,
          type: 'INTRA_BANK',
          status: 'SUCCESS'
        }
      });
    } else {
      if (!bankCode) {
        return res.status(400).json({
          success: false,
          message: 'Bank code is required for inter-bank transfers'
        });
      }

      result = await transactionService.processInterBankTransfer(
        senderAccount.id,
        recipientAccountNumber,
        bankCode,
        amount,
        narration || 'Transfer'
      );

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.success ? 'Inter-bank transfer initiated' : 'Transfer failed',
        data: {
          reference: result.reference,
          amount: result.amount,
          recipientName: result.recipientName,
          recipientAccountNumber: result.recipientAccountNumber,
          type: 'INTER_BANK',
          status: result.status,
          message: result.message
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Transfer failed',
      error: error.message
    });
  }
};
*/

const transferFunds = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { recipientAccountNumber, amount, narration } = req.body;

    if (!recipientAccountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "Recipient account number and amount are required"
      });
    }

    const senderAccount = await Account.findOne({
      where: { customer_id: customerId }
    });

    if (!senderAccount) {
      return res.status(404).json({
        success: false,
        message: "No account found"
      });
    }

    // 🔥 STEP 1: NAME ENQUIRY FIRST
    const nameData = await nibssService.nameEnquiry(recipientAccountNumber);

    const isIntra = nameData.type === "INTRA_BANK";

    let result;

    // 🔹 INTRA BANK
    if (isIntra) {
      const recipientAccount = await Account.findOne({
        where: { account_number: recipientAccountNumber }
      });

      result = await transactionService.processIntraBankTransfer(
        senderAccount.id,
        recipientAccountNumber,
        amount,
        narration
      );
    }

    // 🔹 INTER BANK
    else {
      result = await transactionService.processInterBankTransfer(
        senderAccount.id,
        recipientAccountNumber,
        amount,
        narration
      );
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.log("TRANSFER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await transactionService.getTransactionHistory(customerId, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions.map(txn => ({
          reference: txn.reference,
          senderAccountNumber: txn.sender_account_number,
          recipientAccountNumber: txn.recipient_account_number,
          recipientName: txn.recipient_name,
          amount: parseFloat(txn.amount),
          type: txn.transaction_type,
          status: txn.status,
          narration: txn.narration,
          createdAt: txn.createdAt
        })),
        count: transactions.length,
        limit,
        offset
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
};

const checkTransactionStatus = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required'
      });
    }

    const transaction = await transactionService.getTransactionByReference(reference, customerId);

    res.status(200).json({
      success: true,
      data: {
        reference: transaction.reference,
        senderAccountNumber: transaction.sender_account_number,
        recipientAccountNumber: transaction.recipient_account_number,
        recipientName: transaction.recipient_name,
        amount: parseFloat(transaction.amount),
        type: transaction.transaction_type,
        status: transaction.status,
        narration: transaction.narration,
        responseMessage: transaction.response_message,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Transaction not found',
      error: error.message
    });
  }
};

module.exports = {
  nameEnquiry,
  transferFunds,
  getTransactionHistory,
  checkTransactionStatus
};
