// ─────────────────────────────────────────────────────────────
// Mock fixtures
//
// Data that services/api/* returns while USE_MOCK is true.
// Delete this folder when the backend ships — nothing else
// references it.
//
// User state is MUTABLE:
//   - The SEED_* constants below are the starting point.
//   - getMockUser() / setMockUser() / resetMockUser() read and
//     write the "current user" that mock endpoints return.
//   - Signup writes here; verifyOtp / getMe / updateMe read here.
//   - Resets on app reload — fine for mock mode.
//
// Every other mock endpoint (errands, notifications, wallet)
// should read the current user's id from getMockUser().id rather
// than the hardcoded 'cust-1' where relevant.
// ─────────────────────────────────────────────────────────────

import type {
  AppNotification,
  Errand,
  ErrandService,
  Runner,
  SavedAddress,
  User,
  WalletTransaction,
} from '@/services/types';

// ═══ User seeds ═══

/** Default customer. Also the state we reset to on logout. */
export const MOCK_CUSTOMER: User = {
  id: 'cust-1',
  name: 'Adaaez Nwosu',
  email: 'adaaez.nwosu@gmail.com',
  phone: '+2348123456789',
  role: 'customer',
  avatarUrl: null,
  dob: '1995-04-12',
  createdAt: '2025-10-01T10:00:00Z',
};

export const MOCK_RUNNER_USER: User = {
  id: 'run-1',
  name: 'David Adeyemi',
  email: 'david.adeyemi@gmail.com',
  phone: '+2348034567890',
  role: 'runner',
  avatarUrl: null,
  dob: '1993-05-28',
  createdAt: '2025-08-15T08:00:00Z',
};

// ═══ Mutable current user ═══
//
// This is the single source of truth for "who is signed in" while
// USE_MOCK is true. Mock endpoints MUST use these accessors instead
// of reading MOCK_CUSTOMER directly, otherwise a freshly signed-up
// user gets clobbered by the seed on every getMe / verifyOtp call.

let currentUser: User = { ...MOCK_CUSTOMER };

/** Read the currently signed-in user. Safe to call anywhere. */
export const getMockUser = (): User => currentUser;

/** Patch the current user in place. Returns the updated object. */
export const setMockUser = (patch: Partial<User>): User => {
  currentUser = { ...currentUser, ...patch };
  return currentUser;
};

/** Replace the current user wholesale — used by signup. */
export const hydrateMockUser = (user: User): User => {
  currentUser = { ...user };
  return currentUser;
};

/** Reset back to the seed customer — call from authStore.logout(). */
export const resetMockUser = (): User => {
  currentUser = { ...MOCK_CUSTOMER };
  return currentUser;
};

// ═══ Errand services ═══

export const MOCK_SERVICES: ErrandService[] = [
  { id: 'shop-for-me',     name: 'Shop for Me',       description: 'We buy what you need & deliver',       icon: 'shopping-bag', tone: 'teal' },
  { id: 'pick-up-deliver', name: 'Pick Up & Deliver', description: 'Swift delivery from A to B',           icon: 'package',      tone: 'orange' },
  { id: 'run-errand',      name: 'Run an Errand',     description: 'Custom tasks, bank runs & filings',    icon: 'clipboard',    tone: 'teal' },
  { id: 'pharmacy',        name: 'Pharmacy',          description: 'Prescriptions picked up safely',       icon: 'activity',     tone: 'orange' },
  { id: 'food-groceries',  name: 'Food & Groceries',  description: 'Hot meals or market provisions',       icon: 'coffee',       tone: 'teal' },
  { id: 'multiple-stops',  name: 'Multiple Stops',    description: 'Drop off or pick up from many places', icon: 'map-pin',      tone: 'orange' },
];

// ═══ Saved addresses ═══

