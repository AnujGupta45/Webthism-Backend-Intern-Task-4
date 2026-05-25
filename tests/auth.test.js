const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  const mockUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(mockUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', mockUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not register user with an already registered email', async () => {
      // Create user first
      await User.create({
        name: 'Existing User',
        email: mockUser.email,
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send(mockUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Email is already registered');
    });

    it('should fail registration with invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register the user for login tests
      await User.create(mockUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toEqual(mockUser.email);
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
