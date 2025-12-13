import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with role support
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user' or 'admin'
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sweets table
export const sweets = pgTable("sweets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const sweetsRelations = relations(sweets, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertSweetSchema = createInsertSchema(sweets).omit({
  id: true,
});

export const updateSweetSchema = createInsertSchema(sweets).omit({
  id: true,
}).partial();

export type InsertSweet = z.infer<typeof insertSweetSchema>;
export type UpdateSweet = z.infer<typeof updateSweetSchema>;
export type Sweet = typeof sweets.$inferSelect;

// Transactions table for purchase history
export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  sweetId: integer("sweet_id").notNull().references(() => sweets.id),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'purchase' or 'restock'
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  sweet: one(sweets, {
    fields: [transactions.sweetId],
    references: [sweets.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Search params schema
export const searchSweetsSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

export type SearchSweetsParams = z.infer<typeof searchSweetsSchema>;
