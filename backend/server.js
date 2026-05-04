const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./src/models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const setupRoutes = require('./src/routes/setup');
const onboardingRoutes = require('./src/routes/onboarding');
const accountRoutes = require('./src/routes/account');
const transactionRoutes = require('./src/routes/transaction');

app.get('/', (req, res) => {
    res.json({
        message: 'Digital Banking API is running!',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/setup', setupRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await testConnection();
        await syncDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
