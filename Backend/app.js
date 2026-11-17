
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const userRoutes = require('./routes/user.routes');
const placeRoutes = require('./routes/place.routes');

// Keep captain routes if this file exists
// const captainRoutes = require('./routes/captain.routes');

const app = express();

// CORS CONFIGURATION
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API ROUTES
app.use('/users', userRoutes);
app.use('/places', placeRoutes);

// Uncomment if you have captain routes
// app.use('/captains', captainRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
    res.send('Uber Clone Backend is running!');
});

module.exports = app;
