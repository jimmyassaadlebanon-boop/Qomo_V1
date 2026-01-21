import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group flex flex-col h-full w-full max-w-[330px]"
    >
      {/* Card Image Container */}
      <div 
        className="relative w-full h-[330px] rounded-[12px] border-[2px] border-[#222] overflow-hidden mb-6 flex-shrink-0 bg-charcoal shadow-2xl cursor-pointer" 
        onClick={() => onSelect(product.id)}
      >
        <img 
          src={product.generatedImage || product.placeholderUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Generated Badge */}
        {product.generatedImage && (
            <div className="absolute top-4 right-4 z-20">
                <span className="text-[10px] font-sans bg-softgold text-charcoal px-2 py-1 font-bold">AI GENERATED</span>
            </div>
        )}
        
        {/* Subtle Gradient Overlay */}
        {!product.generatedImage && (
           <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col items-center text-center flex-grow w-full">
        <h3 className="font-serif text-2xl text-offwhite mb-2">{product.name}</h3>
        <p className="font-sans text-sm text-offwhite/50 mb-6 flex-grow">{product.description}</p>
        
        <button 
          onClick={() => onSelect(product.id)}
          className="w-full mt-auto border border-offwhite/20 text-offwhite py-3 font-sans text-xs tracking-widest hover:bg-softgold hover:border-softgold hover:text-charcoal transition-all duration-300"
        >
          VIEW PRICE
        </button>
      </div>
    </motion.div>
  );
};
