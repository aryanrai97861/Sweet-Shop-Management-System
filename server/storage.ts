import {
  users,
  sweets,
  transactions,
  type User,
  type InsertUser,
  type Sweet,
  type InsertSweet,
  type UpdateSweet,
  type Transaction,
  type InsertTransaction,
  type SearchSweetsParams,
} from "@shared/schema";
import { db } from "./db";
import { pool } from "./db";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sweet operations
  getSweets(): Promise<Sweet[]>;
  getSweet(id: number): Promise<Sweet | undefined>;
  searchSweets(params: SearchSweetsParams): Promise<Sweet[]>;
  createSweet(sweet: InsertSweet): Promise<Sweet>;
  updateSweet(id: number, sweet: UpdateSweet): Promise<Sweet | undefined>;
  deleteSweet(id: number): Promise<boolean>;
  getCategories(): Promise<string[]>;

  // Transaction operations
  purchaseSweet(userId: number, sweetId: number, quantity: number): Promise<Transaction | undefined>;
  restockSweet(userId: number, sweetId: number, quantity: number): Promise<Sweet | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getSweets(): Promise<Sweet[]> {
    return db.select().from(sweets).orderBy(sweets.name);
  }

  async getSweet(id: number): Promise<Sweet | undefined> {
    const [sweet] = await db.select().from(sweets).where(eq(sweets.id, id));
    return sweet || undefined;
  }

  async searchSweets(params: SearchSweetsParams): Promise<Sweet[]> {
    const conditions = [];

    if (params.name) {
      conditions.push(ilike(sweets.name, `%${params.name}%`));
    }
    if (params.category) {
      conditions.push(eq(sweets.category, params.category));
    }
    if (params.minPrice) {
      conditions.push(gte(sweets.price, params.minPrice));
    }
    if (params.maxPrice) {
      conditions.push(lte(sweets.price, params.maxPrice));
    }

    if (conditions.length === 0) {
      return this.getSweets();
    }

    return db.select().from(sweets).where(and(...conditions)).orderBy(sweets.name);
  }

  async createSweet(sweet: InsertSweet): Promise<Sweet> {
    const [created] = await db.insert(sweets).values(sweet).returning();
    return created;
  }

  async updateSweet(id: number, sweet: UpdateSweet): Promise<Sweet | undefined> {
    const [updated] = await db
      .update(sweets)
      .set(sweet)
      .where(eq(sweets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSweet(id: number): Promise<boolean> {
    const result = await db.delete(sweets).where(eq(sweets.id, id)).returning();
    return result.length > 0;
  }

  async getCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: sweets.category })
      .from(sweets)
      .orderBy(sweets.category);
    console.log("Raw categories result:", result);
    return result.map((r) => r.category).filter((c) => c && c.trim() !== "");
  }

  async purchaseSweet(
    userId: number,
    sweetId: number,
    quantity: number = 1
  ): Promise<Transaction | undefined> {
    const sweet = await this.getSweet(sweetId);
    if (!sweet || sweet.quantity < quantity) {
      return undefined;
    }

    const totalPrice = (parseFloat(sweet.price) * quantity).toFixed(2);

    // Update quantity
    await db
      .update(sweets)
      .set({ quantity: sweet.quantity - quantity })
      .where(eq(sweets.id, sweetId));

    // Create transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        sweetId,
        quantity,
        totalPrice,
        type: "purchase",
      })
      .returning();

    return transaction;
  }

  async restockSweet(
    userId: number,
    sweetId: number,
    quantity: number
  ): Promise<Sweet | undefined> {
    const sweet = await this.getSweet(sweetId);
    if (!sweet) {
      return undefined;
    }

    const [updated] = await db
      .update(sweets)
      .set({ quantity: sweet.quantity + quantity })
      .where(eq(sweets.id, sweetId))
      .returning();

    // Create transaction record
    await db.insert(transactions).values({
      userId,
      sweetId,
      quantity,
      totalPrice: "0",
      type: "restock",
    });

    return updated;
  }
}

export const storage = new DatabaseStorage();
