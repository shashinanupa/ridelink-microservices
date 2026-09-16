const express = require('express');
const app = express();
app.use(express.json());

const payments = [];

// 1. Calculate Fare Estimate Rule
app.post('/api/payments/estimate', (req, res) => {
    const { distanceKm } = req.body;
    
    if (!distanceKm || distanceKm <= 0) {
        return res.status(400).json({ message: 'Invalid distance provided' });
    }

    const baseFare = 100; // Base rate LKR
    const perKmRate = 80; // LKR per KM
    const estimatedFare = baseFare + (distanceKm * perKmRate);

    res.json({ distanceKm, estimatedFare, currency: 'LKR' });
});

// 2. Process Simulated Payment
app.post('/api/payments/process', (req, res) => {
    const { rideId, amount, paymentMethod } = req.body; // e.g., 'CASH', 'CARD'

    // Negative scenario simulation
    if (amount <= 0) {
        return res.status(400).json({ message: 'Negative Scenario: Payment failed due to invalid amount' });
    }

    const paymentId = 'pay_' + (payments.length + 1);
    const paymentRecord = {
        paymentId,
        rideId,
        amount,
        paymentMethod,
        status: 'PAID',
        timestamp: new Date()
    };

    payments.push(paymentRecord);

    res.status(201).json({
        message: 'Payment processed successfully',
        receipt: paymentRecord
    });
});

const PORT = 5004;
app.listen(PORT, () => console.log(`Fare & Payment Service running on port ${PORT}`));