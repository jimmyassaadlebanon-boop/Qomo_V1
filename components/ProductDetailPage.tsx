import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, TrendingDown, DollarSign, CheckCircle, Clock, X, Users } from 'lucide-react';
import { Product } from '../types';
import { DropState } from '../services/pricingEngine';
import { getStatus, postView, postBuy, postCancel } from '../services/api';
import productsConfig from '../config/products';
import { AIPriceAnalyst } from './AIPriceAnalyst';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  iphone17: "Forged in aerospace-grade titanium, the iPhone 17 Pro features the revolutionary A19 Pro chip for tailored performance. The all-new 48MP camera system captures life with unprecedented clarity, while the always-on Super Retina XDR display brings content to life.",
  ps5slim: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation® games.",
  macbookairm4: "Supercharged by the M4 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into its strikingly thin aluminum enclosure. Silent, powerful, and ready for anything."
};

// Generate or retrieve a persistent viewer ID for this session
const getViewerId = () => {
    const key = 'qomo_viewer_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = `viewer_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(key, id);
    }
    return id;
};

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack }) => {
  const [dropState, setDropState] = useState<DropState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Interaction State
  const [viewerId] = useState(getViewerId());
  const [isProcessing, setIsProcessing] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const pollIntervalRef = useRef<number | null>(null);

  // Load initial state
  useEffect(() => {
    try {
        const state = getStatus(product.id);
        setDropState(state);
    } catch (e) {
        setError("Failed to load product.");
    }
    return () => {
        if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
    };
  }, [product.id]);

  // Timer Countdown Logic
  useEffect(() => {
      if (!lockExpiresAt) {
          setTimeLeft(0);
          return;
      }

      const interval = setInterval(() => {
          const now = Date.now();
          const remaining = Math.max(0, Math.ceil((lockExpiresAt - now) / 1000));
          setTimeLeft(remaining);

          if (remaining <= 0) {
              // Timer expired locally
              setLockExpiresAt(null);
              // Refresh state to ensure server sync
              const state = getStatus(product.id);
              setDropState(state);
          }
      }, 1000);

      return () => clearInterval(interval);
  }, [lockExpiresAt, product.id]);

  // Queue Polling Logic
  useEffect(() => {
      if (queuePosition !== null) {
          pollIntervalRef.current = window.setInterval(() => {
             // Attempt to claim the lock again
             handleUnlockAttempt(true);
          }, 2000);
      } else {
          if (pollIntervalRef.current) {
              window.clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
          }
      }
      return () => {
           if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
      }
  }, [queuePosition]);

  // Auto-close modal if lock is lost (timer expires)
  useEffect(() => {
    if (!lockExpiresAt && showConfirmModal) {
      setShowConfirmModal(false);
    }
  }, [lockExpiresAt, showConfirmModal]);

  const config = productsConfig[product.id];

  const handleUnlockAttempt = (isPolling = false) => {
      if (!isPolling) setIsProcessing(true);
      setError(null);

      try {
          const result = postView(product.id, viewerId);
          setDropState(result.state);

          if (result.status === 'LOCKED') {
              // We got the lock!
              setLockExpiresAt(result.expiresAt || null);
              setQueuePosition(null);
          } else if (result.status === 'QUEUED') {
              // We are in queue
              setQueuePosition(result.queuePosition || null);
              setLockExpiresAt(null);
          } else if (result.status === 'SOLD') {
              setQueuePosition(null);
              setLockExpiresAt(null);
          }
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCancel = () => {
      try {
          const newState = postCancel(product.id, viewerId);
          setDropState(newState);
          setLockExpiresAt(null);
          setQueuePosition(null);
      } catch (err: any) {
          setError(err.message);
      }
  };

  const handleBuy = () => {
    if (!dropState || !config) return;
    setIsProcessing(true);
    
    const result = postBuy(product.id, viewerId);
    
    if (result.success) {
      setDropState(result.state);
      setLockExpiresAt(null);
    } else {
      setError(result.error || "Purchase failed");
    }
    setIsProcessing(false);
  };

  if (!dropState || !config) {
    return <div className="w-full h-screen bg-charcoal flex items-center justify-center text-offwhite">Loading Drop Data...</div>;
  }

  const isSold = dropState.isSold;
  const isLockedByMe = lockExpiresAt !== null && timeLeft > 0;
  const isQueued = queuePosition !== null;
  const currentPrice = dropState.currentPrice.toFixed(2);

  return (
    <div className="w-full min-h-screen bg-charcoal text-offwhite pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-sans tracking-widest text-offwhite/50 hover:text-softgold transition-colors mb-12"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO DROPS
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square w-full rounded-2xl border-2 border-[#222] overflow-hidden bg-[#111] shadow-2xl relative">
              <img 
                src={product.generatedImage || product.placeholderUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isSold && (
                <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm flex flex-col items-center justify-center border border-softgold/20">
                    <CheckCircle size={64} className="text-softgold mb-4" />
                    <span className="font-serif text-4xl text-softgold">SOLD</span>
                    <span className="font-sans text-sm tracking-widest mt-2">FOR ${dropState.soldPrice?.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between text-xs font-sans tracking-widest text-offwhite/30 border-t border-offwhite/5 pt-6">
               <span>ID: {product.id.toUpperCase()}</span>
               <span>{config.viewingFee > 0 ? `$${config.viewingFee} TO UNLOCK` : 'FREE VIEW'}</span>
            </div>
          </motion.div>

          {/* Right Column: Pricing Engine UI */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex flex-col justify-center"
          >
            <h1 className="font-serif text-4xl md:text-6xl mb-4">{product.name}</h1>
            <p className="font-sans text-offwhite/50 text-lg mb-8 leading-relaxed max-w-md">{product.description}</p>

            {/* Pricing Card */}
            <div className="bg-white/5 border border-offwhite/10 rounded-xl p-8 backdrop-blur-md mb-8 relative overflow-hidden transition-all duration-300">
              
              {/* Active Timer Bar */}
              {isLockedByMe && (
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: timeLeft, ease: 'linear' }}
                    className="absolute top-0 left-0 h-1 bg-softgold z-10"
                  />
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-xs font-sans font-bold tracking-widest text-offwhite/40 mb-1 flex items-center gap-2">
                      CURRENT PRICE
                      {isLockedByMe && (
                          <span className="text-softgold flex items-center gap-1 bg-softgold/10 px-2 rounded-full">
                              <Clock size={10} /> {timeLeft}s
                          </span>
                      )}
                  </div>
                  
                  {isLockedByMe || isSold ? (
                    <motion.div 
                        key="revealed"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        className="font-serif text-5xl md:text-6xl text-softgold"
                    >
                      ${currentPrice}
                    </motion.div>
                  ) : (
                    <div className="font-serif text-4xl text-offwhite/20 filter blur-sm select-none">
                      $????.??
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-sans font-bold tracking-widest text-offwhite/40 mb-1">ORIGINAL</div>
                  <div className="font-sans text-xl text-offwhite/60 line-through decoration-offwhite/30">
                    ${config.basePrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions Area */}
              <div className="space-y-4">
                
                {/* 1. Initial State: Not Sold, Not Locked, Not Queued */}
                {!isSold && !isLockedByMe && !isQueued && (
                  <button 
                    onClick={() => handleUnlockAttempt(false)}
                    disabled={isProcessing}
                    className="w-full bg-offwhite text-charcoal py-4 font-sans font-bold text-sm tracking-widest hover:bg-softgold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {isProcessing ? (
                         'PROCESSING...'
                     ) : (
                         <><Eye size={16} /> PAY ${config.viewingFee} TO REVEAL</>
                     )}
                  </button>
                )}

                {/* 2. Queued State */}
                {!isSold && isQueued && (
                    <div className="w-full bg-charcoal/50 border border-offwhite/10 py-4 px-4 rounded-lg flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-softgold animate-pulse">
                            <Users size={16} />
                            <span className="font-sans font-bold text-sm tracking-widest">IN QUEUE: #{queuePosition}</span>
                        </div>
                        <span className="text-xs text-offwhite/40 font-sans">Waiting for other buyers to finish...</span>
                    </div>
                )}

                {/* 3. Locked/Active State */}
                {!isSold && isLockedByMe && (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleCancel}
                      className="w-full bg-transparent border border-offwhite/20 text-offwhite py-3 font-sans font-bold text-xs tracking-widest hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={14} /> CANCEL
                    </button>
                    <button 
                      onClick={() => setShowConfirmModal(true)}
                      disabled={isProcessing}
                      className="w-full bg-softgold text-charcoal py-4 font-sans font-bold text-sm tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-softgold/10"
                    >
                      <DollarSign size={16} /> BUY NOW
                    </button>
                  </div>
                )}

                {/* 4. Sold State */}
                {isSold && (
                  <div className="w-full bg-charcoal border border-softgold/30 text-softgold py-4 font-sans font-bold text-sm tracking-widest flex items-center justify-center gap-2 cursor-default">
                    <CheckCircle size={16} /> ITEM SOLD
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-4 text-center text-xs text-red-400 font-sans tracking-wide">
                  {error}
                </div>
              )}
            </div>

            {/* AI Price Analyst */}
            {!isSold && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <AIPriceAnalyst productName={product.name} basePrice={config.basePrice} />
                </motion.div>
            )}

            {/* Product Description - NEW */}
            {!isSold && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 pt-8 border-t border-offwhite/10"
                >
                    <h4 className="font-serif text-offwhite text-lg mb-4">About this Item</h4>
                    <p className="font-sans text-offwhite/60 text-sm leading-relaxed">
                        {PRODUCT_DESCRIPTIONS[product.id] || "Details coming soon."}
                    </p>
                </motion.div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1A1A1A] border border-offwhite/10 p-8 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-softgold to-transparent opacity-50" />
              
              <h3 className="font-serif text-3xl text-offwhite mb-2">Confirm Purchase</h3>
              <p className="font-sans text-sm text-offwhite/50 mb-8">Please review your order details.</p>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-start">
                   <span className="font-sans text-xs tracking-widest text-offwhite/40">ITEM</span>
                   <span className="font-serif text-lg text-offwhite text-right max-w-[200px]">{product.name}</span>
                </div>
                
                <div className="w-full h-[1px] bg-offwhite/10" />

                <div className="flex justify-between items-center">
                   <span className="font-sans text-xs tracking-widest text-offwhite/40">TOTAL</span>
                   <span className="font-serif text-4xl text-softgold">${currentPrice}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 font-sans text-xs font-bold tracking-widest text-offwhite/50 hover:text-offwhite transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleBuy();
                  }}
                  className="flex-[2] bg-softgold text-charcoal py-4 font-sans text-xs font-bold tracking-widest hover:bg-white transition-colors rounded-sm"
                >
                  CONFIRM PAYMENT
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;