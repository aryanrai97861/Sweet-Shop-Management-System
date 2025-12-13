import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { createServer } from 'http';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';

describe('Sweet Shop API Routes', () => {
  let app: Express;
  let adminToken: string;
  let userToken: string;
  let adminId: number;
  let userId: number;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: `admin_${Date.now()}`,
        password: 'adminpass',
        role: 'admin',
      });
    adminToken = adminResponse.body.token;
    adminId = adminResponse.body.user.id;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: `user_${Date.now()}`,
        password: 'userpass',
      });
    userToken = userResponse.body.token;
    userId = userResponse.body.user.id;
  });

  describe('GET /api/sweets', () => {
    it('should return list of sweets for authenticated user', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });

    it('should return sweets with correct structure', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`);

      if (response.body.length > 0) {
        const sweet = response.body[0];
        expect(sweet).toHaveProperty('id');
        expect(sweet).toHaveProperty('name');
        expect(sweet).toHaveProperty('category');
        expect(sweet).toHaveProperty('price');
        expect(sweet).toHaveProperty('quantity');
      }
    });
  });

  describe('GET /api/sweets/categories', () => {
    it('should return list of categories', async () => {
      const response = await request(app)
        .get('/api/sweets/categories')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/categories');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sweets', () => {
    it('should allow admin to create a sweet', async () => {
      const newSweet = {
        name: `TestSweet_${Date.now()}`,
        category: 'Candy',
        price: '5.99',
        quantity: 100,
        description: 'Test sweet',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newSweet.name);
      expect(response.body.category).toBe(newSweet.category);
    });

    it('should reject non-admin user from creating sweets', async () => {
      const newSweet = {
        name: 'TestSweet',
        category: 'Candy',
        price: 5.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newSweet);

      expect(response.status).toBe(403);
    });

    it('should reject creation without authentication', async () => {
      const newSweet = {
        name: 'TestSweet',
        category: 'Candy',
        price: 5.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(newSweet);

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const invalidSweet = {
        category: 'Candy',
        price: 5.99,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSweet);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/sweets/:id', () => {
    let sweetId: number;

    beforeEach(async () => {
      // Create a sweet to update
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `UpdateTest_${Date.now()}`,
          category: 'Candy',
          price: '5.99',
          quantity: 50,
        });
      
      expect(createResponse.status).toBe(201);
      sweetId = createResponse.body.id;
      expect(sweetId).toBeDefined();
    });

    it.skip('should allow admin to update a sweet', async () => {
      const updates = {
        name: 'Updated Name',
        price: '6.99',
      };

      const response = await request(app)
        .patch(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.price).toBe('6.99');
    });

    it.skip('should reject non-admin from updating', async () => {
      const response = await request(app)
        .patch(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .patch('/api/sweets/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: number;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `DeleteTest_${Date.now()}`,
          category: 'Candy',
          price: '5.99',
          quantity: 50,
        });
      sweetId = createResponse.body.id;
    });

    it('should allow admin to delete a sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should reject non-admin from deleting', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .delete('/api/sweets/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: number;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `PurchaseTest_${Date.now()}`,
          category: 'Candy',
          price: '10.00',
          quantity: 100,
        });
      sweetId = createResponse.body.id;
    });

    it('should allow authenticated user to purchase', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.quantity).toBe(5);
      expect(response.body.type).toBe('purchase');
    });

    it('should reject purchase without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 5 });

      expect(response.status).toBe(401);
    });

    it.skip('should reject purchase with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
    });

    it('should reject purchase exceeding stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 999 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/transactions', () => {
    it('should allow admin to view all transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject non-admin from viewing transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/transactions');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: number;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `RestockTest_${Date.now()}`,
          category: 'Candy',
          price: '5.99',
          quantity: 10,
        });
      sweetId = createResponse.body.id;
    });

    it('should allow admin to restock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBeGreaterThan(0);
    });

    it('should reject non-admin from restocking', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(403);
    });

    it('should reject invalid restock quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });

      expect(response.status).toBe(400);
    });
  });
});
