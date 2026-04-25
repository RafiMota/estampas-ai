import { useEffect, useState } from 'react';

export default function Toast({ message, visible, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Matches toastOut animation duration
  };

  if (!visible && !isExiting) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <div className="bg-gray-950/90 text-white px-6 py-5 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-start gap-4 border border-white/10 backdrop-blur-2xl w-[450px] max-w-[calc(100vw-3rem)]">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20 mt-0.5">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
            Personal Shopper
          </span>
          <p className="text-[14px] font-medium leading-[1.5] text-gray-200">
            {message.split('*').map((part, i) =>
              i % 2 === 1 ? <span key={i} className="text-white font-bold italic">{part}</span> : part
            )}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          aria-label="Fechar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
