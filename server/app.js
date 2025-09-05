const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const pg = require('pg');
const PgSession = require('connect-pg-simple')(session);



//data base connection initialization
const knex = require('./config/db');

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
app.set('trust proxy', 1);
const sessionMiddleware = session({
  store: new PgSession({
    conObject: {
      connectionString: process.env.DATABASE_URL, // if you use a single URL
      // OR, if you want to use your knexfile config, pass user, host, database, password, port here
    },
    tableName: 'user_sessions', // defaults to "session"
    createTableIfMissing: true  // auto-creates table if not exists
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true, // prevents JS access
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'lax'
  }
});

app.use(sessionMiddleware);




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

app.get('/api/test-session', (req, res) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res.json({ message: `You have viewed this ${req.session.views} times` });
});


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
