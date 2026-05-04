const { sequelize, testConnection } = require('../config/database');
const Customer = require('./Customer');
const Account = require('./Account');
const Transaction = require('./Transaction');

// One customer, one account
Customer.hasOne(Account, {
  foreignKey: 'customer_id',
  as: 'account'
});

Account.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

Account.hasMany(Transaction, {
  foreignKey: 'sender_account_id',
  as: 'transactions'
});

Transaction.belongsTo(Account, {
  foreignKey: 'sender_account_id',
  as: 'sender_account'
});

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database tables synced');
  } catch (error) {
    console.error('Database sync error:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  Customer,
  Account,
  Transaction,
  syncDatabase
};
