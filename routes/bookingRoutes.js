const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { bookingValidator, mongoIdValidator } = require('../utils/validators');
const validate = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .post(protect, bookingValidator, validate, createBooking)
  .get(protect, authorize('admin'), getAllBookings);

router.get('/my-bookings', protect, getMyBookings);

router.put(
  '/:id/cancel',
  protect,
  mongoIdValidator('id'),
  validate,
  cancelBooking
);

module.exports = router;
