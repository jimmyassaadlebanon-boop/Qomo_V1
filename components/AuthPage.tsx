import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for auth
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="w-full h-screen bg-charcoal flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-softgold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-offwhite/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/5 border border-offwhite/10 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-offwhite mb-2">Qomo.</h1>
          <p className="font-sans text-xs tracking-widest text-offwhite/50 uppercase">
            {isLogin ? 'Welcome Back' : 'Join the Drop'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-sans font-bold tracking-widest text-offwhite/70 ml-1">EMAIL</label>
            <input 
              type="email" 
              required
              className="w-full bg-charcoal/50 border border-offwhite/20 rounded-lg px-4 py-3 text-offwhite placeholder-offwhite/30 focus:outline-none focus:border-softgold transition-colors font-sans"
              placeholder="enter@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-sans font-bold tracking-widest text-offwhite/70 ml-1">PASSWORD</label>
            <input 
              type="password" 
              required
              className="w-full bg-charcoal/50 border border-offwhite/20 rounded-lg px-4 py-3 text-offwhite placeholder-offwhite/30 focus:outline-none focus:border-softgold transition-colors font-sans"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-offwhite text-charcoal font-sans font-bold text-sm tracking-widest py-4 rounded-lg hover:bg-softgold transition-colors mt-4 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              isLogin ? 'LOG IN' : 'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-sans text-offwhite/40 hover:text-offwhite transition-colors border-b border-transparent hover:border-offwhite/40 pb-1"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
