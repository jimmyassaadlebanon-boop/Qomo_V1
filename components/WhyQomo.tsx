import React from 'react';
import { motion } from 'framer-motion';

const pillars = [
  {
    title: "Urgency by Design",
    text: "Prices drop in real-time. Hesitation is the only cost."
  },
  {
    title: "Monetized Attention",
    text: "Every view contributes to value. Participation is currency."
  },
  {
    title: "Exclusive Marketplace",
    text: "Curated inventory for high-intent buyers only."
  }
];

const WhyQomo: React.FC = () => {
  return (
    <section className="w-full py-32 bg-offwhite text-charcoal">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          
          <div className="sticky top-32">
            <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-8">
              Why <br/> Qomo?
            </h2>
            <p className="font-sans text-charcoal/60 text-lg max-w-md">
              We are redefining the physics of luxury e-commerce. It is no longer just about buying; it is about the thrill of the acquisition.
            </p>
          </div>

          <div className="space-y-24">
            {pillars.map((pillar, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="border-t border-charcoal/10 pt-8"
              >
                {/* Number removed as requested */}
                <h3 className="font-serif text-3xl mb-4">{pillar.title}</h3>
                <p className="font-sans text-charcoal/70 leading-relaxed">{pillar.text}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyQomo;