const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const JWT_SECRET = 'ridelink_secret_key_123';

// Simulated Database (In-Memory Array)
const users = [];

// 1. User Registration API
app.post('/api/accounts/register', async (req, res) => {
    const { name, email, password, role } = req.body; // role: 'PASSENGER' or 'DRIVER'
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + (users.length + 1);

    const newUser = { id: userId, name, email, password: hashedPassword, role };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', userId, role });
});

// 2. User Login API
app.post('/api/accounts/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, userId: user.id, role: user.role });
});

// 3. Get User Profile API
app.get('/api/accounts/profile/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { password, ...userProfile } = user; // Exclude password
    res.json(userProfile);
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Account Service running on port ${PORT}`));