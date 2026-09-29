# Garimaa Fashion Hub: Project Overview

## What This Project Is

Garimaa Fashion Hub is a local-first Indian fashion ecommerce website. Customers can browse clothing products, search and filter the catalogue, view product details, save products to a wishlist, add products to a cart, place orders, track orders, and contact the business through WhatsApp.

The project also contains a client-side demo admin area for managing products, categories, and orders.

The application currently stores its data in the browser using `localStorage`. It does not yet use a production database, real authentication, or a connected payment gateway.

## Main Product Categories

- Sarees
- Kurtis
- Lehengas
- Dresses
- Dupattas
- Kidswear
- Western wear

## Technology Stack

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- React Query
- Vite
- Tailwind CSS 4
- Radix UI components
- Lucide React icons
- React Hook Form and Zod validation
- Sonner toast notifications

## How the Application Works

The app is a single web application with two main areas:

1. The customer storefront under the shop routes.
2. The demo admin dashboard under `/admin`.

Initial products and categories are defined as seed data. The global `ShopProvider` manages products, categories, orders, cart items, wishlist items, and admin-related state. This state is persisted in the browser using the `gfh.state.v1` localStorage key.

Prices are displayed in Indian rupees. Shipping is configured in the application settings, and orders are created locally in the browser. Payment status remains pending because Razorpay or another payment provider is not connected.

WhatsApp ordering uses the business phone number configured in `src/lib/config.ts`.

## Customer Routes

| Route | Purpose |
|---|---|
| `/` | Homepage with hero section, categories, featured products, and new arrivals |
| `/categories` | Browse active product categories |
| `/category/:slug` | Browse products within one category with filtering and sorting |
| `/search?q=...` | Search products by name, description, or category |
| `/new-arrivals` | Browse products marked as new arrivals |
| `/product/:id` | Product details, gallery, variants, quantity, wishlist, cart, WhatsApp ordering, and related products |
| `/wishlist` | View and manage saved products |
| `/cart` | Review cart items, change quantities, remove products, see totals, and proceed to checkout |
| `/checkout` | Enter customer and delivery information and create an order |
| `/order-success/:id` | View the confirmation and summary for a created order |
| `/track-order` | Find an order using its order number and phone number or email |
| `/about` | About the business |
| `/contact` | Contact information and contact options |
| `/shipping-policy` | Shipping policy |
| `/refund-policy` | Refund and return policy |
| `/terms` | Terms and conditions |

## Admin Routes

The admin area uses backend authentication. Set your private credentials in `backend/.env`:

```env
ADMIN_USERNAME=your-private-username
ADMIN_PASSWORD=your-private-password
```

Never commit those values or display them in the frontend. Product create, update, and delete API
operations require the admin JWT issued after login.

Admin features include:

- Dashboard statistics for products, categories, orders, revenue, and low stock
- Product search and management
- Product fields for category, price, discount price, stock, images, sizes, colors, active state, featured state, and new-arrival state
- Category creation and management
- Order inspection
- Updating order status and payment status
- Adding tracking numbers

## Important Source Files

### Application Entry and Routing

- `src/router.tsx`: Creates the application router.
- `src/routeTree.gen.ts`: Generated TanStack route tree.
- `src/routes/__root.tsx`: Root layout and application-level setup.
- `src/routes/_shop.tsx`: Customer storefront layout.
- `src/routes/admin.tsx`: Admin layout and demo access gate.

### Reusable UI

- `src/components/SiteHeader.tsx`: Store navigation and header.
- `src/components/SiteFooter.tsx`: Store footer.
- `src/components/CatalogBrowser.tsx`: Product catalogue browsing behavior.
- `src/components/ProductCard.tsx`: Product tile used in grids.
- `src/components/ProductGrid.tsx`: Product grid layout.
- `src/components/ProductFilters.tsx`: Catalogue filters.
- `src/components/WhatsAppButton.tsx`: WhatsApp action button.
- `src/components/PolicyPage.tsx`: Shared policy page layout.
- `src/components/ui/`: Radix-based reusable UI components.

### Data, State, and Configuration

- `src/data/seed.ts`: Initial product and category data.
- `src/lib/types.ts`: Core domain types such as `Product`, `Category`, `CartItem`, and `Order`.
- `src/lib/store.tsx`: Global shop state, cart actions, wishlist actions, order creation, and localStorage persistence.
- `src/lib/config.ts`: Currency, shipping, business contact, and WhatsApp configuration.
- `src/lib/whatsapp.ts`: WhatsApp message and URL helpers.

## Current Limitations and Production Work Needed

This is currently a frontend-focused local demo. Before using it as a real ecommerce business, it would need:

- A production database and deployment configuration
- HTTPS, secure secret storage, and secret rotation for admin authentication
- Server-side order creation and validation
- Real inventory locking and stock updates
- A real payment integration such as Razorpay or Stripe
- Secure storage for customer information
- Production-grade order tracking and notifications
- Image upload and storage handling
- Server-side validation for all customer and admin actions
- Deployment configuration and environment variables
- Automated tests for checkout, inventory, authentication, and order workflows

## How to Run Locally

Requirements:

- Node.js
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The local development URL is usually:

```text
http://127.0.0.1:5173/
```

Available scripts:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run build:dev # Create a development-mode build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
npm run format    # Format project files with Prettier
```

## Useful Questions to Ask ChatGPT About This Project

When sharing this file with ChatGPT, you can ask questions such as:

- Explain the complete checkout flow.
- Explain how products, cart items, wishlist items, and orders are stored.
- Identify what must change to connect this app to Supabase or another database.
- Convert the demo admin login into secure authentication.
- Add Razorpay payment processing.
- Find security risks in the current localStorage-based architecture.
- Explain how to deploy this TanStack Start application.
- Add automated tests for cart, checkout, and order tracking.
- Improve the mobile shopping experience.
- Explain any source file in simple terms.

## Short Summary

Garimaa Fashion Hub is a React and TanStack Start fashion store prototype. It provides a complete browsing-to-order customer flow and a local demo admin dashboard, but its data and authentication are currently browser-only. The next major step for production use is adding a secure backend, database, authentication, payment processing, and server-side order management.