import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowUp, X, Dices, ShoppingCart, Zap, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TutorialOverlayProps {
  step: number; // 0: Inactive, 1: First roll, 2: Rolls 1-2, 25: 3rd roll OK prompt, 3: Open shop, 4: Inside shop, 5: Close shop, 6: Let it ride
  onSkip: () => void;
  onDismissOkPrompt?: () => void;
  onFinishTutorial?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  onSkip,
  onDismissOkPrompt,
  onFinishTutorial
}) => {
  if (step === 0) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-3 select-none font-pixel overflow-hidden">

        {/* Top spacer to ensure entire Header HUD (Points, Last Roll, Shop, Options) is 100% visible & unblocked */}
        <div className="h-28 sm:h-36 pointer-events-none" />

        {/* Step 1: Initial Launch Message (Positioned over the upper area of the table) */}
        {step === 1 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-emerald-400 p-3 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.4)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-300 text-xs font-bold">
                <Dices className="w-3.5 h-3.5 animate-bounce" />
                <span>Paso 1: ¡Lanza los Dados!</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-snug">
                Toca la mesa o pulsa el botón <strong className="text-emerald-400">¡TIRAR DADOS!</strong> para tirar los dados y conseguir puntos.
              </p>

              <button
                onClick={() => {
                  playClickSound();
                  onSkip();
                }}
                className="mt-0.5 px-3 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold transition-all active:scale-95 cursor-pointer pointer-events-auto"
              >
                Saltar Tutorial
              </button>
            </motion.div>
          </div>
        )}

        {/* Step 2: Keep rolling until 50 points (Positioned over upper table) */}
        {step === 2 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-yellow-400 p-2.5 sm:p-3 rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.4)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-950/80 border border-yellow-500/60 rounded-full text-yellow-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>¡Sigue tirando!</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-tight">
                Sigue tirando dados hasta conseguir <strong className="text-yellow-400">50 puntos</strong>.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 25: 3rd Roll Info Prompt with OK Button (Centered in view) */}
        {step === 25 && (
          <div className="relative z-50 w-full max-w-xs sm:max-w-sm mx-auto my-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-2 border-yellow-400 p-4 sm:p-5 rounded-3xl shadow-[0_0_40px_rgba(250,204,21,0.6)] flex flex-col items-center text-center space-y-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <ShoppingCart className="w-6 h-6 animate-bounce" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-white">
                Objetivo de Tienda
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                Junta <strong className="text-yellow-400 text-sm">50 puntos</strong> para desbloquear la tienda.
              </p>

              <button
                onClick={() => {
                  playClickSound();
                  if (onDismissOkPrompt) onDismissOkPrompt();
                }}
                className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase rounded-xl border border-yellow-200 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}

        {/* Step 3: Open Shop Prompt (Positioned cleanly in upper-middle of table) */}
        {step === 3 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-cyan-400 p-3.5 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)] flex flex-col items-center text-center space-y-2 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-950/80 border border-cyan-500/60 rounded-full text-cyan-300 text-xs font-bold">
                <ShoppingCart className="w-3.5 h-3.5 animate-bounce" />
                <span>Paso 2: ¡Abre la Tienda!</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-snug">
                Abre la tienda 🛒 presionando arriba a la derecha.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 4: Inside Shop message */}
        {step === 4 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none mt-16">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-amber-400 p-3 sm:p-3.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.6)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/60 rounded-full text-amber-300 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Paso 3: Compra una Mejora</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-snug">
                Compra <strong className="text-amber-300">Dedos Rápidos</strong> (50 pts) para reducir el tiempo entre tiradas.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 5: Close Shop message */}
        {step === 5 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none mt-16">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-purple-400 p-3 sm:p-3.5 rounded-2xl shadow-[0_0_30px_rgba(192,132,252,0.6)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-950/80 border border-purple-500/60 rounded-full text-purple-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Paso 4: Cierra la Tienda</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-snug">
                ¡Mejora adquirida! Cierra la tienda pulsando la <strong className="text-purple-300">X</strong> arriba a la derecha.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 6: LET IT RIDE Final Banner */}
        {step === 6 && (
          <div className="relative z-50 w-full max-w-xs sm:max-w-sm mx-auto my-auto pointer-events-auto">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-2 border-yellow-400 p-5 sm:p-6 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.6)] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <Dices className="w-8 h-8 animate-bounce text-yellow-300" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-200 uppercase tracking-widest font-pixel">
                  Esto es todo.
                </h3>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  if (onFinishTutorial) onFinishTutorial();
                }}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-2xl sm:text-3xl uppercase tracking-wider rounded-2xl border-2 border-emerald-300 shadow-xl active:scale-95 transition-all cursor-pointer font-pixel"
              >
                LET IT RIDE
              </button>
            </motion.div>
          </div>
        )}

        {/* Bottom spacing spacer */}
        <div className="h-16 pointer-events-none" />
      </div>
    </AnimatePresence>
  );
};
