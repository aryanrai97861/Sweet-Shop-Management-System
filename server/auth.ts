import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { generateToken, verifyToken, extractTokenFromHeader } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      user?: SelectUser;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Middleware to authenticate JWT token from Authorization header
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.sendStatus(401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.sendStatus(403); // Invalid or expired token
  }

  // Fetch full user data from database
  storage.getUser(payload.userId).then((user) => {
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  }).catch(() => {
    return res.sendStatus(500);
  });
}

/**
 * Middleware to require authentication (alias for authenticateToken)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, next);
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, (err?: any) => {
    if (err) return next(err);
    
    if (!req.user) {
      return res.sendStatus(401);
    }
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  });
}

export function setupAuth(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        role: role || "user",
      });

      // Generate JWT token
      const token = generateToken(user);

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout endpoint (client-side token removal, but included for API completeness)
  app.post("/api/auth/logout", (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for API consistency
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/user", authenticateToken, (req, res) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
