const express = require('express');
const app = express();
const cors = require('cors');


//data base connection initialization
require('./config/db');

//cors configuration

const corsOptions = {
    origin: process.env.FRONTENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    credentials: true,
  };


// Middleware

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());


const employeeRoutes = require('./routes/employeeRoutes');
const historicalRoutes = require('./routes/historicalRoutes');
const userRoutes = require('./routes/userRoutes');
const incrementalRoutes = require('./routes/incrementRoutes');
const bonuses = require('./routes/bonusRoute')
const zohoRoutes = require('./routes/zohoRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/historical_data',historicalRoutes);
app.use('/api/increments',incrementalRoutes);
app.use('/api/bonuses',bonuses);
app.use('/auth/zoho',zohoRoutes);

module.exports = app;
