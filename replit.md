# Overview

This is an Arabic-language (RTL) e-commerce web application for selling agricultural supplies — including ornamental plants, fruit trees, seeds, fertilizers, farming tools, and irrigation systems. The store is branded as "مشاتل القادري" (Al-Qadri Nurseries). It features a product catalog with categories, shopping cart, checkout flow, order management, product reviews, a nursery gallery, and an admin dashboard.

# User Preferences

Preferred communication style: Simple, everyday language.
Admin Credentials: Username: Ayoub, Password: Ayoub@123

# System Architecture

## Full-Stack Structure

The project follows a monorepo pattern with three top-level code directories:

- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

## Frontend (`client/src/`)

- **Framework:** React with TypeScript, bundled by Vite
- **Routing:** `wouter` (lightweight client-side router)
- **State Management:** React Context for shopping cart (`CartProvider`), React Query (`@tanstack/react-query`) for server state
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling:** Tailwind CSS with CSS variables for theming, Cairo font for Arabic text
- **RTL Support:** Full right-to-left layout via `dir="rtl"` on the root HTML element and RTL-aware CSS
- **Animations:** Framer Motion for transitions and hover effects
- **Forms:** React Hook Form with Zod validation (`@hookform/resolvers`)
- **Key Pages:**
  - Home (hero, featured products, categories)
  - Products listing with filtering (by category, search, featured)
  - Product detail page
  - Cart (persisted to localStorage)
  - Checkout (shipping address, payment method selection: COD or card)
  - Dashboard (user orders + admin product/order management)
  - Nursery gallery page
  - About and Contact placeholder pages

## Backend (`server/`)

- **Framework:** Express.js on Node.js with TypeScript (run via `tsx`)
- **API Design:** RESTful JSON API under `/api/*` prefix, route definitions shared between client and server via `shared/routes.ts`
- **Authentication:** Replit Auth (OpenID Connect via `openid-client` + Passport.js), session-based with `express-session` stored in PostgreSQL via `connect-pg-simple`
- **Authorization:** Admin check for email "Ayoub"
- **Key API Endpoints:**
  - `GET/POST /api/categories` — list and create categories
  - `GET/POST /api/products` — list (with filters) and create products
  - `GET /api/products/:id` — get single product
  - `GET/POST /api/orders` — list and create orders
  - `PATCH /api/orders/:id/status` — update order status
  - `GET/POST/DELETE /api/nursery` — nursery gallery CRUD
  - `GET /api/admin/stats` — admin dashboard statistics
  - `GET /api/auth/user` — get current authenticated user

## Database

- **Database:** PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM:** Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location:** `shared/schema.ts` and `shared/models/auth.ts`
- **Key Tables:**
  - `users` — user accounts (managed by Replit Auth)
  - `sessions` — session storage for authentication (mandatory for Replit Auth)
  - `categories` — product categories
  - `products` — product listings with price, stock, ratings, featured flag
  - `orders` — customer orders with status tracking
  - `order_items` — line items within orders
  - `reviews` — product reviews linked to users
  - `nursery_gallery` — nursery showcase items
- **Migrations:** Managed via `drizzle-kit push` (schema push approach, not migration files)

## Build System

- **Development:** `npm run dev` runs `tsx server/index.ts` which sets up Vite dev server as middleware for HMR
- **Production Build:** `npm run build` runs a custom build script (`script/build.ts`) that:
  1. Builds the client with Vite (output to `dist/public/`)
  2. Bundles the server with esbuild (output to `dist/index.cjs`)
- **Production Start:** `npm start` runs `node dist/index.cjs`
- **Database Schema Push:** `npm run db:push` syncs schema to database

## Shared Code (`shared/`)

- `schema.ts` — Drizzle table definitions, Zod insert schemas, TypeScript types
- `models/auth.ts` — User and session table definitions (required for Replit Auth)
- `routes.ts` — API route definitions with paths, methods, Zod input/output schemas — used by both frontend hooks and backend route handlers for type safety

# External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable
- **Replit Auth (OpenID Connect)** — Authentication provider, uses `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables
- **Unsplash** — Used for placeholder agricultural images (external image URLs, no API key needed)
- **Google Fonts** — Cairo font for Arabic typography, plus DM Sans and other fonts loaded via CDN
- **Key npm packages:** express, drizzle-orm, passport, openid-client, connect-pg-simple, react, wouter, @tanstack/react-query, framer-motion, recharts, zod, react-hook-form, shadcn/ui (Radix UI primitives), tailwindcss