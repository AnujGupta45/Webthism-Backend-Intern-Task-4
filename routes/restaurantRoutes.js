const express = require('express');
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { restaurantValidator, mongoIdValidator } = require('../utils/validators');
const validate = require('../middleware/validation');

// Include other resource routers
const menuRouter = require('./menuRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:restaurantId/menu', menuRouter);

router
  .route('/')
  .get(getRestaurants)
  .post(
    protect,
    authorize('admin'),
    upload.single('image'),
    restaurantValidator,
    validate,
    createRestaurant
  );

router
  .route('/:id')
  .get(mongoIdValidator('id'), validate, getRestaurant)
  .put(
    protect,
    authorize('admin'),
    upload.single('image'),
    mongoIdValidator('id'),
    validate,
    updateRestaurant
  )
  .delete(
    protect,
    authorize('admin'),
    mongoIdValidator('id'),
    validate,
    deleteRestaurant
  );

module.exports = router;
