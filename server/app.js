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
const webHooks = require('./routes/webHookRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/historical_data',historicalRoutes);
app.use('/api/increments',incrementalRoutes);
app.use('/api/bonuses',bonuses);
app.use('/api/zoho',zohoRoutes);
app.use('/webhook',webHooks);

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error handling 
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } 
  // Production error handling
  else {
    // Operational, trusted errors: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Programming or other unknown errors
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
});


module.exports = app;
