import React from 'react';
import { Tag, Sparkles, Eye, TrendingDown, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: "Step 1",
    icon: Tag,
    title: "Supplier sets the base price",
    body: "The brand chooses the starting price for a single high-end item. This price is never discounted on their side."
  },
  {
    step: "Step 2",
    icon: Sparkles,
    title: "Qomo lists the drop",
    body: "The product appears in a curated drop with its price hidden. Only serious buyers will pay to reveal it."
  },
  {
    step: "Step 3",
    icon: Eye,
    title: "Buyers pay to reveal",
    body: "A viewer pays a small fee (e.g., $5) to unlock the current price. Each view represents real intent, not browsing."
  },
  {
    step: "Step 4",
    icon: TrendingDown,
    title: "Price drops with every view",
    body: "A portion of each viewing fee lowers the product price. Another portion becomes platform revenue that Qomo and the supplier share."
  },
  {
    step: "Step 5",
    icon: Crown,
    title: "First buyer wins",
    body: "The first person to hit “Buy Now” secures the item at the live price. The buyer gets a deal, the supplier receives full base price plus part of the viewing revenue, and Qomo earns from engagement."
  }
];

const HowItWorksPage: React.FC = () => {
  return (
    <section className="w-full min-h-screen pt-32 pb-24 bg-charcoal text-offwhite relative overflow-hidden">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="font-sans text-softgold text-xs tracking-[0.2em] uppercase mb-4 block">How Qomo Works</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">Where urgency, exclusivity, and value meet.</h1>
          <p className="font-sans text-offwhite/50 text-lg max-w-2xl mx-auto">
            A transparent mechanism designed to protect brand value while rewarding consumer intent.
          </p>
        </motion.div>

        {/* 5-Step Timeline */}
        <div className="relative mb-24">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-16 left-0 w-full h-[1px] bg-offwhite/10 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
            {steps.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center lg:items-start text-center lg:text-left group"
              >
                {/* Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-charcoal border border-offwhite/20 flex items-center justify-center mb-6 relative z-10 group-hover:border-softgold group-hover:bg-softgold/10 transition-all duration-500">
                  <item.icon size={20} className="text-offwhite group-hover:text-softgold transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <span className="font-sans text-xs font-bold text-softgold tracking-widest uppercase">{item.step}</span>
                  <h3 className="font-serif text-xl leading-tight min-h-[3rem]">{item.title}</h3>
                  <p className="font-sans text-sm text-offwhite/60 leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-offwhite/10 pt-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-offwhite/5 p-8 rounded-xl border border-offwhite/5"
          >
            <h4 className="font-serif text-2xl mb-4 text-offwhite">For buyers</h4>
            <p className="font-sans text-offwhite/60 leading-relaxed">
              You pay a small fee to reveal prices, watch them drop with demand, and jump in when the deal feels right.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-offwhite/5 p-8 rounded-xl border border-offwhite/5"
          >
            <h4 className="font-serif text-2xl mb-4 text-offwhite">For suppliers</h4>
            <p className="font-sans text-offwhite/60 leading-relaxed">
              You never discount your list price, earn from every serious view, and keep full control over what you list.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksPage;