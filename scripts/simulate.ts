import { initDrop, applyView, applyPurchase, DropConfig } from '../services/pricingEngine';
import productsData from '../config/products';

// In a real Node environment, we would run this file directly.
// Here we export a function that can be triggered to run the simulation and log to console.

export const runSimulation = () => {
  console.log("------------------------------------------------");
  console.log("STARTING QOMO PRICING SIMULATION");
  console.log("------------------------------------------------");

  const products = Object.values(productsData) as DropConfig[];

  products.forEach((config) => {
    console.log(`\n>>> SIMULATING PRODUCT: ${config.name} (${config.productId})`);
    console.log(`BASE PRICE: $${config.basePrice}`);

    // 1. Initialize
    let state = initDrop(config);

    // 2. Simulate 10 Views
    console.log("... Simulating 10 Views ...");
    for (let i = 1; i <= 10; i++) {
      const result = applyView(state, config, `viewer_${i}`);
      state = result.state;
    }

    // 3. Log Post-View Metrics
    console.log(`STATUS AFTER 10 VIEWS:`);
    console.log(`- Final Price: $${state.currentPrice}`);
    console.log(`- Total Views: ${state.totalViews}`);
    console.log(`- Total Platform Revenue: $${state.totalPlatformRevenue}`);
    console.log(`- Supplier Share of Platform: $${state.totalSupplierPlatformRevenue}`);
    console.log(`- Qomo Share of Platform: $${state.totalQomoRevenue}`);

    // 4. Simulate Purchase
    console.log("... Simulating Purchase ...");
    const purchaseResult = applyPurchase(state, config, "buyer_WINNER");
    state = purchaseResult.state;

    if (purchaseResult.success) {
      console.log(`PURCHASE SUCCESSFUL:`);
      console.log(`- Buyer Paid: $${purchaseResult.soldPrice}`);
      console.log(`- Total Supplier Revenue (Price + Fee Share): $${purchaseResult.totalSupplierRevenue}`);
      console.log(`- Total Qomo Revenue (Fee Share): $${purchaseResult.totalQomoRevenue}`);
    } else {
      console.error("Purchase failed:", purchaseResult.error);
    }
  });

  console.log("\n------------------------------------------------");
  console.log("SIMULATION COMPLETE");
  console.log("------------------------------------------------");
};

// Auto-run if enabled in environment (optional)
// runSimulation();