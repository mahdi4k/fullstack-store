# My Store API

A full-featured e-commerce backend built with **NestJS 12**, **Prisma ORM 7**, and **PostgreSQL**.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**:
  - JWT-based authentication (`@nestjs/jwt`, `passport-jwt`)
  - Password hashing with `bcrypt`
  - Role-based Access Control (RBAC): `CUSTOMER` and `ADMIN` roles
  - User profile management
- 📁 **Categories Management**:
  - Full category CRUD
  - Nested product associations
- 🛍️ **Products Catalog**:
  - Search by keyword (`name`, `description`)
  - Filter by `categoryId`, price range (`minPrice`, `maxPrice`), and stock status (`inStock`)
  - Sorting (`createdAt`, `price`, `name` in `asc` / `desc`)
  - Pagination with total count and page metadata
  - Aggregated ratings and review statistics
- 🛒 **Shopping Cart**:
  - Persistent user cart
  - Add to cart with real-time inventory validation
  - Adjust quantities or remove items
  - Dynamic subtotal and item count calculations
- 📦 **Orders & Checkout**:
  - Atomic transactions (`$transaction`) preventing overselling
  - Automatic stock decrement upon checkout
  - Empty cart cleanup on successful checkout
  - Support for direct checkout ("Buy Now") or cart-based checkout
  - Customer order cancellation with automatic stock restoration
  - Admin order and payment status management (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
- ⭐ **Reviews & Ratings**:
  - Customers can review products with 1–5 star ratings and comments
  - Author and Admin review deletion permissions
- 📖 **Interactive API Documentation**:
  - Swagger / OpenAPI UI at `/api/docs`
- 🛡️ **Validation & Security**:
  - Strict input validation via `class-validator` and `class-transformer`
  - CORS enabled

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Ensure your `.env` contains your database connection:
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 3. Sync Database & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 4. Seed Initial Data
Seeds default categories, products, and test accounts:
```bash
npm run seed
```

**Pre-seeded accounts:**
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@store.com` | `admin123` |
| **Customer** | `customer@store.com` | `customer123` |

### 5. Run the Server
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Swagger API documentation is accessible at:
👉 **`http://localhost:3000/api/docs`**

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end (E2E) integration tests
npm run test:e2e

# Lint check
npm run lint
```

---

## 📚 API Endpoints Summary

### Auth
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and get JWT token
- `GET /auth/profile` - Current user profile *(Authenticated)*
- `PATCH /auth/profile` - Update profile *(Authenticated)*

### Categories
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category with products
- `POST /categories` - Create category *(Admin)*
- `PATCH /categories/:id` - Update category *(Admin)*
- `DELETE /categories/:id` - Delete category *(Admin)*

### Products
- `GET /products` - Browse products with filters & pagination
- `GET /products/:id` - Product details, reviews, and average rating
- `POST /products` - Create product *(Admin)*
- `PATCH /products/:id` - Update product *(Admin)*
- `DELETE /products/:id` - Delete product *(Admin)*

### Cart
- `GET /cart` - View current user cart & subtotals *(Authenticated)*
- `POST /cart/items` - Add item to cart *(Authenticated)*
- `PATCH /cart/items/:id` - Update cart item quantity *(Authenticated)*
- `DELETE /cart/items/:id` - Remove item from cart *(Authenticated)*
- `DELETE /cart` - Clear entire cart *(Authenticated)*

### Orders
- `POST /orders/checkout` - Checkout cart or direct items *(Authenticated)*
- `GET /orders` - View order history *(Authenticated)*
- `GET /orders/:id` - Order details *(Authenticated)*
- `PATCH /orders/:id/cancel` - Cancel pending order & restore stock *(Authenticated)*
- `GET /orders/admin/all` - List all orders across users *(Admin)*
- `PATCH /orders/admin/:id/status` - Update order and payment status *(Admin)*

### Reviews
- `POST /products/:productId/reviews` - Post a review *(Authenticated)*
- `GET /products/:productId/reviews` - View reviews for a product
- `DELETE /reviews/:id` - Delete review *(Author or Admin)*

### Users (Admin)
- `GET /users` - List all users with pagination *(Admin)*
- `GET /users/:id` - View user details and recent orders *(Admin)*
- `PATCH /users/:id/role` - Change user role *(Admin)*
