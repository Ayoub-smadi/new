import bcrypt from "bcryptjs";
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./auth";
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

import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
    const user = req.user;
    const isAdmin = user?.role === 'admin';
    
    if (!isAdmin) {
      console.log(`Admin access denied for user: ${user?.firstName} ${user?.lastName} (${user?.email})`);
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

  app.post("/api/categories/:id/sub-categories", isAuthenticated, isAdminMiddleware, async (req: Request, res) => {
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

  app.post("/api/admin/import-csv", isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const { categoryName, csvData } = req.body;
      if (!categoryName || !csvData) {
        return res.status(400).json({ message: "Category name and CSV data are required" });
      }

      const cats = await storage.getCategories();
      let category = cats.find(c => c.name === categoryName);
      if (!category) {
        category = await storage.createCategory({
          name: categoryName,
          description: `تصنيف تم استيراده: ${categoryName}`,
          imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"
        });
      }

      const lines = csvData.split("\n").filter((line: string) => line.trim() !== "");
      const dataLines = lines.slice(1); // Skip header

      const subCategoriesMap = new Map();
      const existingSubCats = await storage.getSubCategories(category.id);
      existingSubCats.forEach(s => subCategoriesMap.set(s.name, s.id));

      let importedCount = 0;

      for (const line of dataLines) {
        const parts = line.split(",");
        if (parts.length < 4) continue;

        const name = parts[0].trim();
        const subCatName = parts[1].trim();
        const priceStr = parts[2].trim();
        const stockStr = parts[3].trim();

        let subCatId = subCategoriesMap.get(subCatName);
        if (!subCatId) {
          const subCat = await storage.createSubCategory({
            name: subCatName,
            categoryId: category.id,
            description: `بذور من فئة ${subCatName}`
          });
          subCatId = subCat.id;
          subCategoriesMap.set(subCatName, subCatId);
        }

        const stock = parseInt(stockStr) || 10;
        await storage.createProduct({
          name: name,
          categoryId: category.id,
          subCategoryId: subCatId,
          description: `بذور ${name} عالية الجودة`,
          price: priceStr,
          stock: stock,
          imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
          isFeatured: false,
          rating: "0.0",
          reviewsCount: 0
        });
        importedCount++;
      }

      res.json({ message: `تم استيراد ${importedCount} منتج بنجاح` });
    } catch (err: any) {
      console.error("Import error:", err);
      res.status(500).json({ message: err.message || "فشل عملية الاستيراد" });
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
    const user = req.user;
    const isAdmin = user?.role === 'admin';
    
    const { all } = req.query;
    const orders = await storage.getOrders((all === 'true' && isAdmin) ? undefined : user.id);
    res.json(orders);
  });

  app.get(api.orders.get.path, isAuthenticated, async (req: any, res) => {
    const order = await storage.getOrder(req.params.id as string);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const user = req.user;
    const isAdmin = user?.role === 'admin';
    
    if (order.userId !== user.id && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(order);
  });

  app.post(api.orders.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user.id;
      
      const orderData = {
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        regionId: req.body.regionId
      };
      
      const order = await storage.createOrder(userId, orderData, input.items, req.body.regionId);
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
      const userId = req.user.id;
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

  // SHIPPING RATES
  app.get("/api/shipping-rates", async (req, res) => {
    const rates = await storage.getShippingRates();
    res.json(rates);
  });

  app.post("/api/shipping-rates", isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const rate = await storage.createShippingRate(req.body);
      res.status(201).json(rate);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/shipping-rates/:id", isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const rate = await storage.updateShippingRate(req.params.id, req.body);
      res.json(rate);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/shipping-rates/:id", isAuthenticated, isAdminMiddleware, async (req, res) => {
    await storage.deleteShippingRate(req.params.id);
    res.status(204).end();
  });

  // SITE SETTINGS
  app.get("/api/site-settings", async (req, res) => {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  });

  app.get("/api/site-settings/:key", async (req, res) => {
    const setting = await storage.getSiteSetting(req.params.key);
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    res.json(setting);
  });

  app.post("/api/site-settings", isAuthenticated, isAdminMiddleware, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      const setting = await storage.updateSiteSetting(key, value);
      res.json(setting);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Call seed database
  try {
    await seedDatabase();
    await seedSiteSettings();
  } catch (err) {
    console.error("Seeding error:", err);
  }

  return httpServer;
}

export async function seedSiteSettings() {
  const defaultSettings = [
    { key: "home_hero_title", value: "مروج لاند لخدمات الزراعة", description: "العنوان الرئيسي في الصفحة الرئيسية" },
    { key: "home_hero_subtitle", value: "كل ما تحتاجه لحديقتك في مكان واحد", description: "العنوان الفرعي في الصفحة الرئيسية" },
    { key: "about_content", value: "مروج لاند هي شركتكم الرائدة في تقديم الحلول الزراعية المتكاملة...", description: "محتوى صفحة من نحن" },
    { key: "contact_email", value: "info@murooj.com", description: "بريد التواصل" },
    { key: "contact_phone", value: "+962 000 000 000", description: "رقم الهاتف" },
  ];

  for (const setting of defaultSettings) {
    const existing = await storage.getSiteSetting(setting.key);
    if (!existing) {
      await storage.updateSiteSetting(setting.key, setting.value);
    }
  }
}

export async function seedDatabase() {
  const adminEmail = "admin@murooj.com";
  const customerEmail = "customer@murooj.com";
  
  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createUser({
      email: adminEmail,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    console.log("Admin user seeded: admin@murooj.com / admin123");
  } else {
    // Force update password to be sure
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.email, adminEmail));
    console.log("Admin password updated during seed");
  }

  const existingCustomer = await storage.getUserByEmail(customerEmail);
  if (!existingCustomer) {
    const hashedPassword = await bcrypt.hash("customer123", 10);
    await storage.createUser({
      email: customerEmail,
      password: hashedPassword,
      firstName: "Customer",
      lastName: "User",
      role: "user",
    });
    console.log("Customer user seeded: customer@murooj.com / customer123");
  } else {
    // Force update password to be sure
    const hashedPassword = await bcrypt.hash("customer123", 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.email, customerEmail));
    console.log("Customer password updated during seed");
  }

  const cats = await storage.getCategories();

  // If no products in "بذور" category, we could seed them here, 
  // but since we already ran the script and Replit DB is persistent, 
  // they are already there. To make it "permanent" even on new deploys,
  // we could keep the script or a JSON version.
  
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
