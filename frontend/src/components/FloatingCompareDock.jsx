import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCompareDock({ selectedItems, onRemove, onCompare, type }) {
  if (selectedItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto min-w-[400px] max-w-2xl bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {selectedItems.map((item, idx) => (
              <div 
                key={idx} 
                className="w-10 h-10 rounded-full bg-dark-800 border-2 border-dark-900 flex items-center justify-center relative group cursor-pointer"
                onClick={() => onRemove(item)}
              >
                <span className="text-lg">{item.logo || (type === 'ai' ? '🤖' : '☁️')}</span>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm">
            <span className="text-white font-bold">{selectedItems.length}</span>
            <span className="text-gray-400"> / 5 selected</span>
          </div>
        </div>

        <button 
          onClick={onCompare}
          disabled={selectedItems.length < 2}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            selectedItems.length >= 2 
            ? type === 'ai' 
              ? 'bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
              : 'bg-neon-blue text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Compare {type === 'ai' ? 'Tools' : 'Services'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
