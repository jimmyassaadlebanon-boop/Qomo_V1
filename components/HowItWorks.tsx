import React from 'react';
import { Eye, TrendingDown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full py-24 bg-charcoal border-b border-offwhite/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="font-sans text-softgold text-xs tracking-widest uppercase mb-2 block">The Model</span>
          <h2 className="font-serif text-4xl text-offwhite">How Qomo Works</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Eye, title: "Pay to Reveal", desc: "Pay a small fee to see the real-time price." },
            { icon: TrendingDown, title: "Price Drops", desc: "Every view instantly lowers the price." },
            { icon: Zap, title: "First to Buy", desc: "The first person to checkout wins the deal." }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-offwhite/5 flex items-center justify-center mb-6 text-softgold">
                <item.icon size={20} />
              </div>
              <h3 className="font-serif text-xl text-offwhite mb-2">{item.title}</h3>
              <p className="font-sans text-sm text-offwhite/50 max-w-[200px] mx-auto leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;