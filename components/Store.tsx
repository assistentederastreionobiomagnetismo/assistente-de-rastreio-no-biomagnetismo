
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { StoreIcon, ExternalLinkIcon, CheckIcon } from './icons/Icons';

interface StoreProps {
  products: Product[];
  onExit: () => void;
}

const Store: React.FC<StoreProps> = ({ products, onExit }) => {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const featuredProducts = products.filter(p => p.isFeatured);
  
  // Auto-advance carousel
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentCarouselIndex(prev => (prev + 1) % featuredProducts.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
            <StoreIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nossa Loja</h2>
            <p className="text-slate-500 text-sm">Ofertas exclusivas e recomendações para você.</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
        >
          Voltar ao Painel
        </button>
      </div>

      {/* Featured Carousel */}
      {featuredProducts.length > 0 && (
        <div className="relative mb-12 group">
          <div className="overflow-hidden rounded-3xl shadow-2xl aspect-[21/9] md:aspect-[25/9] relative bg-slate-900">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                  index === currentCarouselIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                {/* Background Image with Overlay */}
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent flex items-center p-8 md:p-16">
                  <div className="max-w-xl space-y-4 md:space-y-6">
                    <span className="inline-block px-3 py-1 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Destaque da Semana</span>
                    <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">{product.title}</h3>
                    <p className="text-slate-200 text-sm md:text-lg line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="pt-4">
                      <a 
                        href={product.affiliateLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-400 transition-all shadow-lg hover:shadow-teal-500/40 group/btn transform hover:-translate-y-1"
                      >
                        {product.ctaText}
                        <ExternalLinkIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          {featuredProducts.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredProducts.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentCarouselIndex ? 'w-8 bg-teal-500' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-300"
          >
            {/* Visual Content (Photo or Video) */}
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              {product.videoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                   {/* This is a simple placeholder for video. In a real app, you'd use a player */}
                   <img src={product.imageUrl} className="w-full h-full object-cover opacity-50 absolute inset-0" />
                   <div className="z-10 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                         <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Vídeo Demonstrativo</span>
                   </div>
                </div>
              ) : (
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              {product.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">Destaque</span>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">{product.title}</h4>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              {/* Copy Section */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 italic text-slate-600 text-sm border-l-4 border-teal-500 relative">
                <svg className="absolute -top-2 -left-2 w-6 h-6 text-teal-200 fill-current opacity-50" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L11.017 3V21H14.017ZM7.017 21L7.017 18C7.017 16.8954 7.91243 16 9.017 16H12.017C12.5693 16 13.017 15.5523 13.017 15V9C13.017 8.44772 12.5693 8 12.017 8H9.017C7.91243 8 7.017 7.10457 7.017 6V3L4.017 3V21H7.017Z" /></svg>
                "{product.copyText}"
              </div>

              <div className="mt-auto">
                <a 
                  href={product.affiliateLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-teal-600 transition-all shadow-lg transform active:scale-95 group/cta"
                >
                  <span className="uppercase tracking-widest text-xs">{product.ctaText}</span>
                  <ExternalLinkIcon className="w-4 h-4 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <StoreIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-400 font-medium">Nenhum produto cadastrado no momento.</p>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-10">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
               <CheckIcon className="w-6 h-6" />
            </div>
            <div>
               <p className="font-bold text-slate-800 text-sm">Produtos Verificados</p>
               <p className="text-slate-500 text-xs">Curadoria especial de qualidade.</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
               <p className="font-bold text-slate-800 text-sm">Compra Segura</p>
               <p className="text-slate-500 text-xs">Links para plataformas confiáveis.</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
               <p className="font-bold text-slate-800 text-sm">Suporte Prioritário</p>
               <p className="text-slate-500 text-xs">Ajuda em caso de dúvidas.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Store;
