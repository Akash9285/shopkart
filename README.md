# ShopKart — MERN E-commerce Marketplace (Meesho-style)

A full-stack e-commerce marketplace built with MongoDB, Express, React, and Node.js.

> Note: This replicates Meesho's **functionality** (marketplace catalog, cart, checkout,
> address book, order tracking, seller/admin product upload, admin dashboard) but uses an
> original name/brand and does not use Meesho's logo, trademarked name, or copyrighted
> design assets. Rename freely.

## Features

**Customer side**
- Register/Login (JWT auth)
- Browse/search/filter products by category, price, rating
- Product detail page with size/color variants, reviews
- Cart (add/update/remove items)
- Multiple saved addresses, add new address at checkout
- Place order (Cash on Delivery) → Order Summary page
- Order history + order status tracking + cancel order

**Seller / Admin panel** (`/admin`)
- Dashboard: total orders, products, customers, revenue, orders-by-status (admin only)
- Upload product: title, description, category, price, MRP, multiple images, size/color/stock variants
- Manage own products: hide/show, delete
- Orders: view all orders, update order status (Placed → Confirmed → Shipped → Out for
  Delivery → Delivered / Cancelled / Returned)

## Tech stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth, Multer (image uploads)
- Frontend: React 18, React Router, Axios, Vite

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env       # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run dev                 # requires MongoDB running locally (or set MONGO_URI to Atlas)
```
Runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 (proxies /api and /uploads to the backend)

### 3. Create your first admin
There's no public "become admin" button (by design — customers can only register as
`customer` or `seller`). To make a user a full **admin** (dashboard + all orders access),
either:
- Register normally, then in MongoDB shell / Compass set that user's `role` to `admin`, or
- Insert directly, e.g.:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
Sellers (role: seller, chosen at registration) can already upload/manage their own
products and see the Orders tab, but the Dashboard stats endpoint is admin-only.

## Folder structure
```
backend/
  models/       Mongoose schemas: User, Product, Order, Cart
  routes/       authRoutes, productRoutes, cartRoutes, addressRoutes, orderRoutes, adminRoutes
  middleware/   auth (JWT + role guards), upload (Multer)
  uploads/      product images saved here, served at /uploads/<file>
  server.js
frontend/
  src/pages/            Home, ProductDetail, Login, Register, Cart, Checkout, OrderSummary, MyOrders
  src/pages/admin/       AdminLayout, AdminDashboard, ProductUpload, ProductList, AdminOrders
  src/context/           AuthContext, CartContext
  src/components/        Navbar, ProductCard, ProtectedRoute
  src/api/axios.js       shared axios instance with auth token header
```

## What to extend next
- Real payment gateway (Razorpay/Stripe) instead of COD-only
- Image storage on S3/Cloudinary instead of local disk
- Wishlist, coupons, product Q&A
- Pagination UI on the product grid (API already supports page/limit)
- Email/SMS order notifications
