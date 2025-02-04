require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');

// Auth Middleware
const checkAuth = require('./middleware/check-auth');

// Routes
const usersRouter = require('./routes/users');
const packagesRouter = require('./routes/packages');
const transactionRouter = require('./routes/transaction');
const forgotPasswordRouter = require('./routes/forgotPassword');
const bookingRouter = require('./routes/booking');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Routing
app.use('/users', usersRouter);
app.use('/packages', checkAuth, packagesRouter);
app.use('/booking', bookingRouter);
app.use('/reset_password', forgotPasswordRouter);
app.use('/transaction', transactionRouter);

app.listen(process.env.PORT || 3000);
