
import React, { useState } from 'react';
import { Product } from '../types';
import { ExternalLinkIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const allMedia = [
    ...(product.imageUrls || []).map(url => ({ type: 'image' as const, url })),
    ...(product.videoUrls || []).map(url => ({ type: 'video' as const, url }))
  ];

  const handleOpenGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const nextMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryIndex(prev => (prev + 1) % allMedia.length);
  };

  const prevMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-300">
      {/* Visual Content (Clickable to open gallery) */}
      <div 
        className="relative aspect-video overflow-hidden bg-slate-900 cursor-zoom-in"
        onClick={() => handleOpenGallery(activeThumbnailIndex)}
      >
        {(product.imageUrls || []).map((url, idx) => (
          <img 
            key={idx}
            src={url} 
            alt={product.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              idx === activeThumbnailIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
            }`}
          />
        ))}

        {/* Video Overlay / Play Button indicator */}
        {product.videoUrls && product.videoUrls.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform shadow-2xl">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}

        {/* Thumbnail Dots */}
        {(product.imageUrls?.length || 0) > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full z-10">
            {product.imageUrls.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveThumbnailIndex(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeThumbnailIndex ? 'w-4 bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
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

      {/* Expanded Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-xl animate-fade-in p-4 md:p-10">
          <div className="absolute top-6 right-6 flex gap-4 z-[110]">
             <span className="px-4 py-2 bg-white/10 rounded-full text-white text-xs font-black backdrop-blur-md border border-white/10">
               {galleryIndex + 1} / {allMedia.length}
             </span>
             <button 
                onClick={() => setIsGalleryOpen(false)}
                className="bg-white hover:bg-red-50 text-slate-900 hover:text-red-600 p-3 rounded-full shadow-2xl transition-all active:scale-90 border-2 border-white/20 group/close"
                title="Fechar Galeria"
              >
                <svg className="w-6 h-6 transition-transform group-hover/close:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>

          <div className="relative w-full max-w-6xl h-full flex items-center justify-center group/gallery">
            {/* Nav Arrows */}
            {allMedia.length > 1 && (
              <>
                <button 
                  onClick={prevMedia}
                  className="absolute left-0 md:-left-20 z-10 p-4 text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={nextMedia}
                  className="absolute right-0 md:-right-20 z-10 p-4 text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl bg-black/20">
              {allMedia[galleryIndex].type === 'image' ? (
                <img 
                  src={allMedia[galleryIndex].url} 
                  className="max-w-full max-h-full object-contain animate-scale-up"
                  alt={`Mídia ${galleryIndex + 1}`}
                />
              ) : (
                <video 
                  src={allMedia[galleryIndex].url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-full"
                />
              )}
            </div>
          </div>

          {/* Gallery Thumbnails Strip (Bottom) */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-4 max-w-full px-4">
            {allMedia.map((media, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                  idx === galleryIndex ? 'border-teal-500 scale-110 shadow-lg shadow-teal-500/20' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                {media.type === 'image' ? (
                  <img src={media.url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
