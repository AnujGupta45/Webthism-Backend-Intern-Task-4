const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Please associate this menu item with a restaurant'],
    },
    itemName: {
      type: String,
      required: [true, 'Please add an item name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be 0 or higher'],
    },
    category: {
      type: String,
      required: [true, 'Please specify category (e.g., Starter, Main Course, Dessert, Beverage)'],
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
