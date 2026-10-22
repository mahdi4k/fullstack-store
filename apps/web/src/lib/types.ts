/**
 * TypeScript contracts for the NestJS API responses.
 * Mirrors `apps/api` Prisma schema + service `select` shapes.
 */

export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  icon?: string | null;
  description?: string | null;
  categoryCount?: number;
  products?: Product[];
  _count?: { products: number };
}

export type ProductType = "PRODUCT" | "SERVICE_KIT";

export interface Product {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  brand?: string | null;
  discountPercent?: number;
  serviceType?: ProductType;
  compatibleVehicles?: string[];
  imageUrl?: string | null;
  categoryId?: number | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string; slug?: string | null; description?: string | null } | null;
  _count?: { reviews: number };
  /** City-scoped pricing injected by the API when `city=` is passed. */
  cityPrice?: number | null;
  cityStock?: number | null;
  /** price or cityPrice with discountPercent applied, in Toman. */
  finalPrice?: number;
  hasInstallationService?: boolean;
}

export interface ProductDetail extends Product {
  averageRating: number | null;
  reviewsCount: number;
  reviews: Review[];
}

/** Cart item as returned by `GET /cart` (includes computed `total`). */
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  total: number;
  product: Pick<
    Product,
    "id" | "name" | "price" | "imageUrl" | "stock"
  >;
}

/** Cart response with computed totals. */
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: { id: number; name: string; imageUrl?: string | null; price?: number };
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  discountAmount?: number;
  couponId?: number | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: { id: number; email: string; name?: string | null };
}

export interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  userId: number;
  productId: number;
  createdAt: string;
  user?: { id: number; name?: string | null; email?: string };
}

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: string;
  _count: { orders: number; reviews: number };
}

/** Standard paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Auth payloads for register/login. */
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

/** Query params supported by `GET /products`. */
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
  /** Marketplace filters (city-scoped storefront). */
  city?: string;
  category?: string;
  vehicle?: string;
  brand?: string;
  type?: ProductType;
}

/* Marketplace (Tapsi Garage style) contracts. */

export interface City {
  id: number;
  slug: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  link?: string | null;
  sortOrder: number;
}

export interface Vendor {
  id: number;
  name: string;
  address: string;
  rating: number;
  services: string[];
  isActive: boolean;
}

export interface StorefrontCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  productCount: number;
}

export interface StorefrontResponse {
  city: { id: number; slug: string; name: string };
  banners: Banner[];
  categories: StorefrontCategory[];
  bundles: Product[];
  vendors: Vendor[];
  /** Car models that actually have parts in this city (Persian-sorted). */
  vehicles: string[];
}

/** Discount code type: percentage off or fixed Toman amount off. */
export type CouponType = "PERCENT" | "FIXED";

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  /** percent (1-100) or Toman amount, depending on `type`. */
  value: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

/** Result of `POST /coupons/validate` (checkout preview). */
export interface CouponPreview {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  discount: number;
}

/** Admin dashboard overview (`GET /stats`). */
export interface StoreStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalCustomers: number;
  revenue: number;
  lowStockProducts: Product[];
  bestSellers: Array<{
    productId: number;
    name: string;
    quantity: number;
    orders: number;
  }>;
  recentOrders: Order[];
}
