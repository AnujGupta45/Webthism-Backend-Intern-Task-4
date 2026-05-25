const Restaurant = require('../models/Restaurant');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res, next) => {
  try {
    let { name, description, address, cuisineType, ratings, openingHours } = req.body;

    // Handle multipart form data if openingHours is sent as string
    if (openingHours && typeof openingHours === 'string') {
      try {
        openingHours = JSON.parse(openingHours);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid openingHours JSON format',
        });
      }
    }

    let image = null;
    if (req.file) {
      image = req.file.path.replace(/\\/g, '/'); // Normalize slashes for Windows/Linux
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      cuisineType,
      ratings: ratings ? Number(ratings) : 0,
      openingHours,
      image,
    });

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    // If error and file was uploaded, remove it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    // Exclude menu virtual populate to keep index light, can load on single restaurant route
    const countFeatures = new APIFeatures(Restaurant.find(), req.query).search().filter();
    const total = await countFeatures.query.countDocuments();

    const features = new APIFeatures(Restaurant.find(), req.query)
      .search()
      .filter()
      .sort()
      .paginate();

    const restaurants = await features.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults: total,
      },
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('menu');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${req.params.id}`,
      });
    }

    let updateData = { ...req.body };

    // Handle multipart form data if openingHours is sent as string
    if (updateData.openingHours && typeof updateData.openingHours === 'string') {
      try {
        updateData.openingHours = JSON.parse(updateData.openingHours);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid openingHours JSON format',
        });
      }
    }

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (restaurant.image && fs.existsSync(restaurant.image)) {
        fs.unlinkSync(restaurant.image);
      }
      updateData.image = req.file.path.replace(/\\/g, '/');
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: `Restaurant not found with id of ${req.params.id}`,
      });
    }

    // Delete restaurant image if exists
    if (restaurant.image && fs.existsSync(restaurant.image)) {
      fs.unlinkSync(restaurant.image);
    }

    // Call deleteOne() to trigger the pre('deleteOne') cascade delete hooks
    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
