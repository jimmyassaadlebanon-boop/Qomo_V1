import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface DropsPageProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

const DropsPage: React.FC<DropsPageProps> = ({ products, onSelectProduct }) => {
  return (
    <section className="w-full min-h-screen pt-32 pb-24 bg-charcoal relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h2 className="font-serif text-5xl md:text-6xl text-offwhite mb-4">Current Drops</h2>
          <p className="font-sans text-offwhite/50 text-sm tracking-widest uppercase">Select an item to view real-time pricing</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onSelect={onSelectProduct} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DropsPage;
