const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');

// Helper to check if a timeslot is within opening hours
const isSlotWithinHours = (slot, open, close) => {
  const [slotH, slotM] = slot.split(':').map(Number);
  const [openH, openM] = open.split(':').map(Number);
  const [closeH, closeM] = close.split(':').map(Number);

  const slotTime = slotH * 60 + slotM;
  const openTime = openH * 60 + openM;
  let closeTime = closeH * 60 + closeM;

  // Handle overnight opening hours (e.g. 18:00 to 02:00)
  if (closeTime <= openTime) {
    closeTime += 24 * 60;
    const adjustedSlotTime = slotTime < openTime ? slotTime + 24 * 60 : slotTime;
    return adjustedSlotTime >= openTime && adjustedSlotTime <= closeTime;
  }

  return slotTime >= openTime && slotTime <= closeTime;
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { restaurant: restaurantId, bookingDate, timeSlot, numberOfGuests } = req.body;

    // 1. Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${restaurantId}`,
      });
    }

    // 2. Validate date (cannot be in the past)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setUTCHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Booking date cannot be in the past',
      });
    }

    // 3. Validate timeslot is within opening hours
    const { open, close } = restaurant.openingHours;
    if (!isSlotWithinHours(timeSlot, open, close)) {
      return res.status(400).json({
        success: false,
        error: `Restaurant is closed at ${timeSlot}. Opening hours are ${open} to ${close}`,
      });
    }

    // 4. Check for double booking by same user
    const existingUserBooking = await Booking.findOne({
      user: req.user.id,
      bookingDate: selectedDate,
      timeSlot,
      bookingStatus: 'confirmed',
    });

    if (existingUserBooking) {
      return res.status(400).json({
        success: false,
        error: 'You already have a confirmed booking at this date and time slot.',
      });
    }

    // 5. Booking Capacity Check (Bonus Feature)
    // Assume max 5 confirmed bookings per timeslot per restaurant
    const maxCapacity = 5;
    const currentBookingsCount = await Booking.countDocuments({
      restaurant: restaurantId,
      bookingDate: selectedDate,
      timeSlot,
      bookingStatus: 'confirmed',
    });

    if (currentBookingsCount >= maxCapacity) {
      return res.status(400).json({
        success: false,
        error: 'No tables available for this time slot. Please choose another time or date.',
      });
    }

    // 6. Create booking
    const booking = await Booking.create({
      user: req.user.id,
      restaurant: restaurantId,
      bookingDate: selectedDate,
      timeSlot,
      numberOfGuests,
      bookingStatus: 'confirmed',
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'restaurant',
        select: 'name address cuisineType openingHours image',
      })
      .sort('-bookingDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${req.params.id}`,
      });
    }

    // Make sure booking belongs to user or user is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking',
      });
    }

    // Update status to cancelled
    booking.bookingStatus = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'user',
        select: 'name email role',
      })
      .populate({
        path: 'restaurant',
        select: 'name cuisineType address',
      })
      .sort('-bookingDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
