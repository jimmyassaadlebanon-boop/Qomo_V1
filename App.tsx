import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import HowItWorksPage from './components/HowItWorksPage';
import FeaturedDrops from './components/FeaturedDrops';
import WhyQomo from './components/WhyQomo';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import DropsPage from './components/DropsPage';
import ProductDetailPage from './components/ProductDetailPage';
import FaqPage from './components/FaqPage';
import { Product, ImageResolution } from './types';
import { ensureApiKey, generateProductImage } from './services/geminiService';

// Updated IDs to match config/products.json keys
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'iphone17',
    name: 'iPhone 17 Pro',
    description: 'Desert Titanium finish. The future of communication.',
    placeholderUrl: 'https://i.imgur.com/oLONhSv.jpeg',
    basePrice: 1100,
    priceHidden: true,
  },
  {
    id: 'ps5slim',
    name: 'PlayStation 5 Slim',
    description: 'Ultra-HD gaming console in Glacier White.',
    placeholderUrl: 'https://i.imgur.com/jRtYBec.png',
    basePrice: 485,
    priceHidden: true,
  },
  {
    id: 'macbookairm4',
    name: 'MacBook Air M4',
    description: 'Space Gray. Power meets portability.',
    placeholderUrl: 'https://i.imgur.com/aURWe9x.png',
    basePrice: 900,
    priceHidden: true,
  },
];

type ViewState = 'auth' | 'landing' | 'drops' | 'product' | 'how-it-works' | 'faq';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>('auth');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Lifted state for products so generation persists across views
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('qomo_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      setView('landing');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('qomo_auth', 'true');
    setView('landing');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('qomo_auth');
    setView('auth');
    setSelectedProductId(null);
  };

  const handleExploreDrops = () => {
    setView('drops');
    window.scrollTo(0, 0);
  };

  const handleHowItWorks = () => {
    setView('how-it-works');
    window.scrollTo(0, 0);
  };

  const handleOpenFaq = () => {
    setView('faq');
    window.scrollTo(0, 0);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleBackToDrops = () => {
    setSelectedProductId(null);
    setView('drops');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  // Shared generation logic
  const handleGenerateImages = async (resolution: ImageResolution) => {
    setIsGenerating(true);
    try {
      const hasKey = await ensureApiKey();
      if (!hasKey) {
        setIsGenerating(false);
        return;
      }

      const promises = products.map(async (product) => {
        try {
          const imageUrl = await generateProductImage(product.name, resolution);
          return { ...product, generatedImage: imageUrl || undefined };
        } catch (e) {
          console.error(`Failed to generate for ${product.name}`, e);
          return product;
        }
      });

      const updatedProducts = await Promise.all(promises);
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Generation sequence failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- View Routing ---

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="w-full min-h-screen bg-charcoal selection:bg-softgold selection:text-charcoal">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 flex justify-between items-center z-50 mix-blend-difference text-offwhite pointer-events-none">
        <div 
          className="font-serif text-2xl font-bold tracking-tight pointer-events-auto cursor-pointer"
          onClick={() => setView('landing')}
        >
          Qomo.
        </div>
        <div className="flex gap-4 pointer-events-auto">
            {view !== 'landing' && (
                 <button 
                 onClick={() => setView('landing')}
                 className="font-sans text-xs font-bold tracking-widest text-offwhite/70 hover:text-softgold transition-colors"
               >
                 HOME
               </button>
            )}
            <button 
              onClick={handleLogout}
              className="font-sans text-xs font-bold tracking-widest border border-offwhite/30 px-4 py-2 rounded-full cursor-pointer hover:bg-offwhite hover:text-charcoal transition-all"
            >
              LOG OUT
            </button>
        </div>
      </nav>

      <main className="w-full">
        {view === 'landing' && (
          <>
            <Hero onExploreDrops={handleExploreDrops} onHowItWorks={handleHowItWorks} />
            <HowItWorks />
            <FeaturedDrops 
              products={products}
              onSelectProduct={handleSelectProduct}
            />
            <WhyQomo />
          </>
        )}

        {view === 'how-it-works' && (
          <HowItWorksPage />
        )}

        {view === 'faq' && (
          <FaqPage onBack={handleBackToLanding} />
        )}

        {view === 'drops' && (
          <DropsPage 
            products={products}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {view === 'product' && selectedProductId && (
          <ProductDetailPage 
            product={products.find(p => p.id === selectedProductId)!}
            onBack={handleBackToDrops}
          />
        )}
      </main>

      <Footer onFaqClick={handleOpenFaq} />
    </div>
  );
}

export default App;
