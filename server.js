const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const swaggerSpec = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize express app
const app = express();

// Connect to Database (only if not in testing mode)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(cors()); // Enable CORS

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (apply to all /api routes)
app.use('/api', apiLimiter);

// Serve static upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/bookings', bookingRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Restaurant Booking & Menu Management API. Visit /api-docs for documentation.',
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Run server (only if not in testing mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
