import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedDropsProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

const FeaturedDrops: React.FC<FeaturedDropsProps> = ({ 
  products, 
  onSelectProduct
}) => {
  return (
    <section className="w-full py-24 bg-charcoal relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="font-serif text-5xl md:text-6xl text-offwhite mb-4">Featured Drops</h2>
            <p className="font-sans text-offwhite/50 text-sm tracking-widest uppercase">Live Now • Limited Quantity</p>
          </div>
        </div>

        {/* Product Grid */}
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

export default FeaturedDrops;