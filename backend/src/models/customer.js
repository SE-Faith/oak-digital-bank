const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bvn: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  nin: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  verification_type: {
    type: DataTypes.ENUM('BVN', 'NIN'),
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'customers',
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['phone'] }
  ]
});

module.exports = Customer;
