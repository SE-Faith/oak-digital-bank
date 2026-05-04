const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  sender_account_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  sender_account_number: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  recipient_account_number: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  recipient_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recipient_bank_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.ENUM('INTRA_BANK', 'INTER_BANK'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
    defaultValue: 'PENDING'
  },
  narration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  response_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  indexes: [
    { unique: true, fields: ['reference'] },
    { fields: ['sender_account_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Transaction;
