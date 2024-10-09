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

// Routes
app.use('/api/employees', employeeRoutes);

module.exports = app;
