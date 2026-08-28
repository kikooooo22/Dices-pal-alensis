import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playMilestone1Bells, playMilestone2Ambiance, playClickSound } from '../utils/audio';
import { formatNumber } from '../utils/format';
import { Sparkles, Trophy, CheckCircle2, Award, Zap, Flame } from 'lucide-react';

interface MilestonesProps {
  showM1: boolean;
  showM2: boolean;
  onCloseM1: () => void;
  onCloseM2: () => void;
  totalPoints?: number;
  totalRolls?: number;
  highestStreak?: number;
  m1AlreadyUnlocked?: boolean;
}

export const Milestones: React.FC<MilestonesProps> = ({ 
  showM1, 
  showM2, 
  onCloseM1, 
  onCloseM2,
  totalPoints = 0,
  totalRolls = 0,
  highestStreak = 0,
  m1AlreadyUnlocked = false,
}) => {
  const [m1Step, setM1Step] = useState<0 | 1>(0);
  const [m2Step, setM2Step] = useState<0 | 1>(0);

  // Milestone 1 (Meme / Birthday) Trigger
  useEffect(() => {
    if (showM1) {
      setM1Step(0);
      playMilestone1Bells();

      // Confetti burst from multiple origins
      const duration = 2500;
      const end = Date.now() + duration;

      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 28,
          spread: 360,
          ticks: 45,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ['#00f0ff', '#3b82f6', '#8b5cf6', '#facc15', '#ffffff'],
          zIndex: 9999,
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [showM1]);

  // Milestone 2 Trigger
  useEffect(() => {
    if (showM2) {
      setM2Step(0);
      playMilestone2Ambiance();
    }
  }, [showM2]);

  const handleCloseM1 = () => {
    setM1Step(0);
    onCloseM1();
  };

  const handleCloseM2 = () => {
    setM2Step(0);
    onCloseM2();
  };

  return (
    <>
      {/* Secreto 1: Azul Cósmico ("feliz cumpleaños we") */}
      <AnimatePresence>
        {showM1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
            onClick={handleCloseM1}
          >
            {/* Sparkle cosmic background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: `${(i * 15) % 100}vw`, 
                    y: `${(i * 19) % 100}vh`, 
                    scale: 0.2, 
                    opacity: 0.3 
                  }}
                  animate={{ 
                    scale: [0.2, 1.1, 0.2], 
                    opacity: [0.3, 1, 0.3],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2 + (i % 3), 
                    repeat: Infinity, 
                    delay: (i * 0.2) % 2 
                  }}
                  className="absolute text-cyan-300 transform-gpu"
                >
                  <Sparkles className="w-7 h-7 drop-shadow-[0_0_8px_#00f0ff]" />
                </motion.div>
              ))}
            </div>

            {m1Step === 0 ? (
              /* Step 0: Cosmic Blue Birthday Modal */
              <motion.div 
                key="m1-step-0"
                initial={{ scale: 0.4, rotate: -6, y: 40 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.5, damping: 14 }}
                className="relative p-6 sm:p-8 max-w-md w-full rounded-3xl bg-gradient-to-b from-indigo-900 via-blue-800 to-slate-950 border-8 border-cyan-300 shadow-[0_0_80px_rgba(6,182,212,0.8)] text-center my-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* WordArt Cosmic Header */}
                <div className="mb-5">
                  <motion.h1 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [-1, 1, -1]
                    }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-4xl sm:text-5xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-yellow-200 to-cyan-300"
                    style={{
                      fontFamily: '"Impact", "Arial Black", cursive, sans-serif',
                      WebkitTextStroke: '2px #0c4a6e',
                      filter: 'drop-shadow(0 6px 0 #082f49) drop-shadow(0 0 15px #06b6d4)',
                      transform: 'skew(-4deg, -2deg)'
                    }}
                  >
                    ✨ feliz cumpleaños we ✨
                  </motion.h1>
                </div>

                {/* Meme Image 1.jpg Container */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-white p-3 rounded-2xl border-4 border-cyan-400 shadow-2xl mb-6 transform -rotate-1 mx-auto max-w-[280px] sm:max-w-xs"
                >
                  <img 
                    src="/1.jpg" 
                    alt="Secreto 1" 
                    className="w-full h-auto max-h-72 object-contain rounded-xl shadow-inner mx-auto" 
                  />
                </motion.div>

                {/* Button Continuar */}
                <button 
                  onClick={() => {
                    playClickSound();
                    if (!m1AlreadyUnlocked) {
                      setM1Step(1);
                    } else {
                      handleCloseM1();
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-slate-950 font-black text-2xl uppercase tracking-widest rounded-2xl shadow-[0_6px_0_#0e7490] border-2 border-cyan-100 active:shadow-none active:translate-y-1.5 transition-all cursor-pointer font-pixel"
                >
                  Continuar
                </button>

                {/* Subtitle if already unlocked previously */}
                {m1AlreadyUnlocked && (
                  <p className="text-cyan-300 font-mono text-xs sm:text-sm mt-3.5 tracking-wide">
                    Multiplicador x2 global activado
                  </p>
                )}
              </motion.div>
            ) : (
              /* Step 1: Confirmation of Global Multiplier Activated */
              <motion.div 
                key="m1-step-1"
                initial={{ opacity: 0, scale: 0.85, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="max-w-md w-full bg-slate-900 border-2 border-cyan-400 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_70px_rgba(6,182,212,0.6)] my-auto relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg">
                    <Zap className="w-9 h-9 text-yellow-300 animate-pulse" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-pixel font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-yellow-200 to-cyan-300 mb-3">
                  ¡Multiplicador x2 Global Activado!
                </h1>

                <p className="text-slate-300 text-sm sm:text-base mb-6 font-mono leading-relaxed">
                  A partir de ahora, todas tus tiradas generan el <strong className="text-yellow-300">doble de puntos</strong> de forma permanente en todas las combinaciones y dados.
                </p>

                <button 
                  onClick={handleCloseM1}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-pixel text-lg rounded-xl border-2 border-blue-400 border-b-4 border-b-blue-800 shadow-[0_3px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Volver a la Mesa
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secreto 2: La Recompensa Final (Fake.jpg / "ola we") */}
      <AnimatePresence>
        {showM2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-lg overflow-y-auto"
            onClick={handleCloseM2}
          >
            {m2Step === 0 ? (
              /* Step 0: Minimalist View (Only 2.jpg and "ola we") */
              <motion.div 
                key="m2-step-0"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(0,0,0,0.9)] my-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Image 2.jpg */}
                <div className="relative mb-6">
                  <img 
                    src="/2.jpg" 
                    alt="ola we" 
                    className="w-64 h-64 sm:w-72 sm:h-72 object-cover mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl" 
                  />
                </div>

                {/* Deadpan Typography */}
                <h1 className="text-4xl sm:text-5xl font-mono font-bold text-slate-100 tracking-wider mb-8">
                  ola we
                </h1>

                {/* Button to proceed to final stats popup */}
                <button 
                  onClick={() => {
                    playClickSound();
                    setM2Step(1);
                  }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold font-pixel text-xl sm:text-2xl uppercase tracking-widest rounded-2xl border-2 border-purple-400 border-b-4 border-b-purple-800 shadow-[0_5px_0_#581c87] active:translate-y-1 active:border-b-2 active:shadow-none transition-all cursor-pointer"
                >
                  Continuar
                </button>
              </motion.div>
            ) : (
              /* Step 1: Extended Final Statistics Popup ("Ya es todo, fin." / "Ya es toda wei") */
              <motion.div 
                key="m2-step-1"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-slate-900 border-2 border-purple-500/80 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_70px_rgba(168,85,247,0.5)] my-auto relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center shadow-lg">
                    <Trophy className="w-9 h-9 text-yellow-300 animate-bounce" />
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-pixel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-2">
                  Ya es todo, fin.
                </h1>
                
                {/* Subtitle text as requested: "Ya es toda wei" */}
                <p className="text-slate-400 text-base sm:text-lg mb-5 font-mono">
                  Ya es toda wei
                </p>

                {/* Comprehensive Career Statistics */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-left text-xs sm:text-sm space-y-3 mb-6 font-mono text-slate-300">
                  <div className="flex justify-between items-center text-amber-400 font-bold pb-2 border-b border-slate-800 text-sm">
                    <span className="flex items-center gap-1.5 font-pixel">
                      <Award className="w-4 h-4 text-yellow-400" /> Registro de Carrera Completa
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Puntos Totales Acumulados:</span>
                    <span className="font-bold text-yellow-400 font-pixel text-base sm:text-lg">
                      {formatNumber(totalPoints)} pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tiradas Totales Realizadas:</span>
                    <span className="font-bold text-slate-200 text-sm sm:text-base">
                      {totalRolls.toLocaleString()} tiros
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Racha Más Alta de Combos:</span>
                    <span className="font-bold text-orange-400 text-sm sm:text-base flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {highestStreak} combos
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                    <span className="text-slate-400">Multiplicador Global:</span>
                    <span className="font-bold text-cyan-300 font-pixel text-sm flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-300" /> x2 Permanente
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estado de Finalización:</span>
                    <span className="font-bold text-emerald-400 font-pixel text-sm">
                      100% COMPLETADO
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleCloseM2}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold font-pixel text-lg rounded-xl border-2 border-slate-700 border-b-4 border-b-slate-950 shadow-[0_3px_0_#0f172a] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Volver a la Mesa
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
