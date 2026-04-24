import { useState } from 'react';

function getProductPricing(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = Math.imul(31, hash) + name.charCodeAt(i) | 0;
  }
  const h = Math.abs(hash);
  const originals = [79.9, 89.9, 99.9, 109.9, 119.9];
  const discounts = [20, 25, 30, 34, 40, 44];
  const originalPrice = originals[h % originals.length];
  const discountPct = discounts[(h >> 8) % discounts.length];
  const finalPrice = Math.round(originalPrice * (1 - discountPct / 100) * 10) / 10;
  const hasPromo = (h % 10) < 6;
  return { originalPrice, finalPrice, discountPct, hasPromo };
}

function fmt(price) {
  return `R$${price.toFixed(2).replace('.', ',')}`;
}

export default function ProductCard({ product, isFavorite, onToggleFavorite, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const { originalPrice, finalPrice, discountPct, hasPromo } = getProductPricing(product.name);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setAnimateHeart(true);
    onToggleFavorite(product.id);
    setTimeout(() => setAnimateHeart(false), 600);
  };

  return (
    <div
      className="card-enter bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '4/5' }}>
        {hasPromo && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded leading-none tracking-wider border border-red-700 shadow-sm">
            LEVE 2, PAGUE 1
          </div>
        )}

        <button
          id={`fav-btn-${product.id}`}
          onClick={handleFavorite}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
            isFavorite ? 'bg-red-50' : 'bg-white/90 hover:bg-white'
          } ${animateHeart ? 'animate-heart-beat' : ''}`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-colors duration-200 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-400 group-hover:stroke-red-400'}`} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Tags */}
        {product.tags && product.tags.length > 0 && product.tags[0] !== 'geral' && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.tags.slice(0, 1).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-[8px] text-white font-bold uppercase rounded border border-white/20">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3
          className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {product.name}
        </h3>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400 line-through">{fmt(originalPrice)}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">{fmt(finalPrice)}</span>
            <span className="text-xs font-bold text-green-600">{discountPct}% OFF</span>
          </div>
        </div>

        <button className="mt-auto w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          Comprar
        </button>
      </div>
    </div>
  );
}