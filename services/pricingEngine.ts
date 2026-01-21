/**
 * Qomo Pricing Engine
 * Handles the logic for price drops, revenue sharing, and state management.
 * 
 * Rules:
 * - Each view charges a fixed fee (e.g., $5).
 * - A percentage of that fee drops the product price.
 * - The remainder is platform revenue.
 * - Platform revenue is split between the Supplier and Qomo.
 * - Price cannot drop below minPrice.
 */

// --- Types ---

export interface DropConfig {
  productId: string;
  name: string;
  basePrice: number;
  viewingFee: number;
  priceDropShare: number;        // e.g., 0.80
  platformShare: number;         // e.g., 0.20
  supplierShareOfPlatform: number; // e.g., 0.25
  qomoShareOfPlatform: number;     // e.g., 0.75
  minPrice: number;
}

export interface DropState {
  productId: string;
  currentPrice: number;
  isSold: boolean;
  totalViews: number;
  buyerId?: string;
  soldPrice?: number;
  
  // Locking & Queueing
  activeViewerId: string | null;
  activeViewExpiresAt: number | null;
  queue: string[];

  // Accumulated Financials
  totalPlatformRevenue: number;
  totalSupplierPlatformRevenue: number;
  totalQomoRevenue: number;
}

export interface ViewEventResult {
  success: boolean;
  status: 'LOCKED' | 'QUEUED' | 'SOLD' | 'ERROR';
  expiresAt?: number;
  queuePosition?: number;
  dropAmount: number;
  newPrice: number;
  feeCharged: number;
  state: DropState;
  error?: string;
}

export interface PurchaseResult {
  success: boolean;
  soldPrice: number;
  totalSupplierRevenue: number; // Sold Price + Platform Share
  totalQomoRevenue: number;     // Platform Share
  state: DropState;
  error?: string;
}

// --- Helpers ---

/**
 * Rounds a number to exactly 2 decimal places.
 * Used to prevent floating point drift in monetary calculations.
 */
function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

// --- Core Functions ---

/**
 * Initializes the state for a new product drop.
 */
export const initDrop = (config: DropConfig): DropState => {
  return {
    productId: config.productId,
    currentPrice: roundMoney(config.basePrice),
    isSold: false,
    totalViews: 0,
    activeViewerId: null,
    activeViewExpiresAt: null,
    queue: [],
    totalPlatformRevenue: 0,
    totalSupplierPlatformRevenue: 0,
    totalQomoRevenue: 0,
  };
};

/**
 * Applies a single view event to the drop state.
 * Implements Locking and Queueing logic.
 */