export const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: 'home',
    label: 'Home',
    address: 'Block 12, Flat 4, Admiralty Way, Lekki Phase 1, Lagos',
    coordinate: { latitude: 6.4413, longitude: 3.4728 },
    icon: 'home',
    isDefault: true,
  },
  {
    id: 'work',
    label: 'Work',
    address: 'Heritage Place, 21 Maroko Road, Ikoyi, Lagos',
    coordinate: { latitude: 6.4486, longitude: 3.4348 },
    icon: 'briefcase',
    isDefault: false,
  },
  {
    id: 'mom',
    label: "Mom's House",
    address: '45, Toyin Street, Ikeja, Lagos',
    coordinate: { latitude: 6.5951, longitude: 3.3412 },
    icon: 'map-pin',
    isDefault: false,
  },
];

// ═══ Available runners ═══

export const MOCK_RUNNERS: Runner[] = [
  { id: 'david',  name: 'David Adeyemi',  rating: 4.9, completed: 248, vehicle: 'Yamaha Scooter',   price: 250000, pickupMins: 7, shoppingMins: 18, verified: true, avatarUrl: null },
  { id: 'amska',  name: 'Amska Obi',      rating: 4.8, completed: 183, vehicle: 'Honda Motorcycle', price: 235000, pickupMins: 9, shoppingMins: 16, verified: true, avatarUrl: null },
  { id: 'tunde',  name: 'Tunde Bell',     rating: 4.9, completed: 412, vehicle: 'Bajaj Tricycle',   price: 270000, pickupMins: 5, shoppingMins: 20, verified: true, avatarUrl: null },
];

// ═══ Errands ═══
//
// NOTE: these are keyed to the seed customer id 'cust-1'. A freshly
// signed-up user gets a new id, so the errands list will be empty
// for them. If you want the demo to keep showing sample errands for
// any signed-in user, filter by `getMockUser().id` OR change the
// mock getErrands() to ignore customerId while USE_MOCK is true.

export const MOCK_ERRANDS: Errand[] = [
  {
    id: 'err-1',
    customerId: 'cust-1',
    serviceType: 'shop-for-me',
    status: 'shopping',
    pickup: { address: 'Shoprite, The Palms Mall, Lekki' },
    dropoff: { address: '12 Admiralty Way, Lekki Phase 1' },
    items: [
      {
        id: '1',
        name: 'Fresh Milk (2 Liters)',
        note: 'Peak preferably',
        quantity: 1,
        status: 'found',
        price: 80000,          // ₦800
      },
      {
        id: '2',
        name: 'Loaf of Sliced Bread',
        note: 'Large, fresh bake',
        quantity: 2,
        status: 'found',
        price: 120000,         // ₦1,200
      },
      {
        id: '3',
        name: 'Peak Milk Powder 400g',
        quantity: 1,
        status: 'out_of_stock',
        price: 240000,         // ₦2,400
        suggestedSubstitute: {
          name: 'Lano Milk Powder 400g',
          price: 210000,       // ₦2,100
          imageUrl: null,
        },
      },
    ],
    budget: 1500000,           // ₦15,000
    instructions: 'Please check expiry dates.',
    timeline: 'now',
    runner: MOCK_RUNNERS[0],
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'err-2',
    customerId: 'cust-1',
    serviceType: 'pharmacy',
    status: 'completed',
    pickup: { address: 'Medplus Pharmacy, Admiralty Way' },
    dropoff: { address: '12 Admiralty Way, Lekki Phase 1' },
    items: [
      { id: '1', name: 'Paracetamol 500mg', quantity: 2, status: 'found', price: 40000 },
      { id: '2', name: 'Vitamin C 1000mg',  quantity: 1, status: 'found', price: 170000 },
    ],
    budget: 300000,            // ₦3,000
    timeline: 'now',
    runner: MOCK_RUNNERS[1],
    createdAt: '2026-10-02T15:15:00Z',
    completedAt: '2026-10-02T16:45:00Z',
  },
  {
    id: 'err-3',
    customerId: 'cust-1',
    serviceType: 'pick-up-deliver',
    status: 'completed',
    pickup: { address: 'Lekki Phase 1, Lagos' },
    dropoff: { address: 'Ikeja City Mall, Lagos' },
    items: [
      { id: '1', name: 'Envelope with documents', quantity: 1, status: 'found' },
    ],
    budget: 0,
    timeline: 'now',
    runner: MOCK_RUNNERS[2],
    createdAt: '2026-11-15T10:00:00Z',
    completedAt: '2026-11-15T12:30:00Z',
  },
  {
    id: 'err-4',
    customerId: 'cust-1',
    serviceType: 'food-groceries',
    status: 'cancelled',
    pickup: { address: 'Cold Stone Creamery, Lekki' },
    dropoff: { address: '12 Admiralty Way, Lekki Phase 1' },
    items: [
      { id: '1', name: 'Chocolate ice cream', quantity: 2, status: 'pending' },
    ],
    budget: 800000,            // ₦8,000
    timeline: 'now',
    runner: null,
    createdAt: '2026-11-12T13:44:00Z',
  },
];

