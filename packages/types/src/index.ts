export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  icon?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  products?: Product[];
}

/** Product types: a plain product or a service bundle (e.g. oil-change kit). */
export type ProductType = 'PRODUCT' | 'SERVICE_KIT';

export interface Product {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  brand?: string | null;
  price: number;
  /** Percent off `price` (0–100). Final price = price − discount. */
  discountPercent?: number;
  stock: number;
  imageUrl?: string | null;
  serviceType?: ProductType;
  /** Vehicle model names this product fits, e.g. ["Pride", "Peugeot 206"]. */
  compatibleVehicles?: string[];
  categoryId?: number | null;
  category?: Category | null;
  cityProducts?: CityProduct[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface City {
  id: number;
  slug: string;
  name: string;
  active?: boolean;
  sortOrder?: number;
}

/** City-scoped price/stock override for one product (Toman). */
export interface CityProduct {
  id: number;
  cityId: number;
  city?: City;
  productId: number;
  product?: Product;
  price: number;
  stock: number;
  active: boolean;
}

/** A product enriched with city-scoped pricing info. */
export interface CityProductInfo {
  /** City-specific price in Toman (overrides Product.price). */
  cityPrice: number | null;
  cityStock: number | null;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  link?: string | null;
  cityId?: number | null;
  active?: boolean;
  sortOrder?: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product?: Product;
  quantity: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  userId: number;
  user?: Partial<User>;
  productId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
