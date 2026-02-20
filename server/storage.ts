import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { 
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  reviews, type Review, type InsertReview,
  users,
  nurseryGallery, type NurseryGallery, type InsertNurseryGallery
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Products
  getProducts(categoryId?: string, search?: string, featured?: boolean): Promise<(Product & { category: Category })[]>;
  getProduct(id: string): Promise<(Product & { category: Category }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrders(userId?: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(userId: string, orderData: Omit<InsertOrder, "userId" | "totalAmount" | "status">, items: {productId: string, quantity: number}[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Reviews
  getProductReviews(productId: string): Promise<(Review & { user: typeof users.$inferSelect })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Nursery Gallery
  getNurseryGallery(): Promise<NurseryGallery[]>;
  createNurseryItem(item: InsertNurseryGallery): Promise<NurseryGallery>;
  deleteNurseryItem(id: string): Promise<void>;
  
  // Admin Stats
  getAdminStats(): Promise<{ totalProducts: number, totalUsers: number, totalOrders: number, totalRevenue: number, lowStockProducts: number }>;
}

export class DatabaseStorage implements IStorage {
  async getCategories() {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory) {
    const [cat] = await db.insert(categories).values(category).returning();
    return cat;
  }

  async deleteCategory(id: string) {
    // Delete products first
    await db.delete(products).where(eq(products.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getProducts(categoryId?: string, search?: string, featured?: boolean) {
    let query = db.select({
      product: products,
      category: categories
    }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));

    const conditions = [];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (featured !== undefined) conditions.push(eq(products.isFeatured, featured));

    if (conditions.length > 0) {
      const finalQuery = conditions.reduce((acc, condition) => and(acc, condition)!);
      const results = await query.where(finalQuery);
      return results.map(r => ({ ...r.product, category: r.category }));
    }

    const results = await query;
    return results.map(r => ({ ...r.product, category: r.category }));
  }

  async getProduct(id: string) {
    const results = await db.select({
      product: products,
      category: categories
    }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id));

    if (results.length === 0) return undefined;
    return { ...results[0].product, category: results[0].category };
  }

  async createProduct(product: InsertProduct) {
    const [p] = await db.insert(products).values(product).returning();
    return p;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>) {
    const [p] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return p;
  }

  async deleteProduct(id: string) {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(userId?: string) {
    const query = db.query.orders.findMany({
      where: userId ? eq(orders.userId, userId) : undefined,
      with: {
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)]
    });
    return (await query) as any;
  }

  async getOrder(id: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: {
          with: {
            product: true
          }
        }
      }
    });
    return order as any;
  }

  async createOrder(userId: string, orderData: Omit<InsertOrder, "userId" | "totalAmount" | "status">, items: {productId: string, quantity: number}[]) {
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!product || product.stock < item.quantity) {
        throw new Error(`المنتج ${product?.name || item.productId} نفذت كميته أو لا يتوفر بالكمية المطلوبة`);
      }
      
      const price = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
      totalAmount += price * item.quantity;
      
      orderItemsToInsert.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: price.toString()
      });
      
      // Deduct stock
      await db.update(products)
        .set({ stock: product.stock - item.quantity })
        .where(eq(products.id, product.id));
    }

    const [order] = await db.insert(orders).values({
      ...orderData,
      userId,
      totalAmount: totalAmount.toString(),
      status: "processing"
    }).returning();

    for (const item of orderItemsToInsert) {
      await db.insert(orderItems).values({
        ...item,
        orderId: order.id
      });
    }

    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getProductReviews(productId: string) {
    return await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: true
      },
      orderBy: [desc(reviews.createdAt)]
    }) as any;
  }

  async createReview(review: InsertReview) {
    const [r] = await db.insert(reviews).values(review).returning();
    
    // Update product rating
    const allReviews = await db.select().from(reviews).where(eq(reviews.productId, review.productId));
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewsCount: allReviews.length
    }).where(eq(products.id, review.productId));

    return r;
  }

  async getNurseryGallery() {
    return await db.select().from(nurseryGallery);
  }

  async createNurseryItem(item: InsertNurseryGallery) {
    const [res] = await db.insert(nurseryGallery).values(item).returning();
    return res;
  }

  async deleteNurseryItem(id: string) {
    await db.delete(nurseryGallery).where(eq(nurseryGallery.id, id));
  }

  async getAdminStats() {
    const [productsCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    
    const [revenue] = await db.select({ total: sql<number>`sum(CAST(${orders.totalAmount} AS NUMERIC))` }).from(orders).where(eq(orders.status, 'delivered'));
    
    const [lowStock] = await db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} < 5`);

    return {
      totalProducts: Number(productsCount?.count || 0),
      totalUsers: Number(usersCount?.count || 0),
      totalOrders: Number(ordersCount?.count || 0),
      totalRevenue: Number(revenue?.total || 0),
      lowStockProducts: Number(lowStock?.count || 0)
    };
  }
}

export const storage = new DatabaseStorage();
