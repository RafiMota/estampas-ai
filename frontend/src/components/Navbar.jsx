export default function Navbar({ activeTab, onTabChange, favoriteCount }) {
  return (
    <header id="main-navbar" className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="bg-gray-900 text-white text-center py-2 text-xs font-medium tracking-wide">
        Frete grátis para todo o Brasil acima de R$199
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <button onClick={() => onTabChange('catalog')} className="cursor-pointer shrink-0">
            <img
              src="/logo-gocase.png"
              alt="gocase"
              className="h-8 sm:h-12 w-auto"
            />
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-full p-1">
            <button
              id="tab-catalog"
              onClick={() => onTabChange('catalog')}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-sm font-bold sm:font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Catálogo
            </button>
            <button
              id="tab-forme"
              onClick={() => onTabChange('forme')}
              className={`relative px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-sm font-bold sm:font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-2 ${
                activeTab === 'forme'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="hidden xs:inline">✨</span> Pra Mim
              {favoriteCount > 0 && (
                <span className="min-w-[14px] h-[14px] sm:min-w-[18px] sm:h-[18px] rounded-full bg-red-500 text-white text-[8px] sm:text-[10px] font-bold flex items-center justify-center px-1">
                  {favoriteCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => onTabChange('forme')}
            className="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
          >
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 sm:-top-1.5 sm:-right-1.5 sm:min-w-[16px] sm:h-4 rounded-full bg-red-500 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center px-1">
                  {favoriteCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-medium">Favoritos</span>
          </button>

        </div>
      </nav>
    </header>
  );
}