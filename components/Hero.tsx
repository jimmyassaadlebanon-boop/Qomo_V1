import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onExploreDrops: () => void;
  onHowItWorks: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExploreDrops, onHowItWorks }) => {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-charcoal text-offwhite">
      {/* Background Visual - Abstract Luxury */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Luxury Abstract Background" 
          className="w-full h-full object-cover opacity-30 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        
        {/* Animated Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-serif italic text-6xl md:text-8xl lg:text-9xl leading-tight mb-6 tracking-tight"
        >
          Luxury Drops, <br/>
          <span className="not-italic font-normal">Reimagined.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="font-sans text-sm md:text-base lg:text-lg tracking-widest uppercase text-offwhite/70 max-w-xl mb-12"
        >
          Pay to reveal the price. Watch the drop. Be the first to buy.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col md:flex-row gap-6 items-center"
        >
          <button 
            onClick={onExploreDrops}
            className="group relative px-8 py-4 bg-offwhite text-charcoal rounded-full font-sans font-medium tracking-wide overflow-hidden transition-all hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Drops <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button 
            onClick={onHowItWorks}
            className="group px-8 py-4 border border-offwhite/30 text-offwhite rounded-full font-sans font-medium tracking-wide hover:bg-offwhite/5 transition-all flex items-center gap-3"
          >
            <Play size={14} className="fill-current" />
            How Qomo Works
          </button>
        </motion.div>
      </div>

      {/* Floating Elements (Visual Interest) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-12 left-12 md:left-24 font-sans text-xs tracking-widest text-softgold"
      >
        CURATED BY AI
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 2 }}
        className="absolute bottom-12 right-12 md:right-24 font-sans text-xs tracking-widest text-offwhite/50"
      >
        SCROLL TO DISCOVER
      </motion.div>
    </section>
  );
};

export default Hero;