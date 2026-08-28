import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowUp, X, Dices, ShoppingCart, Zap, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TutorialOverlayProps {
  step: number; // 0: Inactive, 1: First roll, 2: Silent rolls, 25: 3rd roll 50-pts prompt, 3: Open shop, 40: Shop intro pop-up, 4: Buy Dedos Rapidos, 5: Close shop, 6: Let it ride
  onSkip: () => void;
  onDismissOkPrompt?: () => void;
  onDismissShopIntro?: () => void;
  onFinishTutorial?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  onSkip,
  onDismissOkPrompt,
  onDismissShopIntro,
  onFinishTutorial
}) => {
  if (step === 0) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-[60] pointer-events-none flex flex-col justify-between p-3 select-none font-pixel overflow-hidden">

        {/* Top spacer to ensure Header HUD (Points, Last Roll, Shop, Options) is 100% visible */}
        <div className="h-16 sm:h-22 pointer-events-none" />

        {/* Step 1: Initial Launch Message (Positioned at ~1/4 table height from top) */}
        {step === 1 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none mt-1 sm:mt-3">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-emerald-400 p-4 rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.4)] flex flex-col items-center text-center space-y-2 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-300 text-xs sm:text-sm font-bold">
                <Dices className="w-4 h-4 animate-bounce" />
                <span>Paso 1: ¡Lanza los Dados!</span>
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-bold leading-snug">
                Toca la mesa o pulsa el botón <strong className="text-emerald-400">¡TIRAR DADOS!</strong> para tirar los dados y conseguir puntos.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 25: 50-Points Goal Prompt with OK Button (Modal Backdrop that blocks all outside clicks) */}
        {step === 25 && (
          <div
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-2 border-yellow-400 p-5 sm:p-6 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.6)] flex flex-col items-center text-center space-y-4 max-w-xs sm:max-w-sm w-full cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <ShoppingCart className="w-7 h-7 animate-bounce" />
              </div>

              <p className="text-base sm:text-lg text-slate-100 font-bold leading-snug">
                Junta <strong className="text-yellow-400 text-lg sm:text-xl font-black">50 puntos</strong> para desbloquear la tienda.
              </p>

              <button
                onClick={() => {
                  playClickSound();
                  if (onDismissOkPrompt) onDismissOkPrompt();
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-wider rounded-xl border border-yellow-200 shadow-lg active:scale-95 transition-all cursor-pointer font-pixel"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}

        {/* Step 3: Open Shop Prompt (Positioned cleanly in upper-middle of table) */}
        {step === 3 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none mt-1 sm:mt-3">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-cyan-400 p-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)] flex flex-col items-center text-center space-y-2 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-cyan-950/80 border border-cyan-500/60 rounded-full text-cyan-300 text-xs sm:text-sm font-bold">
                <ShoppingCart className="w-4 h-4 animate-bounce" />
                <span>Paso 2: ¡Abre la Tienda!</span>
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-bold leading-snug">
                Abre la tienda 🛒 presionando arriba a la derecha.
              </p>
            </motion.div>
          </div>
        )}

        {/* Step 40: Shop Introduction Pop-up Modal */}
        {step === 40 && (
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-2 border-blue-400 p-5 sm:p-6 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.6)] flex flex-col items-center text-center space-y-4 max-w-xs sm:max-w-sm w-full cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-300">
                <ShoppingCart className="w-7 h-7 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white font-pixel">
                  Comprar en la tienda
                </h3>
                <p className="text-sm sm:text-base text-slate-200 font-bold leading-snug">
                  Aquí puedes comprar mejoras que te ayudarán a conseguir puntos más rápido.
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  if (onDismissShopIntro) onDismissShopIntro();
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg uppercase tracking-wider rounded-xl border border-blue-300 shadow-lg active:scale-95 transition-all cursor-pointer font-pixel"
              >
                ¡Lo tengo!
              </button>
            </motion.div>
          </div>
        )}

        {/* Step 4: Inside Shop message (Buy Dedos Rapidos) */}
        {step === 4 && (
          <div className="relative z-50 w-full max-w-sm mx-auto pointer-events-none mt-16">
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 border-2 border-amber-400 p-3.5 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.6)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-amber-950/80 border border-amber-500/60 rounded-full text-amber-300 text-xs sm:text-sm font-bold">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Paso 3: Compra una Mejora</span>
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-bold leading-snug">
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
              className="bg-slate-900/95 border-2 border-purple-400 p-3.5 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(192,132,252,0.6)] flex flex-col items-center text-center space-y-1.5 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-purple-950/80 border border-purple-500/60 rounded-full text-purple-300 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                <span>Paso 4: Cierra la Tienda</span>
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-bold leading-snug">
                Cierra la tienda pulsando la <strong className="text-purple-300">X</strong> arriba a la derecha.
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
