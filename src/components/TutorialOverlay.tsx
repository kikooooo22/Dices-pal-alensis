import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowDown, ArrowUp, X, Dices, ShoppingCart, Zap, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TutorialOverlayProps {
  step: number; // 0 to 6
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onSkip }) => {
  if (step === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-pixel">
        
        {/* Semi-transparent dark vignette */}
        <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-[1.5px]" />

        {/* Top Control Bar: Tutorial Status & Skip Button */}
        <div className="relative z-50 flex justify-between items-center w-full max-w-lg mx-auto pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border-2 border-yellow-400/80 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)] text-yellow-300 text-xs sm:text-sm font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>Guía de Inicio ({Math.min(step, 4)}/4)</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onSkip();
            }}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md cursor-pointer"
          >
            <span>Saltar</span>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Interactive Step Tooltip Card */}
        <div className="relative z-50 w-full max-w-md mx-auto pointer-events-auto my-auto">
          {step === 1 && (
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-emerald-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(52,211,153,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Dices className="w-7 h-7 animate-bounce" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¡Bienvenido a Dices!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Toca la mesa o pulsa el botón verde <strong className="text-emerald-400">¡TIRAR DADOS!</strong> para realizar tus primeros lanzamientos y ganar puntos.
              </p>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold animate-pulse pt-1">
                <ArrowDown className="w-4 h-4" />
                <span>Pulsa abajo para tirar</span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-yellow-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(250,204,21,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¡Gran lanzamiento!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Sigue tirando dados hasta reunir al menos <strong className="text-yellow-400">50 puntos</strong> para desbloquear tu primera mejora.
              </p>
              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold animate-pulse pt-1">
                <ArrowDown className="w-4 h-4" />
                <span>Continúa tirando dados</span>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-blue-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(96,165,250,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-300">
                <ShoppingCart className="w-7 h-7 animate-bounce" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¡Puntos Suficientes!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Ya tienes suficientes puntos. Abre la <strong className="text-blue-400">Tienda 🛒</strong> arriba a la derecha para comprar tu primera mejora.
              </p>
              <div className="flex items-center gap-1 text-blue-400 text-xs font-bold animate-pulse pt-1">
                <ArrowUp className="w-4 h-4" />
                <span>Abre la Tienda arriba</span>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-amber-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(251,191,36,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                <Zap className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Compra una Mejora
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Pulsa en el botón verde de <strong className="text-amber-400">Comprar</strong> en <strong className="text-white">Dedos Rápidos</strong> para reducir el tiempo entre tiros.
              </p>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-purple-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(192,132,252,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
                <CheckCircle2 className="w-7 h-7 animate-bounce" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¡Mejora Adquirida!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Cierra la tienda pulsando la <strong className="text-purple-400">X</strong> arriba para regresar a la mesa.
              </p>
              <div className="flex items-center gap-1 text-purple-400 text-xs font-bold animate-pulse pt-1">
                <ArrowUp className="w-4 h-4" />
                <span>Cierra la Tienda</span>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-emerald-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(52,211,153,0.4)] flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¡Prueba tu Velocidad!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
                Lanza dados una vez más para probar tu nueva mejora y completar el tutorial.
              </p>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold animate-pulse pt-1">
                <ArrowDown className="w-4 h-4" />
                <span>¡Tira los dados!</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Empty bottom spacer to center properly */}
        <div className="h-6" />
      </div>
    </AnimatePresence>
  );
};
