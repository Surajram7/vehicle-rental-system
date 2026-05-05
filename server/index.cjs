const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const dbHandlers = require('./db.cjs');

const JWT_SECRET = 'your-super-secret-key-change-this'; // In production, use env variable

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs for auth
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required.' });
    }
};

// Auth
app.post('/api/auth/register', authLimiter, async (req, res) => {
    const result = await dbHandlers.registerUser(req.body);
    if (result.success) {
        const token = jwt.sign(
            { id: result.id, email: req.body.email, role: result.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        await dbHandlers.addAuditLog({
            user_id: result.id,
            action: 'REGISTER',
            details: `User registered: ${req.body.email}`
        });
        res.json({ ...result, token, user: { id: result.id, name: req.body.name, email: req.body.email, role: result.role } });
    } else {
        res.json(result);
    }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
    const result = await dbHandlers.loginUser(req.body);
    if (result.success) {
        const token = jwt.sign(
            { id: result.user.id, email: result.user.email, role: result.user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        await dbHandlers.addAuditLog({
            user_id: result.user.id,
            action: 'LOGIN',
            details: `User logged in`
        });

        res.json({ ...result, token });
    } else {
        res.json(result);
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const row = await dbHandlers.getUserPasswordById(req.user.id);
        if (!row) {
            return res.json({ success: false, error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, row.password);
        if (!isMatch) {
            return res.json({ success: false, error: 'Current password is incorrect' });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await dbHandlers.changePassword(req.user.id, hashedNewPassword);
        
        await dbHandlers.addAuditLog({
            user_id: req.user.id,
            action: 'UPDATE_PASSWORD',
            details: 'User changed their password'
        });
        
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await dbHandlers.getVehicles();
        res.json(vehicles);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/vehicles/owner/:userId', async (req, res) => {
    try {
        const vehicles = await dbHandlers.getVehiclesByOwner(req.params.userId);
        res.json(vehicles);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/vehicles', async (req, res) => {
    const result = await dbHandlers.addVehicle(req.body);
    res.json(result);
});

app.put('/api/vehicles/:id', async (req, res) => {
    const data = { ...req.body, id: req.params.id };
    const result = await dbHandlers.updateVehicle(data);
    res.json(result);
});

app.delete('/api/vehicles/:id', async (req, res) => {
    const result = await dbHandlers.deleteVehicle(req.params.id);
    res.json(result);
});

app.put('/api/vehicles/:id/status', async (req, res) => {
    const result = await dbHandlers.updateVehicleStatus({ id: req.params.id, status: req.body.status });
    res.json(result);
});

app.put('/api/vehicles/:id/verify', authenticateToken, isAdmin, async (req, res) => {
    const result = await dbHandlers.updateVehicleVerification({ id: req.params.id, is_verified: req.body.is_verified });
    if (result.success) {
        await dbHandlers.addAuditLog({
            user_id: req.user.id,
            action: req.body.is_verified ? 'VERIFY_VEHICLE' : 'UNVERIFY_VEHICLE',
            target_type: 'vehicle',
            target_id: req.params.id
        });
    }
    res.json(result);
});

// Bookings
app.post('/api/bookings', authenticateToken, async (req, res) => {
    const result = await dbHandlers.createBooking(req.body);
    if (result.success) {
        await dbHandlers.addAuditLog({
            user_id: req.user.id,
            action: 'CREATE_BOOKING',
            target_type: 'booking',
            target_id: result.id,
            details: `Booking created for vehicle ${req.body.vehicle_id}`
        });
        
        // Mock Email/SMS Notification
        console.log(`\n[NOTIFICATION] 📩 Sending Email to User ID: ${req.user.id}`);
        console.log(`[NOTIFICATION] Subject: Booking Request Received`);
        console.log(`[NOTIFICATION] Body: Your booking request for vehicle ID ${req.body.vehicle_id} has been submitted.\n`);
    }
    res.json(result);
});

app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const bookings = await dbHandlers.getUserBookings(req.params.userId);
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/bookings/owner/:userId', async (req, res) => {
    try {
        const bookings = await dbHandlers.getOwnerBookings(req.params.userId);
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await dbHandlers.getAllBookings();
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/bookings/:id/status', async (req, res) => {
    const data = { id: req.params.id, status: req.body.status, vehicle_id: req.body.vehicle_id };
    const result = await dbHandlers.updateBookingStatus(data);
    
    if (result.success) {
        // Mock Notification
        console.log(`\n[NOTIFICATION] 📩 Booking Status Update for Booking ID: ${req.params.id}`);
        console.log(`[NOTIFICATION] New Status: ${req.body.status}\n`);
    }
    
    res.json(result);
});

// Users
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await dbHandlers.getAllUsers();
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const data = { id: req.params.id, is_active: req.body.is_active };
    const result = await dbHandlers.updateUserStatus(data);
    if (result.success) {
        await dbHandlers.addAuditLog({
            user_id: req.user.id,
            action: req.body.is_active ? 'UNBLOCK_USER' : 'BLOCK_USER',
            target_type: 'user',
            target_id: req.params.id
        });
    }
    res.json(result);
});

app.put('/api/users/:id/verify', authenticateToken, isAdmin, async (req, res) => {
    const data = { id: req.params.id, cnic_verified: req.body.cnic_verified };
    const result = await dbHandlers.updateUserVerification(data);
    if (result.success) {
        await dbHandlers.addAuditLog({
            user_id: req.user.id,
            action: req.body.cnic_verified ? 'VERIFY_CNIC' : 'UNVERIFY_CNIC',
            target_type: 'user',
            target_id: req.params.id
        });
    }
    res.json(result);
});

app.put('/api/users/:id/profile', authenticateToken, async (req, res) => {
    try {
        const result = await dbHandlers.updateUserProfile({ id: req.params.id, ...req.body });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Payments
app.post('/api/payments', async (req, res) => {
    const result = await dbHandlers.createPayment(req.body);
    if (result.success) {
        // Mock Notification
        console.log(`\n[NOTIFICATION] 💳 Payment Received`);
        console.log(`[NOTIFICATION] User ID: ${req.body.user_id}`);
        console.log(`[NOTIFICATION] Amount: ${req.body.amount}`);
        console.log(`[NOTIFICATION] SMS sent: "Payment of $${req.body.amount} received successfully."\n`);
    }
    res.json(result);
});

app.get('/api/payments/booking/:bookingId', async (req, res) => {
    try {
        const payments = await dbHandlers.getBookingPayments(req.params.bookingId);
        res.json(payments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Reviews
app.post('/api/reviews', async (req, res) => {
    const result = await dbHandlers.addReview(req.body);
    res.json(result);
});


// Dashboard Metrics
app.get('/api/dashboard/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const stats = await dbHandlers.getDashboardStats();
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Audit Logs
app.get('/api/audit-logs', authenticateToken, isAdmin, async (req, res) => {
    try {
        const logs = await dbHandlers.getAuditLogs();
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
