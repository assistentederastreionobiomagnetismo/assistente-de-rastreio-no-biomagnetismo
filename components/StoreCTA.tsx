
import React from 'react';
import { StoreIcon, ExternalLinkIcon } from './icons/Icons';

interface StoreCTAProps {
  onOpenStore: () => void;
  className?: string;
}

const StoreCTA: React.FC<StoreCTAProps> = ({ onOpenStore, className }) => (
  <div className={`mx-auto mt-12 mb-20 bg-gradient-to-r from-teal-600 to-indigo-700 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden relative group animate-fade-in print:hidden ${className || 'max-w-6xl'}`}>
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-teal-400/20 rounded-full blur-2xl group-hover:translate-x-12 transition-transform duration-700"></div>
    
    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-white">Precisa de algo para seu consultório?</h3>
        <p className="text-teal-50/80 text-sm md:text-base font-medium">Acesse nossa loja e veja nossas ofertas exclusivas para terapeutas.</p>
      </div>
      <button 
        onClick={onOpenStore}
        className="whitespace-nowrap px-8 py-4 bg-white text-teal-700 font-black rounded-2xl hover:bg-teal-50 transition-all shadow-xl hover:shadow-white/20 transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 group/btn"
      >
        <StoreIcon className="w-5 h-5" />
        ACESSAR LOJA
        <ExternalLinkIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

export default StoreCTA;
