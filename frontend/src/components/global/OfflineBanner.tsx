import React from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { WifiOff, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineBanner = () => {
  const { isOffline, queuedActions } = useOfflineStore();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-white overflow-hidden"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm font-bold shadow-inner">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>أنت حالياً غير متصل بالإنترنت. تعمل في وضع عدم الاتصال.</span>
            {queuedActions > 0 && (
              <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                <RefreshCcw className="w-3 h-3" />
                {queuedActions} إجراء في الانتظار
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
