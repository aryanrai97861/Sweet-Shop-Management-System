import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken, extractTokenFromHeader } from './jwt';

describe('JWT Utilities', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    role: 'user' as const,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.username).toBe(mockUser.username);
      expect(payload?.role).toBe(mockUser.role);
    });

    it('should not include password in token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).not.toHaveProperty('password');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(mockUser.id);
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid.token.here');
      
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = verifyToken('notavalidtoken');
      
      expect(payload).toBeNull();
    });

    it('should include expiration time in payload', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).toHaveProperty('exp');
      expect(payload?.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'myvalidtoken123';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(undefined);
      
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('mytoken123');
      
      expect(extracted).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const extracted = extractTokenFromHeader('Bearer');
      
      expect(extracted).toBeNull();
    });

    it('should handle extra whitespace', () => {
      const token = 'myvalidtoken123';
      const header = `Bearer  ${token}  `;
      
      const extracted = extractTokenFromHeader(header);
      
      expect(extracted).toBe(token);
    });
  });
});
