const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

describe('Restaurant Endpoints', () => {
  let adminToken;
  let userToken;
  let restaurantId;

  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id);

    // Create normal user
    const user = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });
    userToken = generateToken(user._id);

    // Seed a restaurant
    const restaurant = await Restaurant.create({
      name: 'Bella Vista',
      description: 'Splendid views and Italian cuisine.',
      address: '456 Hilltop Ave, Bristol',
      cuisineType: 'Italian',
      openingHours: { open: '12:00', close: '22:00' },
      ratings: 4.2,
    });
    restaurantId = restaurant._id.toString();
  });

  describe('GET /api/restaurants', () => {
    it('should get all restaurants', async () => {
      const res = await request(app).get('/api/restaurants');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('count', 1);
      expect(res.body.data[0].name).toEqual('Bella Vista');
    });

    it('should search restaurants by search keyword', async () => {
      // Add another restaurant
      await Restaurant.create({
        name: 'Golden Dragon',
        description: 'Traditional Chinese dishes.',
        address: '789 China Ave, London',
        cuisineType: 'Chinese',
        openingHours: { open: '11:00', close: '23:00' },
      });

      const res = await request(app).get('/api/restaurants?search=dragon');
      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].name).toEqual('Golden Dragon');
    });
  });

  describe('GET /api/restaurants/:id', () => {
    it('should get a single restaurant details', async () => {
      const res = await request(app).get(`/api/restaurants/${restaurantId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toEqual('Bella Vista');
      expect(res.body.data).toHaveProperty('menu');
    });

    it('should return 404 if restaurant ID is not found', async () => {
      const fakeId = '60c72b2f9b1d8b22c8f739aa';
      const res = await request(app).get(`/api/restaurants/${fakeId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/restaurants', () => {
    const newRestaurant = {
      name: 'Sushi Zen',
      description: 'Fresh sushi and sashimi.',
      address: '101 Sakura Lane, Manchester',
      cuisineType: 'Japanese',
      openingHours: { open: '12:00', close: '21:30' },
    };

    it('should create restaurant if request is from an admin', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRestaurant);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual('Sushi Zen');
    });

    it('should block restaurant creation if user is not admin', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newRestaurant);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('is not authorized');
    });

    it('should block restaurant creation if user is not logged in', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .send(newRestaurant);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/restaurants/:id', () => {
    it('should update restaurant if request is from admin', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bella Vista Bistro' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toEqual('Bella Vista Bistro');
    });
  });

  describe('DELETE /api/restaurants/:id', () => {
    it('should delete restaurant if request is from admin', async () => {
      const res = await request(app)
        .delete(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);

      // Check it was deleted
      const checkRes = await Restaurant.findById(restaurantId);
      expect(checkRes).toBeNull();
    });
  });
});
