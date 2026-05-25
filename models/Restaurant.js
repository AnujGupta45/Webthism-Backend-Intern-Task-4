const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a restaurant name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    cuisineType: {
      type: String,
      required: [true, 'Please add cuisine type(s)'],
      trim: true,
    },
    ratings: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    openingHours: {
      open: {
        type: String,
        required: [true, 'Please add opening time'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (24-hour)'],
      },
      close: {
        type: String,
        required: [true, 'Please add closing time'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (24-hour)'],
      },
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete menu items when a restaurant is deleted
RestaurantSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await this.model('MenuItem').deleteMany({ restaurant: this._id });
  await this.model('Booking').deleteMany({ restaurant: this._id });
  next();
});

// Reverse populate with MenuItems virtual
RestaurantSchema.virtual('menu', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false,
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
