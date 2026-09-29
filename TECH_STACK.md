# Garimaa Fashion Hub - Technology Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack React Query
- Vite
- Tailwind CSS 4
- Radix UI
- Lucide React for icons
- React Hook Form
- Zod for form validation
- Sonner for toast notifications
- Embla Carousel
- Recharts
- date-fns

## Backend

- Node.js
- Express 5
- JavaScript with CommonJS modules
- Mongoose
- MongoDB Atlas
- Multer for image uploads
- bcryptjs for password hashing
- JSON Web Tokens (JWT) for authentication
- CORS
- Helmet
- express-rate-limit
- express-mongo-sanitize
- dotenv

## Database

- MongoDB Atlas
- Mongoose models for:
  - Users
  - Products
  - Orders
  - Cart data
  - Wishlists

## Payments

- Razorpay
- Razorpay Checkout on the frontend
- Razorpay order and payment APIs on the backend

## Authentication

- Customer registration and login
- JWT-based authentication
- bcryptjs password hashing
- Admin authentication
- Custom Gmail-address login validation

> The Gmail login flow is a custom application flow. It is not full Google OAuth authentication.

## File Storage

- Local filesystem storage for product images
- Multer handles image uploads
- Uploaded images are served through the `/uploads` endpoint

## Development and Quality Tools

- ESLint
- Prettier
- TypeScript strict mode
- Vite development server
- Custom Node.js backend tests
- Production builds with Vite
- Nitro build and server tooling

## Project Configuration

- Environment variables managed with dotenv
- `@/*` TypeScript path alias mapped to `src/*`
- TanStack Start and Nitro-compatible project structure
- Lovable-compatible project configuration

## Main Project Scripts

### Frontend

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format
```

### Backend

```bash
cd backend
npm test
node server.js
```

## Security Notes

- Keep `.env` files out of Git.
- Never publish MongoDB connection strings, JWT secrets, admin passwords, or payment secrets.
- Rotate any credentials that have been exposed or shared.
- Use separate credentials for development and production.
- Configure the frontend API URL with `VITE_API_URL` when deploying.
