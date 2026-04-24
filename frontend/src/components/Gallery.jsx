import ProductCard from './ProductCard';

export default function Gallery({ products, favorites, onToggleFavorite }) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <section id="gallery-section" className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Todos os produtos
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} estampas disponíveis
          </p>
        </div>
        {favorites.size > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500 shrink-0">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span><strong>{favorites.size}</strong> favoritados</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.has(product.id)}
            onToggleFavorite={onToggleFavorite}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}