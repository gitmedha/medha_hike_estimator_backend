const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const dbConfig = require('../knexfile')[process.env.NODE_ENV || 'development'];

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
  };
}

const PgSession = require('connect-pg-simple')(session);

// database connection initialization
const knex = require('./config/db');

// cors configuration
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

// ✅ Always pass object to connect-pg-simple
const connection =
  typeof dbConfig.connection === 'string'
    ? { connectionString: dbConfig.connection }
    : dbConfig.connection;

app.use(
  session({
    store: new PgSession({
      conObject: connection,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,      
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);


const employeeRoutes = require('./routes/employeeRoutes');
const historicalRoutes = require('./routes/historicalRoutes');
const userRoutes = require('./routes/userRoutes');
const incrementalRoutes = require('./routes/incrementRoutes');
const bonuses = require('./routes/bonusRoute');
const zohoRoutes = require('./routes/zohoRoutes');
const webHooks = require('./routes/webHookRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/historical_data', historicalRoutes);
app.use('/api/increments', incrementalRoutes);
app.use('/api/bonuses', bonuses);
app.use('/api/zoho', zohoRoutes);
app.use('/webhook', webHooks);

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
});

module.exports = app;
