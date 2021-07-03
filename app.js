const path = require('path');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression')

const urlRouter = require('./routes/urlRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const donationRouter = require('./routes/donationRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// App settings
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());
app.use(rateLimit({
  max: 400,
  windowMs: 1000 * 60 * 60,  // 1 hr
  message: 'Too many requests from the same IP, please try again in an hour!'
}));
app.use(mongoSanitize());
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/', viewRouter);
app.use('/api/v1/urls', urlRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/donations', donationRouter);

// Error Handling
app.use('*', (req, _, next) => next(new AppError(`Can't find ${req.baseUrl} on this server`, 404)));
app.use(globalErrorHandler);

module.exports = app;