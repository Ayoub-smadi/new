import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subCategories = pgTable("sub_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  subCategoryId: varchar("sub_category_id").references(() => subCategories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  isFeatured: boolean("is_featured").default(false),
  rating: numeric("rating", { precision: 2, scale: 1 }).default('0'),
  reviewsCount: integer("reviews_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  customerName: text("customer_name").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  status: text("status").notNull().default("processing"), // processing, shipped, delivered, cancelled
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAmount: numeric("shipping_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  shippingAddress: text("shipping_address").notNull(),
  regionId: varchar("region_id").references(() => shippingRates.id),
  paymentMethod: text("payment_method").notNull(), // cod, card
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nurseryGallery = pgTable("nursery_gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  type: text("type").notNull(), // 'plant' or 'branch'
  category: text("category").default('عام'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subCategory: one(subCategories, {
    fields: [products.subCategoryId],
    references: [subCategories.id],
  }),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  subCategories: many(subCategories),
}));

export const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const nurseryGalleryRelations = relations(nurseryGallery, ({ many }) => ({
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  region: one(shippingRates, {
    fields: [orders.regionId],
    references: [shippingRates.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const shippingRates = pgTable("shipping_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  region: text("region").notNull(),
  governorates: text("governorates").notNull(),
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  locationUrl: text("location_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const branchesRelations = relations(branches, ({}) => ({}));

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Base Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertSubCategorySchema = createInsertSchema(subCategories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products, {
  additionalImages: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, rating: true, reviewsCount: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertNurseryGallerySchema = createInsertSchema(nurseryGallery, {
  additionalImages: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true });
export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true });
export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type SubCategory = typeof subCategories.$inferSelect;
export type InsertSubCategory = z.infer<typeof insertSubCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type NurseryGallery = typeof nurseryGallery.$inferSelect;
export type InsertNurseryGallery = z.infer<typeof insertNurseryGallerySchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Request Types
export type CreateOrderRequest = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: "cod" | "card";
  notes?: string;
  regionId?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

export type UpdateOrderStatusRequest = {
  status: "processing" | "shipped" | "delivered" | "cancelled";
};

export type AddReviewRequest = {
  rating: number;
  comment?: string;
};

// Response Types
export type ProductWithCategoryResponse = Product & { category: Category };
export type OrderWithItemsResponse = Order & { 
  items: (OrderItem & { product: Product })[] 
};
export type ReviewWithUserResponse = Review & { user: typeof users.$inferSelect };

// Enums
export const OrderStatusEnum = z.enum(["processing", "shipped", "delivered", "cancelled"]);
export const PaymentMethodEnum = z.enum(["cod", "card"]);
