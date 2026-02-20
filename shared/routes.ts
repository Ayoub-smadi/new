import { z } from 'zod';
import { 
  insertCategorySchema, 
  insertProductSchema, 
  insertNurseryGallerySchema,
  OrderStatusEnum,
  PaymentMethodEnum,
  categories,
  products,
  orders,
  reviews,
  nurseryGallery,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

// Schema for complex nested order creation
const createOrderRequestSchema = z.object({
  shippingAddress: z.string().min(1, "Shipping address is required"),
  paymentMethod: PaymentMethodEnum,
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive()
  })).min(1, "Cart cannot be empty")
});

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        featured: z.string().optional(), // 'true' or 'false' string from query
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect & { category: typeof categories.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect & { category: typeof categories.$inferSelect }>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const, // Admin lists all, user lists theirs
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { items: any[] }>()),
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: {
        200: z.custom<typeof orders.$inferSelect & { items: any[] }>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: createOrderRequestSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: OrderStatusEnum }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  reviews: {
    listByProduct: {
      method: 'GET' as const,
      path: '/api/products/:id/reviews' as const,
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { user: typeof users.$inferSelect }>()),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:id/reviews' as const,
      input: z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound, // If product not found
      }
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalProducts: z.number(),
          totalUsers: z.number(),
          totalOrders: z.number(),
          totalRevenue: z.number(),
          lowStockProducts: z.number()
        }),
        401: errorSchemas.unauthorized
      }
    }
  },
  nursery: {
    list: {
      method: 'GET' as const,
      path: '/api/nursery' as const,
      responses: {
        200: z.array(z.custom<typeof nurseryGallery.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/nursery' as const,
      input: insertNurseryGallerySchema,
      responses: {
        201: z.custom<typeof nurseryGallery.$inferSelect>(),
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/nursery/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
