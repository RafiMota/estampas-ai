import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations } from '../api';
import ProductCard from './ProductCard';

export default function ForMe({ favorites, onToggleFavorite, allProducts }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecommendations = useCallback(async () => {
    if (favorites.size === 0) {
      setRecommendations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecommendations([...favorites], 12);
      setRecommendations(data.recommendations);
    } catch (err) {
      setError('Não foi possível carregar as recomendações. Verifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  if (favorites.size === 0) {
    return (
      <section id="forme-section" className="animate-fade-in">
        <div className="mb-8">
          <h2
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pra Mim
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Recomendações personalizadas pela IA com base no seu gosto
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-9 h-9 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h3
            className="text-lg font-bold text-gray-800 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Nenhum favorito ainda
          </h3>
          <p className="text-gray-500 text-sm text-center max-w-sm leading-relaxed">
            Favorite algumas estampas no catálogo e nossa IA vai recomendar produtos com o seu estilo.
          </p>
          <div className="mt-5 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">Vá ao catálogo e clique no coração</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="forme-section" className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pra Mim
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold tracking-wider">
              IA
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Baseado em {favorites.size} {favorites.size === 1 ? 'favorito' : 'favoritos'} — recomendações visuais via CLIP
          </p>
        </div>
      </div>

      {/* Favorited thumbnails */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
              Seus favoritos
            </p>
            <div className="flex gap-2 flex-wrap">
              {allProducts
                .filter(p => favorites.has(p.id))
                .map(p => (
                  <div key={p.id} className="relative group/thumb">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover ring-2 ring-red-400/50 transition-transform duration-200 group-hover/thumb:scale-105"
                    />
                    <button
                      onClick={() => onToggleFavorite(p.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Remover ${p.name} dos favoritos`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200/50 flex-1 max-w-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Interesses Detectados
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from(new Set(allProducts
                .filter(p => favorites.has(p.id))
                .flatMap(p => p.tags || [])
                .filter(t => t !== 'geral')
              )).slice(0, 5).map(tag => (
                <span key={tag} className="px-2 py-1 bg-white border border-gray-200 text-[10px] font-bold text-gray-700 rounded-md shadow-sm">
                  #{tag}
                </span>
              )).length > 0 ? (
                Array.from(new Set(allProducts
                  .filter(p => favorites.has(p.id))
                  .flatMap(p => p.tags || [])
                  .filter(t => t !== 'geral')
                )).slice(0, 5).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white border border-gray-200 text-[10px] font-bold text-gray-700 rounded-md shadow-sm">
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-gray-400 italic">Explore mais estampas para ver seu perfil...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="skeleton" style={{ aspectRatio: '4/5' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded w-4/5" />
                <div className="h-2.5 skeleton rounded w-2/5" />
                <div className="h-9 skeleton rounded-lg mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white rounded-xl border border-red-100 p-6 text-center">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Recommendations grid */}
      {!loading && !error && recommendations.length > 0 && (
        <>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">
            Recomendados para você
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {recommendations.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={onToggleFavorite}
                index={i}
              />
            ))}
          </div>
        </>
      )}

      {!loading && !error && recommendations.length === 0 && favorites.size > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">Todos os produtos já foram favoritados! 🎉</p>
        </div>
      )}
    </section>
  );
}