// ═══ Notifications ═══

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Substitution Needed',
    desc: "Your Runner says 'Ariel Detergent 1kg' is out of stock. Would you prefer 'So Klin 1kg' instead?",
    icon: 'refresh-cw',
    tone: 'teal',
    time: 'Just now',
    needsAction: true,
    actionAmount: '₦1,800',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    title: 'Runner Accepted Errand',
    desc: 'Runner Tunde has accepted your Grocery Pickup request. He is on his way to Spar Lekki.',
    icon: 'user-check',
    tone: 'teal',
    time: '5 mins ago',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-3',
    title: 'Runner has arrived at store',
    desc: 'Tunde has checked in at Spar Lekki and is now shopping.',
    icon: 'map-pin',
    tone: 'orange',
    time: '12 mins ago',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-4',
    title: 'Receipt Uploaded — Review',
    desc: 'Runner uploaded invoice of ₦14,200. Check to confirm final pricing.',
    icon: 'file-text',
    tone: 'teal',
    time: '25 mins ago',
    read: true,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-5',
    title: 'Your errand is on the way!',
    desc: 'Errand dispatched. Watch real-time delivery map of Lekki Phase 1.',
    icon: 'navigation',
    tone: 'orange',
    time: '40 mins ago',
    read: true,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-6',
    title: 'Errand completed!',
    desc: 'Tunde delivered your items safely. Please verify and rate your experience.',
    icon: 'check-circle',
    tone: 'green',
    time: '1 hour ago',
    read: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// ═══ Wallet ═══

export const MOCK_WALLET_BALANCE = 2_540_000; // ₦25,400

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'w-1', title: 'Wallet Top-up',         subtitle: '24 Nov, 9:02 AM',  amount:  1_000_000, icon: 'plus-circle', createdAt: '2026-11-24T09:02:00Z' },
  { id: 'w-2', title: 'Errand Payment (Spar)', subtitle: '22 Nov, 12:44 PM', amount: -1_750_000, icon: 'shopping-bag', createdAt: '2026-11-22T12:44:00Z' },
  { id: 'w-3', title: 'Refund Completed',      subtitle: '18 Nov, 4:15 PM',  amount:    180_000, icon: 'rotate-ccw',  createdAt: '2026-11-18T16:15:00Z' },
  { id: 'w-4', title: 'Promo Credit',          subtitle: '15 Nov, 8:00 AM',  amount:     50_000, icon: 'gift',        createdAt: '2026-11-15T08:00:00Z' },
  { id: 'w-5', title: 'Tip for Runner Tunde',  subtitle: '12 Nov, 6:30 PM',  amount:   -100_000, icon: 'heart',       createdAt: '2026-11-12T18:30:00Z' },
];