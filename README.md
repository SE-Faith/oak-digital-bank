# Oak Digital Banking System 

A backend digital banking system built with Node.js, Express, and Sequelize ORM that simulates real-world banking operations such as account creation, deposits, withdrawals, fund transfers, transaction history tracking and NIBSS integration for account verification and name enquiry.

---

## Project Description

This project is a backend financial system designed to simulate core banking operations found in real financial institutions. It demonstrates how banking systems are structured and how data flows securely between customers, accounts, and transaction services.

It focuses on real backend engineering principles such as:
- System architecture (MVC pattern)
- Secure authentication and authorization
- Transaction processing and integrity (ACID principles)
- Database modeling and relationships
- External service integration (NIBSS simulation)

---

##  Features

###  Customer Management
- Customer registration
- Secure login system
- Password hashing using bcrypt
- JWT authentication

###  Account Management
- Bank account creation per customer
- Unique account number generation
- Account retrieval and validation
- Customer-account relationship mapping

###  Transaction System
- Deposit funds
- Withdraw funds
- Transfer funds between accounts
- Transaction history tracking
- Database transaction safety

###  NIBSS Integration (Mock Service)
- Account name enquiry
- Account validation simulation
- External banking service behavior emulation
- Pre-transaction verification logic

###  Security
- JWT-based authentication
- Password encryption using bcrypt
- Protected routes via middleware
- Input validation and error handling
- Secure transaction processing

---

##  Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- MySQL / PostgreSQL
- JWT (JSON Web Tokens)
- Bcrypt.js
- Axios

---

##  Project Structure

digital-banking/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── accountController.js
│   │   └── transactionController.js
│   │
│   ├── models/
│   │   ├── customerModel.js
│   │   ├── accountModel.js
│   │   └── transactionModel.js
│   │
│   ├── services/
│   │   └── nibssService.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── accountRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── nibssRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── utils/
│   │   ├── generateAccountNumber.js
│   │   └── helpers.js
│   │
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── .env.example

##  Installation & Setup: Clone the repository

git clone https://github.com/SE-Faith/oak-digital-bank.git
cd oak-digital-bank
