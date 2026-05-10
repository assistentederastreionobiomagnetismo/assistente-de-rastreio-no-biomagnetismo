
import React, { useState } from 'react';
import { Product } from '../types';
import { ExternalLinkIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-300">
      {/* Visual Content (Multiple Images Carousel) */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {(product.imageUrls || []).map((url, idx) => (
          <img 
            key={idx}
            src={url} 
            alt={product.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              idx === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
            }`}
          />
        ))}

        {/* Video Overlay / Play Button */}
        {product.videoUrls && product.videoUrls.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <button 
              onClick={() => setShowVideoModal(product.videoUrls[0])}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform shadow-2xl group/play"
            >
              <svg className="w-8 h-8 fill-current group-hover:text-teal-400 transition-colors" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        )}

        {/* Carousel Controls (Dots) */}
        {(product.imageUrls?.length || 0) > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full z-10">
            {product.imageUrls.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-4 bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}

        {/* Next/Prev Arrows for Card */}
        {(product.imageUrls?.length || 0) > 1 && (
          <>
            <button 
              onClick={() => setActiveImageIndex(prev => (prev - 1 + product.imageUrls.length) % product.imageUrls.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => setActiveImageIndex(prev => (prev + 1) % product.imageUrls.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        {product.isFeatured && (
          <div className="absolute top-4 left-4 z-10">
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

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
            <video src={showVideoModal} controls autoPlay className="w-full h-full" />
            <button 
              onClick={() => setShowVideoModal(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
