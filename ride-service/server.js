const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const rides = [];

// Lifecycle States: REQUESTED -> ASSIGNED -> IN_PROGRESS -> COMPLETED / CANCELLED

// 1. Create Ride Request & Assign Driver
app.post('/api/rides/request', async (req, res) => {
    const { passengerId, pickup, destination } = req.body;

    try {
        // Synchronous Interservice Call to Driver Service
        const driverResponse = await axios.get('http://localhost:5002/api/drivers/available');
        const availableDrivers = driverResponse.data;

        if (!availableDrivers || availableDrivers.length === 0) {
            return res.status(404).json({ message: 'Negative Scenario: No available drivers found!' }); // Negative scenario
        }

        const selectedDriver = availableDrivers[0]; // Pick first available driver
        const rideId = 'ride_' + (rides.length + 1);

        const newRide = {
            rideId,
            passengerId,
            driverId: selectedDriver.driverId,
            pickup,
            destination,
            status: 'ASSIGNED'
        };

        rides.push(newRide);
        res.status(201).json({ message: 'Ride created successfully', ride: newRide });

    } catch (error) {
        res.status(500).json({ message: 'Error communicating with Driver Service', error: error.message });
    }
});

// 2. Update Ride Lifecycle Status
app.patch('/api/rides/status', (req, res) => {
    const { rideId, status } = req.body; // e.g., 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    const ride = rides.find(r => r.rideId === rideId);

    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // Status Transition Validation
    const validTransitions = {
        'ASSIGNED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
    };

    if (!validTransitions[ride.status] || !validTransitions[ride.status].includes(status)) {
        return res.status(400).json({ message: `Negative Scenario: Invalid status transition from ${ride.status} to ${status}` });
    }

    ride.status = status;
    res.json({ message: `Ride status updated to ${status}`, ride });
});

// 3. Get Ride Details
app.get('/api/rides/:id', (req, res) => {
    const ride = rides.find(r => r.rideId === req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json(ride);
});

const PORT = 5003;
app.listen(PORT, () => console.log(`Ride Management Service running on port ${PORT}`));