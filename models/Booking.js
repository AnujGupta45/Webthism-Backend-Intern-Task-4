const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate this booking with a user'],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Please associate this booking with a restaurant'],
    },
    bookingDate: {
      type: Date,
      required: [true, 'Please add a booking date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please add a time slot'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (24-hour)'],
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Please specify the number of guests'],
      min: [1, 'Number of guests must be at least 1'],
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from having multiple confirmed bookings for the same date and time slot
BookingSchema.index(
  { user: 1, bookingDate: 1, timeSlot: 1 },
  { 
    unique: true, 
    partialFilterExpression: { bookingStatus: 'confirmed' } 
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
