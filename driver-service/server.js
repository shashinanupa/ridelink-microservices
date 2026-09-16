const express = require('express');
const app = express();
app.use(express.json());

// Simulated Database
const drivers = [
    { driverId: 'usr_2', vehicleNo: 'CAB-1234', vehicleType: 'CAR', isAvailable: true, location: 'Nugegoda' }
];

// 1. Driver/Vehicle Profile Creation or Update
app.post('/api/drivers/profile', (req, res) => {
    const { driverId, vehicleNo, vehicleType, location } = req.body;
    
    let driver = drivers.find(d => d.driverId === driverId);
    if (driver) {
        driver.vehicleNo = vehicleNo;
        driver.vehicleType = vehicleType;
        driver.location = location;
    } else {
        driver = { driverId, vehicleNo, vehicleType, isAvailable: true, location };
        drivers.push(driver);
    }
    
    res.json({ message: 'Driver profile updated', driver });
});

// 2. Toggle Availability State
app.patch('/api/drivers/availability', (req, res) => {
    const { driverId, isAvailable } = req.body;
    const driver = drivers.find(d => d.driverId === driverId);
    
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    driver.isAvailable = isAvailable;
    res.json({ message: `Driver availability updated to ${isAvailable}`, driver });
});

// 3. Get Available Drivers (Called by Ride Management Service)
app.get('/api/drivers/available', (req, res) => {
    const availableDrivers = drivers.filter(d => d.isAvailable);
    res.json(availableDrivers);
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Driver Service running on port ${PORT}`));