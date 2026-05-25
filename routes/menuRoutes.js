const express = require('express');
const {
  addMenuItem,
  getRestaurantMenu,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { menuItemValidator, mongoIdValidator } = require('../utils/validators');
const validate = require('../middleware/validation');

// mergeParams is required to access restaurantId from the parent router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    protect,
    authorize('admin'),
    mongoIdValidator('restaurantId'),
    menuItemValidator,
    validate,
    addMenuItem
  )
  .get(mongoIdValidator('restaurantId'), validate, getRestaurantMenu);

router
  .route('/:itemId')
  .put(
    protect,
    authorize('admin'),
    mongoIdValidator('restaurantId'),
    mongoIdValidator('itemId'),
    validate,
    updateMenuItem
  )
  .delete(
    protect,
    authorize('admin'),
    mongoIdValidator('restaurantId'),
    mongoIdValidator('itemId'),
    validate,
    deleteMenuItem
  );

module.exports = router;
