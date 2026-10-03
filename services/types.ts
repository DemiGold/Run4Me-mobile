// ─────────────────────────────────────────────────────────────
// Shared domain types
// ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'runner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string | null;
  dob?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  coordinate?: LatLng;
  icon: 'home' | 'briefcase' | 'map-pin';
  isDefault: boolean;
}

export interface ErrandService {
  id: string;
  name: string;
  description: string;
  icon: string;
  tone: 'teal' | 'orange';
}

export type ErrandStatus =
  | 'draft'
  | 'finding_runner'
  | 'runner_assigned'
  | 'en_route_to_store'
  | 'shopping'
  | 'en_route_to_you'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface ErrandItem {
  id: string;
  name: string;
  note?: string;
  quantity: number;
  status?: 'pending' | 'found' | 'substituted' | 'out_of_stock';
  price?: number;            // kobo
  imageUrl?: string | null;
  // When out_of_stock, the backend may suggest a substitute the
  // runner saw on the shelf. The customer approves or rejects it
  // on the shopping-progress screen.
  suggestedSubstitute?: {
    name: string;
    price: number;           // kobo
    imageUrl?: string | null;
  } | null;
}

export interface ErrandLocation {
  address: string;
  coordinate?: LatLng;
}

export interface ErrandDraft {
  serviceType: string;
  store?: string;
  pickup: ErrandLocation;
  dropoff: ErrandLocation;
  items: ErrandItem[];
  budget: number;
  instructions?: string;
  photoCount?: number;
  timeline: 'now' | 'later';
  scheduledFor?: string;
  promoCode?: string;
}

export interface Errand {
  id: string;
  customerId: string;
  serviceType: string;
  status: ErrandStatus;
  pickup: ErrandLocation;
  dropoff: ErrandLocation;
  items: ErrandItem[];
  budget: number;
  instructions?: string;
  timeline: 'now' | 'later';
  scheduledFor?: string;
  runner?: Runner | null;
  payment?: Payment | null;
  promoCode?: string;
  subtotal?: number;
  totalCharged?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Runner {
  id: string;
  name: string;
  rating: number;
  completed: number;
  vehicle: string;
  price: number;
  pickupMins: number;
  shoppingMins?: number;
  avatarUrl?: string | null;
  verified?: boolean;
}

export interface RunnerTracking {
  runnerId: string;
  coordinate: LatLng;
  status: 'en_route_to_store' | 'shopping' | 'en_route_to_you' | 'arrived';
  etaMinutes: number;
  updatedAt: string;
}

export type PaymentMethod = 'wallet' | 'card' | 'bank_transfer' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'confirmed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  errandId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  cardLast4?: string;
  bankDetails?: BankDetails;
  paidAt?: string;
}

export interface BankDetails {
  bank: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
}

export interface WalletBalance {
  balance: number;
  currency: 'NGN';
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  createdAt: string;
}

export type NotificationTone = 'teal' | 'orange' | 'green';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  icon: string;
  tone: NotificationTone;
  time: string;
  needsAction?: boolean;
  actionAmount?: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  from: 'me' | 'runner';
  text: string;
  time: string;
  createdAt: string;
}