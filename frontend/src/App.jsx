import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from './api';
import Navbar from './components/Navbar';
import Gallery from './components/Gallery';
import ForMe from './components/ForMe';

const FAVORITES_KEY = 'estampas-ai-favorites';

function loadFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) return new Set(JSON.parse(saved));
  } catch (e) {
    console.warn('Erro ao carregar favoritos:', e);
  }
  return new Set();
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const handleToggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoriteCount={favorites.size}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' ? (
          <Gallery
            products={products}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <ForMe
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            allProducts={products}
          />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-lg font-black tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              go<span className="text-red-500">case</span>
            </span>
            <p className="text-xs text-gray-400">
              MVP — Recomendação Visual com CLIP + ChromaDB • GoHacks 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}