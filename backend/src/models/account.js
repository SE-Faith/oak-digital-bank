const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  account_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 15000.00,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
    defaultValue: 'ACTIVE'
  }
}, {
  tableName: 'accounts',
  indexes: [
    { unique: true, fields: ['account_number'] },
    { fields: ['customer_id'] }
  ]
});

module.exports = Account;
