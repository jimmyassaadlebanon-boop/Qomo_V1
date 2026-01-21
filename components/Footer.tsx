import React from 'react';

interface FooterProps {
  onFaqClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onFaqClick }) => {
  return (
    <footer className="w-full py-12 bg-charcoal border-t border-offwhite/5 text-offwhite/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="font-serif text-xl text-offwhite">Qomo.</div>
        
        <div className="flex gap-8 font-sans text-xs tracking-widest">
          <a href="#" className="hover:text-softgold transition-colors">ABOUT</a>
          <button onClick={onFaqClick} className="hover:text-softgold transition-colors uppercase">FAQ</button>
        </div>

        <div className="font-sans text-xs">
          © {new Date().getFullYear()} Qomo Inc.
        </div>
      </div>
    </footer>
  );
};

export default Footer;