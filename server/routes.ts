import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { insertSweetSchema, updateSweetSchema, searchSweetsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all sweets
  app.get("/api/sweets", requireAuth, async (req, res) => {
    try {
      const sweets = await storage.getSweets();
      res.json(sweets);
    } catch (error) {
      res.status(500).send("Failed to fetch sweets");
    }
  });

  // Search sweets
  app.get("/api/sweets/search", requireAuth, async (req, res) => {
    try {
      const params = searchSweetsSchema.parse(req.query);
      const sweets = await storage.searchSweets(params);
      res.json(sweets);
    } catch (error) {
      res.status(500).send("Failed to search sweets");
    }
  });

  // Get categories
  app.get("/api/sweets/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      console.log("Categories from DB:", categories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Failed to fetch categories");
    }
  });

  // Get single sweet
  app.get("/api/sweets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sweet = await storage.getSweet(id);
      if (!sweet) {
        return res.status(404).send("Sweet not found");
      }
      res.json(sweet);
    } catch (error) {
      res.status(500).send("Failed to fetch sweet");
    }
  });

  // Create sweet (protected)
  app.post("/api/sweets", requireAuth, async (req, res) => {
    try {
      const data = insertSweetSchema.parse(req.body);
      const sweet = await storage.createSweet(data);
      res.status(201).json(sweet);
    } catch (error) {
      res.status(400).send("Invalid sweet data");
    }
  });

  // Update sweet (protected)
  app.put("/api/sweets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateSweetSchema.parse(req.body);
      const sweet = await storage.updateSweet(id, data);
      if (!sweet) {
        return res.status(404).send("Sweet not found");
      }
      res.json(sweet);
    } catch (error) {
      res.status(400).send("Invalid sweet data");
    }
  });

  // Delete sweet (admin only)
  app.delete("/api/sweets/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSweet(id);
      if (!deleted) {
        return res.status(404).send("Sweet not found");
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).send("Failed to delete sweet");
    }
  });

  // Purchase sweet (protected)
  app.post("/api/sweets/:id/purchase", requireAuth, async (req, res) => {
    try {
      const sweetId = parseInt(req.params.id);
      const userId = req.user!.id;
      const quantity = req.body.quantity || 1;

      if (!quantity || quantity <= 0) {
        return res.status(400).send("Invalid quantity");
      }

      const transaction = await storage.purchaseSweet(userId, sweetId, quantity);
      if (!transaction) {
        return res.status(400).send("Unable to complete purchase. Sweet may be out of stock.");
      }
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).send("Failed to process purchase");
    }
  });

  // Restock sweet (admin only)
  app.post("/api/sweets/:id/restock", requireAdmin, async (req, res) => {
    try {
      const sweetId = parseInt(req.params.id);
      const userId = req.user!.id;
      const quantity = parseInt(req.body.quantity);

      if (!quantity || quantity <= 0) {
        return res.status(400).send("Invalid quantity");
      }

      const sweet = await storage.restockSweet(userId, sweetId, quantity);
      if (!sweet) {
        return res.status(404).send("Sweet not found");
      }
      res.json(sweet);
    } catch (error) {
      res.status(500).send("Failed to restock sweet");
    }
  });

  // Get all transactions (admin only)
  app.get("/api/transactions", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).send("Failed to fetch transactions");
    }
  });

  return httpServer;
}
