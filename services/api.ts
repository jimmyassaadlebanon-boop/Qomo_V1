import { 
  DropConfig, 
  DropState, 
  initDrop, 
  applyView, 
  applyPurchase, 
  releaseLock,
  ViewEventResult, 
  PurchaseResult 
} from './pricingEngine';
import productsData from '../config/products';

// Simulate a database
const db: Map<string, DropState> = new Map();
const configs: Map<string, DropConfig> = new Map();

// Initialize DB from TS config
Object.values(productsData).forEach((prod) => {
  const config = prod as DropConfig;
  configs.set(config.productId, config);
  db.set(config.productId, initDrop(config));
});

// --- API Endpoints ---

/**
 * GET /status/:productId
 */
export const getStatus = (productId: string): DropState => {
  const state = db.get(productId);
  if (!state) throw new Error(`Product ${productId} not found`);
  return { ...state }; // Return copy
};

/**
 * POST /view
 * Attempts to view (drop price) or join queue.
 */
export const postView = (productId: string, viewerId: string): ViewEventResult => {
  const state = db.get(productId);
  const config = configs.get(productId);

  if (!state || !config) {
    throw new Error(`Product ${productId} not found`);
  }

  const result = applyView(state, config, viewerId);
  
  // Always update DB with new state (which might include queue updates)
  db.set(productId, result.state);

  return result;
};

/**
 * POST /cancel
 * Releases the lock if held by viewerId.
 */
export const postCancel = (productId: string, viewerId: string): DropState => {
    const state = db.get(productId);
    if (!state) throw new Error(`Product ${productId} not found`);
    
    const newState = releaseLock(state, viewerId);
    db.set(productId, newState);
    return newState;
}

/**
 * POST /buy
 */
export const postBuy = (productId: string, buyerId: string): PurchaseResult => {
  const state = db.get(productId);
  const config = configs.get(productId);

  if (!state || !config) {
    throw new Error(`Product ${productId} not found`);
  }

  const result = applyPurchase(state, config, buyerId);

  if (result.success) {
    db.set(productId, result.state);
  }

  return result;
};

/**
 * Helper to reset the DB for simulation/testing
 */
export const resetDb = () => {
  Object.values(productsData).forEach((prod) => {
    const config = prod as DropConfig;
    db.set(config.productId, initDrop(config));
  });
};