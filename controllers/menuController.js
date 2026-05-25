const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Add menu item to restaurant
// @route   POST /api/restaurants/:restaurantId/menu
// @access  Private/Admin
exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${req.params.restaurantId}`,
      });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurant: req.params.restaurantId,
    });

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:restaurantId/menu
// @access  Public
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${req.params.restaurantId}`,
      });
    }

    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:restaurantId/menu/:itemId
// @access  Private/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await MenuItem.findOne({
      _id: req.params.itemId,
      restaurant: req.params.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: `Menu item not found with id of ${req.params.itemId} for this restaurant`,
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:restaurantId/menu/:itemId
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.itemId,
      restaurant: req.params.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: `Menu item not found with id of ${req.params.itemId} for this restaurant`,
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
