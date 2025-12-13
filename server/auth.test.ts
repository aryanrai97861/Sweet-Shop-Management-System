import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { setupAuth } from './auth';
import { storage } from './storage';
import { verifyToken } from './jwt';

describe('Authentication API', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    setupAuth(app);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueUsername = `testuser_${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: uniqueUsername,
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(uniqueUsername);
      expect(response.body.user.role).toBe('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should validate JWT token structure', async () => {
      const uniqueUsername = `testuser_${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: uniqueUsername,
          password: 'password123',
        });

      expect(response.body.token).toBeTruthy();
      const payload = verifyToken(response.body.token);
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(response.body.user.id);
      expect(payload?.username).toBe(uniqueUsername);
    });

    it('should reject registration with existing username', async () => {
      const username = `duplicate_${Date.now()}`;
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123',
        });

      // Second registration with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject registration without username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should allow registration with admin role', async () => {
      const uniqueUsername = `admin_${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: uniqueUsername,
          password: 'adminpass',
          role: 'admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      username: `logintest_${Date.now()}`,
      password: 'testpassword123',
    };

    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return valid JWT token on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      const payload = verifyToken(response.body.token);
      expect(payload).toBeTruthy();
      expect(payload?.username).toBe(testUser.username);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login without username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out');
    });
  });

  describe('GET /api/user', () => {
    let authToken: string;
    let userId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `getuser_${Date.now()}`,
          password: 'password123',
        });
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(403);
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', authToken); // Missing "Bearer " prefix

      expect(response.status).toBe(401);
    });
  });
});
