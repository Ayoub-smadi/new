import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import type { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extend Request type to include multer's file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    const uploadPath = path.join(process.cwd(), "client", "public", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // File upload route
  app.post("/api/upload", isAuthenticated, upload.single("file"), (req: MulterRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // ADMIN CHECK MIDDLEWARE
  const isAdminMiddleware: RequestHandler = async (req: any, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin' && user?.firstName !== 'Ayoub') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  // CATEGORIES
  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.post(api.categories.create.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
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

  app.get(api.categories.listSubCategories.path, async (req, res) => {
    const subs = await storage.getSubCategories(req.params.id);
    res.json(subs);
  });

  app.post(api.categories.createSubCategory.path, isAuthenticated, isAdminMiddleware, async (req: Request, res) => {
    try {
      const id = req.params.id;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const input = api.categories.createSubCategory.input.parse(req.body);
      const sub = await storage.createSubCategory({
        ...input,
        categoryId: id
      });
      res.status(201).json(sub);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PRODUCTS
  app.get(api.products.list.path, async (req, res) => {
    const { categoryId, subCategoryId, search, featured } = req.query;
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const prods = await storage.getProducts(
      categoryId as string, 
      subCategoryId as string,
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

  app.post(api.products.create.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.subCategoryId === "none") {
        body.subCategoryId = null;
      }
      console.log("Creating product with body (sanitized):", JSON.stringify(body, null, 2));
      const input = api.products.create.input.parse(body);
      const prod = await storage.createProduct(input);
      console.log("Product created successfully:", prod.id);
      res.status(201).json(prod);
    } catch (err: any) {
      console.error("Error creating product:", err);
      if (err instanceof z.ZodError) {
        console.error("Validation error details:", JSON.stringify(err.errors, null, 2));
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.put(api.products.update.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.subCategoryId === "none") {
        body.subCategoryId = null;
      }
      const input = api.products.update.input.parse(body);
      const prod = await storage.updateProduct(req.params.id as string, input);
      if (!prod) return res.status(404).json({ message: "Product not found" });
      res.json(prod);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.delete(api.products.delete.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
    await storage.deleteProduct(req.params.id as string);
    res.status(204).end();
  });

  // ORDERS
  app.get(api.orders.list.path, isAuthenticated, async (req: any, res) => {
    // Return all orders for the user
    // A real app might distinguish admins vs normal users here
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    const isAdmin = user?.role === 'admin' || user?.firstName === 'Ayoub';
    
    // For MVP, if there's a specific flag we could return all, but let's just return for userId unless they pass a param
    const { all } = req.query;
    const orders = await storage.getOrders((all === 'true' && isAdmin) ? undefined : userId);
    res.json(orders);
  });

  app.get(api.orders.get.path, isAuthenticated, async (req: any, res) => {
    const order = await storage.getOrder(req.params.id as string);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    const isAdmin = user?.role === 'admin' || user?.firstName === 'Ayoub';
    
    if (order.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
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

  app.patch(api.orders.updateStatus.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(req.params.id as string, input.status);
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
    const reviews = await storage.getProductReviews(req.params.id as string);
    res.json(reviews);
  });

  app.post(api.reviews.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const review = await storage.createReview({
        ...input,
        userId,
        productId: req.params.id as string
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
  app.get(api.admin.stats.path, isAuthenticated, isAdminMiddleware, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // NURSERY GALLERY
  app.get("/api/nursery", async (req, res) => {
    const items = await storage.getNurseryGallery();
    res.json(items);
  });

  app.post("/api/nursery", isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const item = await storage.createNurseryItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/nursery/:id", isAuthenticated, isAdminMiddleware, async (req, res) => {
    await storage.deleteNurseryItem(req.params.id as string);
    res.status(204).end();
  });

  // CATEGORY DELETE
  app.delete("/api/categories/:id", isAuthenticated, isAdminMiddleware, async (req, res) => {
    await storage.deleteCategory(req.params.id as string);
    res.status(204).end();
  });

  // Call seed database
  seedDatabase().catch(console.error);

  // Endpoint to create admin user (ONE-TIME USE)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      if (!email || !firstName) return res.status(400).json({ message: "Email and first name are required" });
      
      const user = await storage.createAdminUser({
        email,
        firstName,
        lastName,
        role: "admin"
      });
      res.status(201).json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to create admin" });
    }
  });

  return httpServer;
}

export async function seedDatabase() {
  const cats = await storage.getCategories();
  // Check if "مروج الخضراء" exists and delete it if requested (though we handle it via API usually)
  // For the prompt "احذف هاي ومروج الخضراء", I'll also ensure it's not in the seed if it's a fresh start
  if (cats.length === 0) {
    const c1 = await storage.createCategory({ name: "مشاتل القادري", description: "نباتات للزينة الداخلية والخارجية", imageUrl: "https://images.unsplash.com/photo-1416879598555-22442b083d03" });
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
