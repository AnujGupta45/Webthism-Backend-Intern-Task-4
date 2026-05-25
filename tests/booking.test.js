const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

describe('Booking Endpoints', () => {
  let adminToken;
  let userToken;
  let otherUserToken;
  let restaurantId;
  let futureDateStr;

  beforeEach(async () => {
    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id);

    // Create user
    const user = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });
    userToken = generateToken(user._id);

    // Create other user
    const otherUser = await User.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
      role: 'user',
    });
    otherUserToken = generateToken(otherUser._id);

    // Seed a restaurant open 12:00 to 22:00
    const restaurant = await Restaurant.create({
      name: 'Taco Haven',
      description: 'The best tacos in town.',
      address: '12 Mexican Plaza, Cardiff',
      cuisineType: 'Mexican',
      openingHours: { open: '12:00', close: '22:00' },
    });
    restaurantId = restaurant._id.toString();

    // Create a date in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    futureDateStr = futureDate.toISOString().split('T')[0];
  });

  describe('POST /api/bookings', () => {
    it('should create booking if details are valid', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: futureDateStr,
          timeSlot: '19:30',
          numberOfGuests: 4,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.timeSlot).toEqual('19:30');
      expect(res.body.data.bookingStatus).toEqual('confirmed');
    });

    it('should prevent booking on a past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: pastDateStr,
          timeSlot: '19:30',
          numberOfGuests: 2,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('cannot be in the past');
    });

    it('should prevent booking outside opening hours', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: futureDateStr,
          timeSlot: '09:00', // Restaurant opens at 12:00
          numberOfGuests: 2,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('closed at 09:00');
    });

    it('should prevent double booking for the same user, date, and slot', async () => {
      // Create first booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: futureDateStr,
          timeSlot: '19:00',
          numberOfGuests: 2,
        });

      // Try creating second booking at same slot
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: futureDateStr,
          timeSlot: '19:00',
          numberOfGuests: 4,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already have a confirmed booking');
    });

    it('should prevent booking when slot capacity is exceeded', async () => {
      // Pre-book 5 tables (our slot capacity limit) using other users/ids
      for (let i = 0; i < 5; i++) {
        const dummyUser = await User.create({
          name: `Dummy ${i}`,
          email: `dummy${i}@example.com`,
          password: 'password123',
        });

        const d = new Date(futureDateStr);
        d.setUTCHours(0, 0, 0, 0);

        await Booking.create({
          user: dummyUser._id,
          restaurant: restaurantId,
          bookingDate: d,
          timeSlot: '20:00',
          numberOfGuests: 2,
          bookingStatus: 'confirmed',
        });
      }

      // Try booking the 6th spot
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          restaurant: restaurantId,
          bookingDate: futureDateStr,
          timeSlot: '20:00',
          numberOfGuests: 2,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('No tables available');
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should return bookings only for the logged-in user', async () => {
      const d = new Date(futureDateStr);
      d.setUTCHours(0, 0, 0, 0);

      // Create user booking
      await Booking.create({
        user: (await User.findOne({ email: 'user@example.com' }))._id,
        restaurant: restaurantId,
        bookingDate: d,
        timeSlot: '18:00',
        numberOfGuests: 2,
      });

      // Create other user booking
      await Booking.create({
        user: (await User.findOne({ email: 'other@example.com' }))._id,
        restaurant: restaurantId,
        bookingDate: d,
        timeSlot: '18:00',
        numberOfGuests: 4,
      });

      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toEqual(1);
      expect(res.body.data[0].numberOfGuests).toEqual(2);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let bookingId;

    beforeEach(async () => {
      const d = new Date(futureDateStr);
      d.setUTCHours(0, 0, 0, 0);
      const booking = await Booking.create({
        user: (await User.findOne({ email: 'user@example.com' }))._id,
        restaurant: restaurantId,
        bookingDate: d,
        timeSlot: '18:00',
        numberOfGuests: 2,
      });
      bookingId = booking._id.toString();
    });

    it('should cancel booking successfully by owner', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.bookingStatus).toEqual('cancelled');
    });

    it('should block cancellation by unauthorized users', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should allow cancellation by admin', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.bookingStatus).toEqual('cancelled');
    });
  });

  describe('GET /api/bookings', () => {
    it('should allow admin to get all bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
    });

    it('should block normal users from viewing all bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});
