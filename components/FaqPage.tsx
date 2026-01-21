import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "What is Qomo?",
    answer: "Qomo is a luxury e-commerce platform where buyers pay a small fee to reveal hidden prices on high-end drops. Each view can help lower the live price for the next buyer."
  },
  {
    question: "How does the viewing fee work?",
    answer: "You pay a fixed fee (for example, $5) to unlock the current price of a specific product. That fee is non-refundable and is how we separate serious buyers from casual browsers."
  },
  {
    question: "What happens to my viewing fee if I don’t buy?",
    answer: "You still paid to reveal the price, so the fee is not refunded. But your view still matters: it helps nudge the price lower for the next buyer and generates platform rewards for suppliers and Qomo."
  },
  {
    question: "How does the price actually drop?",
    answer: "A portion of every viewing fee is used to reduce the product’s live price. As more people view without buying, the price continues to step down until someone decides to purchase."
  },
  {
    question: "How do suppliers get paid?",
    answer: "Suppliers always receive their full base price for the item when it sells, plus a share of the viewing-fee revenue that was generated while the product was live."
  },
  {
    question: "What does Qomo earn?",
    answer: "Qomo earns a portion of the viewing-fee revenue. We monetize buyer attention and intent, not just the final sale."
  },
  {
    question: "Is there a minimum price the product can reach?",
    answer: "Yes. Each product has a configured price floor so that the live price can’t drop below a certain point, even if there are many views."
  },
  {
    question: "Who is Qomo for?",
    answer: "Qomo is built for buyers who want access to curated luxury drops and for brands that want urgency, conversion, and new revenue without discounting their list prices."
  }
];

interface FaqPageProps {
  onBack: () => void;
}

const FaqPage: React.FC<FaqPageProps> = ({ onBack }) => {
  // Track open index, -1 means none
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full min-h-screen pt-32 pb-24 bg-charcoal text-offwhite relative">
      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        
        {/* Back Nav */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-sans tracking-widest text-offwhite/50 hover:text-softgold transition-colors mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO DROPS
        </button>

        {/* Premium Panel Frame */}
        <div className="rounded-2xl bg-[#0F0F0F] border border-[#1F1F1F] px-6 md:px-10 py-12 shadow-[0_0_40px_rgba(0,0,0,0.30)]">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="font-sans text-softgold text-xs tracking-[0.2em] uppercase mb-4 block">FAQ</span>
            <h1 className="font-serif text-4xl md:text-5xl mb-6 text-offwhite">Questions about Qomo,<br/>answered.</h1>
            <p className="font-sans text-offwhite/50 text-base">
              Understand how our pay-to-view luxury drops work.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-offwhite/10"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full py-6 flex justify-between items-center text-left group"
                  >
                    <span className={`font-serif text-lg transition-colors ${isOpen ? 'text-softgold' : 'text-offwhite group-hover:text-softgold'}`}>
                      {item.question}
                    </span>
                    <div className={`p-1 rounded-full border border-offwhite/10 transition-colors flex-shrink-0 ml-4 ${isOpen ? 'bg-softgold text-charcoal border-softgold' : 'text-offwhite/50 group-hover:text-softgold group-hover:border-softgold'}`}>
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="font-sans text-offwhite/60 text-sm leading-relaxed pb-8 pr-12">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FaqPage;