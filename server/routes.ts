import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // CATEGORIES
  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.post(api.categories.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const cat = await storage.createCategory(input);
      res.status(201).json(cat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PRODUCTS
  app.get(api.products.list.path, async (req, res) => {
    const { categoryId, search, featured } = req.query;
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const prods = await storage.getProducts(
      categoryId as string, 
      search as string, 
      isFeatured
    );
    res.json(prods);
  });

  app.get(api.products.get.path, async (req, res) => {
    const prod = await storage.getProduct(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.json(prod);
  });

  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const prod = await storage.createProduct(input);
      res.status(201).json(prod);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.products.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const prod = await storage.updateProduct(req.params.id, input);
      if (!prod) return res.status(404).json({ message: "Product not found" });
      res.json(prod);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.products.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProduct(req.params.id);
    res.status(204).end();
  });

  // ORDERS
  app.get(api.orders.list.path, isAuthenticated, async (req: any, res) => {
    // Return all orders for the user
    // A real app might distinguish admins vs normal users here
    const userId = req.user.claims.sub;
    
    // For MVP, if there's a specific flag we could return all, but let's just return for userId unless they pass a param
    const { all } = req.query;
    const orders = await storage.getOrders(all === 'true' ? undefined : userId);
    res.json(orders);
  });

  app.get(api.orders.get.path, isAuthenticated, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const orderData = {
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        notes: input.notes
      };
      
      const order = await storage.createOrder(userId, orderData, input.items);
      res.status(201).json(order);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(400).json({ message: err.message || "Failed to create order" });
    }
  });

  app.patch(api.orders.updateStatus.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(req.params.id, input.status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // REVIEWS
  app.get(api.reviews.listByProduct.path, async (req, res) => {
    const reviews = await storage.getProductReviews(req.params.id);
    res.json(reviews);
  });

  app.post(api.reviews.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const review = await storage.createReview({
        ...input,
        userId,
        productId: req.params.id
      });
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ADMIN STATS
  app.get(api.admin.stats.path, isAuthenticated, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // Call seed database
  seedDatabase().catch(console.error);

  return httpServer;
}

export async function seedDatabase() {
  const cats = await storage.getCategories();
  if (cats.length === 0) {
    const c1 = await storage.createCategory({ name: "مشاتل القادري", description: "نباتات للزينة الداخلية والخارجية", imageUrl: "https://images.unsplash.com/photo-1416879598555-22442b083d03" });
    const c2 = await storage.createCategory({ name: "مروج الخضراء", description: "أشجار تعطي ثماراً لزراعة الحدائق", imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4" });
    const c3 = await storage.createCategory({ name: "أدوات زراعية", description: "معدات وأدوات للزراعة", imageUrl: "https://images.unsplash.com/photo-1416879598555-22442b083d03" });
    
    await storage.createProduct({
      categoryId: c1.id,
      name: "نبتة المونستيرا",
      description: "نبتة داخلية رائعة تتميز بأوراقها الكبيرة والمثقبة.",
      price: "150.00",
      discountPrice: "120.00",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
      isFeatured: true
    });
    
    await storage.createProduct({
      categoryId: c2.id,
      name: "شجرة ليمون",
      description: "شجرة ليمون مثمرة، ارتفاع 1.5 متر، جاهزة للزراعة.",
      price: "85.00",
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1550828520-4cb496926fc9",
      isFeatured: false
    });
    
    await storage.createProduct({
      categoryId: c3.id,
      name: "مقص تقليم الأشجار",
      description: "مقص تقليم عالي الجودة ومضاد للصدأ.",
      price: "45.00",
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1416879598555-22442b083d03",
      isFeatured: true
    });
  }
}
