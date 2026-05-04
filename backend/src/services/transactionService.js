const { Transaction, Account, sequelize } = require('../models');
const { generateTransactionReference } = require('../utils/helpers');
const nibssService = require('./nibssService');

const processIntraBankTransfer = async (
  senderAccountId,
  recipientAccountNumber,
  amount,
  narration
) => {
  const t = await sequelize.transaction();

  try {
    const sender = await Account.findByPk(senderAccountId, { transaction: t });

    if (!sender) throw new Error("Sender not found");

    const recipient = await Account.findOne({
      where: { account_number: String(recipientAccountNumber).trim() },
      transaction: t
    });

    if (!recipient) throw new Error("Recipient not found");

    const amt = parseFloat(amount);

    if (parseFloat(sender.balance) < amt) {
      throw new Error("Insufficient balance");
    }

    const reference = generateTransactionReference();

    // 🔥 FORCE ATOMIC SQL UPDATES
    const debitResult = await Account.update(
      {
        balance: sequelize.literal(`balance - ${amt}`)
      },
      {
        where: { id: senderAccountId },
        transaction: t
      }
    );

    const cleanAccount = String(recipientAccountNumber).trim();

const creditResult = await Account.update(
  {
    balance: sequelize.literal(`balance + ${amt}`)
  },
  {
    where: { account_number: cleanAccount },
    transaction: t
  }
);
    console.log("DEBIT:", debitResult);
    console.log("CREDIT:", creditResult);

    if (creditResult[0] === 0) {
      throw new Error("Credit failed - no rows updated");
    }

    await Transaction.create({
      reference,
      sender_account_id: sender.id,
      sender_account_number: sender.account_number,
      recipient_account_number,
      recipient_name: recipient.account_name,
      amount: amt,
      transaction_type: "INTRA_BANK",
      status: "SUCCESS",
      narration
    }, { transaction: t });

    await t.commit();

    return {
      success: true,
      reference,
      amount: amt,
      recipientName: recipient.account_name,
      recipientAccountNumber
    };

  } catch (err) {
    await t.rollback();
    throw err;
  }
};
/* =========================================================
   INTER-BANK TRANSFER (NIBSS FLOW)
========================================================= */
const processInterBankTransfer = async (
  senderAccountId,
  recipientAccountNumber,
  amount,
  narration
) => {
  const t = await sequelize.transaction();

  try {
    const sender = await Account.findByPk(senderAccountId, { transaction: t });

    if (!sender) throw new Error('Sender account not found');

    if (parseFloat(sender.balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    const reference = generateTransactionReference();

    /* =========================
       1. NAME ENQUIRY
    ========================= */
    let recipientName = 'Unknown';

    try {
      const nameData = await nibssService.nameEnquiry(recipientAccountNumber);

      recipientName =
        nameData.accountName ||
        nameData.account_name ||
        'Unknown';
    } catch (err) {
      console.log('Name enquiry failed:', err.message);
    }

    /* =========================
       2. CALL NIBSS TRANSFER
    ========================= */
    const token = await nibssService.getNIBBSToken();

    const response = await fetch(
      `${nibssService.baseURL}/transfer`,
      {
        method: 'POST',
        headers: {
          ...nibssService.getHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender.account_number,
          to: recipientAccountNumber,
          amount: amount.toString()
        })
      }
    );

    const transferResult = await response.json();

    const success = transferResult.status === 'SUCCESS';

    /* =========================
       3. DEBIT WALLET ONLY IF SUCCESS
    ========================= */
    if (success) {
      await sender.decrement('balance', {
        by: amount,
        transaction: t
      });
    }

    /* =========================
       4. SAVE TRANSACTION
    ========================= */
    const txn = await Transaction.create({
      reference,
      sender_account_id: sender.id,
      sender_account_number: sender.account_number,
      recipient_account_number: recipientAccountNumber,
      recipient_name: recipientName,
      recipient_bank_code: null,
      amount,
      transaction_type: 'INTER_BANK',
      status: success ? 'SUCCESS' : 'FAILED',
      narration,
      response_message: transferResult.message || 'Processed'
    }, { transaction: t });

    await t.commit();

    return {
      success,
      reference: txn.reference,
      amount,
      recipientName,
      recipientAccountNumber,
      status: txn.status,
      message: transferResult.message
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/* =========================================================
   TRANSACTION HISTORY
========================================================= */
const getTransactionHistory = async (customerId, limit = 50, offset = 0) => {
  const account = await Account.findOne({
    where: { customer_id: customerId }
  });

  if (!account) throw new Error('No account found');

  return await Transaction.findAll({
    where: { sender_account_id: account.id },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

/* =========================================================
   SINGLE TRANSACTION
========================================================= */
const getTransactionByReference = async (reference, customerId) => {
  const account = await Account.findOne({
    where: { customer_id: customerId }
  });

  if (!account) throw new Error('No account found');

  const txn = await Transaction.findOne({
    where: {
      reference,
      sender_account_id: account.id
    }
  });

  if (!txn) throw new Error('Transaction not found or unauthorized');

  return txn;
};

/* =========================================================
   EXPORTS
========================================================= */
module.exports = {
  processIntraBankTransfer,
  processInterBankTransfer,
  getTransactionHistory,
  getTransactionByReference
};