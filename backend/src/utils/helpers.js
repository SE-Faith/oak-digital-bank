const generateAccountNumber = () => {
  let accountNumber = '';
  for (let i = 0; i < 10; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  return accountNumber;
};

const generateTransactionReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `TXN${timestamp}${random}`;
};

const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};

module.exports = {
  generateAccountNumber,
  generateTransactionReference,
  formatAmount
};
