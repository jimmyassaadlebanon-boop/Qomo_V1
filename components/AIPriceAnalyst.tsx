import React, { useState } from 'react';
import { Sparkles, Search, ExternalLink, ChevronDown, ChevronUp, Check, X as XIcon, AlertCircle } from 'lucide-react';
import { analyzePriceComparison, ensureApiKey, PriceAnalysisResult } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface AIPriceAnalystProps {
  productName: string;
  basePrice: number;
}

export const AIPriceAnalyst: React.FC<AIPriceAnalystProps> = ({ productName, basePrice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ data: PriceAnalysisResult | null; sources: { title: string; uri: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!isOpen) {
        setIsOpen(true);
    }
    
    // If we already have analysis, just toggle open/close (handled above)
    if (analysis) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const hasKey = await ensureApiKey();
      if (!hasKey) {
        setError("API Key required for analysis.");
        setIsAnalyzing(false);
        return;
      }

      const result = await analyzePriceComparison(productName, basePrice);
      if (!result.data) {
          throw new Error("Invalid analysis format received.");
      }
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError("Unable to complete market analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full bg-white/5 border border-offwhite/10 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300">
      
      {/* Header / Trigger */}
      <button 
        onClick={() => {
            if (analysis) setIsOpen(!isOpen);
            else handleAnalyze();
        }}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAnalyzing ? 'animate-pulse bg-softgold/20 text-softgold' : 'bg-offwhite/5 text-offwhite/60 group-hover:text-softgold group-hover:bg-softgold/10'}`}>
                <Sparkles size={16} />
            </div>
            <div>
                <h3 className="font-serif text-lg text-offwhite group-hover:text-softgold transition-colors">AI Price Analyst</h3>
                <p className="font-sans text-[10px] tracking-widest text-offwhite/40 uppercase">
                    {analysis ? 'Analysis Complete' : 'Compare with Market'}
                </p>
            </div>
        </div>
        
        {analysis && (
             <div className="text-offwhite/40">
                 {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
             </div>
        )}
      </button>

      {/* Content Area */}
      <AnimatePresence>
        {(isOpen || isAnalyzing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-offwhite/5">
                
                {isAnalyzing && (
                    <div className="py-8 text-center space-y-4">
                        <div className="inline-block animate-spin text-softgold">
                            <Search size={24} />
                        </div>
                        <p className="font-sans text-xs tracking-widest text-offwhite/50 animate-pulse">
                            SCANNING RETAILERS...
                        </p>
                    </div>
                )}

                {!isAnalyzing && analysis && analysis.data && (
                    <div className="space-y-6 pt-6">
                        
                        {/* Qomo Baseline */}
                        <div className="flex justify-between items-center bg-softgold/5 border border-softgold/20 p-4 rounded-lg">
                            <span className="font-sans text-sm font-bold text-softgold">QOMO BASE PRICE</span>
                            <span className="font-serif text-xl text-softgold">${analysis.data.qomoBasePrice.toFixed(2)}</span>
                        </div>

                        {/* Competitor List */}
                        <div className="space-y-3">
                            {analysis.data.comparisons.map((comp, idx) => {
                                const isCheaper = comp.whoIsCheaper === 'retailer';
                                const isQomoCheaper = comp.whoIsCheaper === 'qomo';

                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-offwhite/5 hover:bg-offwhite/10 transition-colors border border-transparent hover:border-offwhite/10">
                                        <div className="flex flex-col">
                                            <a 
                                                href={comp.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1 font-serif text-offwhite hover:text-softgold transition-colors"
                                            >
                                                {comp.retailer}
                                                <ExternalLink size={10} className="opacity-50" />
                                            </a>
                                            <span className="text-[10px] text-offwhite/40 uppercase tracking-widest font-sans">
                                                {comp.currency}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-serif text-lg text-offwhite/80">
                                                {comp.price.toFixed(2)}
                                            </div>
                                            {isQomoCheaper && (
                                                <div className="text-[10px] text-green-400 font-sans font-bold flex items-center justify-end gap-1">
                                                    QOMO IS CHEAPER
                                                </div>
                                            )}
                                            {isCheaper && (
                                                <div className="text-[10px] text-offwhite/30 font-sans flex items-center justify-end gap-1">
                                                    LOWER STARTING PRICE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Analysis Footer */}
                        {analysis.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-offwhite/10">
                                <h4 className="font-sans text-[10px] font-bold tracking-widest text-offwhite/40 uppercase mb-3">
                                    Verified Sources
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.sources.map((source, idx) => (
                                        <a 
                                            key={idx}
                                            href={source.uri}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] px-2 py-1 bg-offwhite/5 rounded border border-offwhite/10 text-offwhite/50 hover:text-offwhite hover:border-offwhite/30 transition-colors truncate max-w-[150px]"
                                        >
                                            {source.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="py-4 text-center text-red-400 text-xs font-sans tracking-wide flex items-center justify-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};