export const applyView = (
  state: DropState, 
  config: DropConfig, 
  viewerId: string
): ViewEventResult => {
  if (state.isSold) {
    return {
      success: false,
      status: 'SOLD',
      dropAmount: 0,
      newPrice: state.currentPrice,
      feeCharged: 0,
      state,
      error: "Product is already sold."
    };
  }

  const now = Date.now();
  const LOCK_DURATION = 30000; // 30 seconds

  // Check existing lock validity
  const isLocked = state.activeViewerId && state.activeViewExpiresAt && state.activeViewExpiresAt > now;

  if (isLocked) {
    if (state.activeViewerId === viewerId) {
      // User already holds the lock. Return current state without charging again.
      // This allows UI to refresh state without double-charging.
      return {
        success: true,
        status: 'LOCKED',
        expiresAt: state.activeViewExpiresAt!,
        dropAmount: 0,
        newPrice: state.currentPrice,
        feeCharged: 0,
        state
      };
    } else {
      // Locked by someone else. Queue the user.
      let newQueue = [...state.queue];
      if (!newQueue.includes(viewerId)) {
        newQueue.push(viewerId);
      }
      
      const newState = { ...state, queue: newQueue };
      
      return {
        success: false,
        status: 'QUEUED',
        queuePosition: newQueue.indexOf(viewerId) + 1,
        dropAmount: 0,
        newPrice: state.currentPrice,
        feeCharged: 0,
        state: newState
      };
    }
  }

  // Not locked (or lock expired). Check Queue Priority.
  // We perform a lazy cleanup of the lock here implicitly by overwriting it if successful.
  // If there is a queue, and the current user is NOT the first one, they must wait.
  // Exception: If queue is empty, anyone can take it.
  
  if (state.queue.length > 0) {
    // Basic queue logic: first in, first out.
    // If user is in queue but not first:
    if (state.queue[0] !== viewerId) {
      let newQueue = [...state.queue];
      if (!newQueue.includes(viewerId)) {
        newQueue.push(viewerId);
      }
      // Ensure we clear any expired lock data from state to be clean, though logic handles it.
      const newState = { 
        ...state, 
        activeViewerId: null, 
        activeViewExpiresAt: null, 
        queue: newQueue 
      };
      
      return {
        success: false,
        status: 'QUEUED',
        queuePosition: newQueue.indexOf(viewerId) + 1,
        dropAmount: 0,
        newPrice: state.currentPrice,
        feeCharged: 0,
        state: newState
      };
    }
  }

  // --- GRANT LOCK & APPLY DROP ---
  // User is eligible (No lock exists, and they are either queue head or queue is empty).

  // 1. Calculate distribution amounts
  const priceDropAmount = roundMoney(config.viewingFee * config.priceDropShare);
  const platformRevenue = roundMoney(config.viewingFee * config.platformShare);
  
  // 2. Split platform revenue
  const supplierShare = roundMoney(platformRevenue * config.supplierShareOfPlatform);
  const qomoShare = roundMoney(platformRevenue * config.qomoShareOfPlatform);

  // 3. Calculate new price
  let nextPrice = state.currentPrice - priceDropAmount;
  if (nextPrice < config.minPrice) {
    nextPrice = config.minPrice;
  }
  nextPrice = roundMoney(nextPrice);
  const effectiveDrop = roundMoney(state.currentPrice - nextPrice);

  // 4. Update Queue (Remove user if they were in it)
  const newQueue = state.queue.filter(id => id !== viewerId);

  // 5. Update State
  const newState: DropState = {
    ...state,
    currentPrice: nextPrice,
    totalViews: state.totalViews + 1,
    totalPlatformRevenue: roundMoney(state.totalPlatformRevenue + platformRevenue),
    totalSupplierPlatformRevenue: roundMoney(state.totalSupplierPlatformRevenue + supplierShare),
    totalQomoRevenue: roundMoney(state.totalQomoRevenue + qomoShare),
    
    // Set Lock
    activeViewerId: viewerId,
    activeViewExpiresAt: now + LOCK_DURATION,
    queue: newQueue
  };

  return {
    success: true,
    status: 'LOCKED',
    expiresAt: newState.activeViewExpiresAt!,
    dropAmount: effectiveDrop,
    newPrice: newState.currentPrice,
    feeCharged: config.viewingFee,
    state: newState,
  };
};

/**
 * Releases the lock for a user (Cancel action).
 */
export const releaseLock = (
    state: DropState, 
    viewerId: string
): DropState => {
    if (state.activeViewerId === viewerId) {
        return {
            ...state,
            activeViewerId: null,
            activeViewExpiresAt: null
        };
    }
    return state;
};

/**
 * Executes a purchase for the product.
 */
export const applyPurchase = (
  state: DropState, 
  config: DropConfig, 
  buyerId: string
): PurchaseResult => {
  if (state.isSold) {
    return {
      success: false,
      soldPrice: 0,
      totalSupplierRevenue: 0,
      totalQomoRevenue: 0,
      state,
      error: "Product is already sold."
    };
  }

  // Enforce lock ownership for purchase
  const now = Date.now();
  if (state.activeViewerId && (state.activeViewerId !== buyerId && state.activeViewExpiresAt && state.activeViewExpiresAt > now)) {
      return {
          success: false,
          soldPrice: 0,
          totalSupplierRevenue: 0,
          totalQomoRevenue: 0,
          state,
          error: "Product is currently locked by another user."
      }
  }

  const soldPrice = state.currentPrice;

  // Supplier gets the final sale price PLUS their accumulated share of the view fees.
  const totalSupplierRevenue = roundMoney(soldPrice + state.totalSupplierPlatformRevenue);
  
  // Qomo gets their accumulated share of the view fees.
  const totalQomoRevenue = state.totalQomoRevenue;

  const newState: DropState = {
    ...state,
    isSold: true,
    buyerId: buyerId,
    soldPrice: soldPrice,
    activeViewerId: null, // Clear lock
    activeViewExpiresAt: null,
    queue: [] // Clear queue
  };

  return {
    success: true,
    soldPrice,
    totalSupplierRevenue,
    totalQomoRevenue,
    state: newState,
  };
};