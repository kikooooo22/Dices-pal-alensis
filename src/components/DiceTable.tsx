import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { formatNumber } from '../utils/format';
import { playComboSound } from '../utils/audio';
import { ComboResult, getDiceComboColorMap } from '../game/engine';
import { Flame, Sparkles } from 'lucide-react';
import { VectorTrue3DDie, VectorSpinningDiePreview } from './Polyhedron3D';

export { VectorSpinningDiePreview as SpinningDiePreview } from './Polyhedron3D';

interface DiceTableProps {
  faces: number[];
  ghosts?: number[];
  sides: number;
  materialLevel: number;
  manualCooldown: number;
  animationSpeedMult?: number;
  onRoll: () => void;
  cooldownActive: boolean;
  totalEarned: number | null;
  combos: ComboResult[];
  comboStreak?: number;
  streakBonus?: number;
  showFloatingTexts?: boolean;
  enableConfetti?: boolean;
}

const getComboColor = (tier: string) => {
  switch (tier) {
    case 'cosmic':
      return 'text-fuchsia-300 drop-shadow-[0_0_18px_#e879f9]';
    case 'legendary':
      return 'text-yellow-300 drop-shadow-[0_0_15px_#facc15]';
    case 'epic':
      return 'text-purple-400 drop-shadow-[0_0_12px_#c084fc]';
    case 'rare':
      return 'text-cyan-300 drop-shadow-[0_0_10px_#38bdf8]';
    default:
      return 'text-amber-300 drop-shadow-[0_0_6px_#fbbf24]';
  }
};

interface Particle {
  id: string;
  type: 'points' | 'combo' | 'streak';
  text: string;
  x: number;
  y: number;
  rot: number;
  colorClass: string;
}

export const DiceTable: React.FC<DiceTableProps> = ({
  faces,
  ghosts = [],
  sides,
  materialLevel,
  manualCooldown,
  animationSpeedMult = 1,
  onRoll,
  cooldownActive,
  totalEarned,
  combos = [],
  comboStreak = 0,
  streakBonus = 1,
  showFloatingTexts = true,
  enableConfetti = true,
}) => {
  const [rollId, setRollId] = useState(0);
  const prevFaces = useRef(faces);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastConfettiTimeRef = useRef(0);
  const lastParticleTimeRef = useRef(0);

  const normalDiceCount = faces.length;
  // Dynamic responsive die size for up to 10 regular dice
  const dieSize = normalDiceCount >= 9 ? 42 : normalDiceCount >= 7 ? 48 : normalDiceCount >= 5 ? 54 : normalDiceCount >= 3 ? 64 : 76;
  const gapSize = normalDiceCount >= 8 ? 'gap-1.5 sm:gap-2.5' : normalDiceCount >= 5 ? 'gap-2 sm:gap-3.5' : 'gap-3 sm:gap-6';

  // Map each individual die to its matching cluster's unique color
  const comboColorMap = useMemo(() => {
    return getDiceComboColorMap(faces, sides);
  }, [faces, sides]);

  useEffect(() => {
    if (faces !== prevFaces.current && faces.length > 0) {
      const newRollId = rollId + 1;
      setRollId(newRollId);
      prevFaces.current = faces;

      if (totalEarned && totalEarned > 0) {
        const now = Date.now();

        // Audio & Confetti triggers
        if (combos && combos.length > 0) {
          let maxMult = 1;
          combos.forEach(c => {
            if (c.mult > maxMult) maxMult = c.mult;
          });

          playComboSound(maxMult);

          if (enableConfetti && maxMult >= 7.5 && now - lastConfettiTimeRef.current > 1500) {
            lastConfettiTimeRef.current = now;
            confetti({
              particleCount: maxMult >= 20 ? 25 : 15,
              spread: 60,
              ticks: 40,
              gravity: 2,
              startVelocity: 16,
              origin: { y: 0.65 },
              colors: ['#facc15', '#ec4899', '#38bdf8', '#a855f7', '#10b981'],
              zIndex: 30
            });
          }
        }

        // Lightweight Floating Notification Particles (only if enabled by user)
        if (showFloatingTexts) {
          const canSpawnParticles = now - lastParticleTimeRef.current > 80;

          if (canSpawnParticles) {
            lastParticleTimeRef.current = now;
            const newParticles: Particle[] = [];

            // Points pop (Always in the LOWER/CENTER vertical zone)
            newParticles.push({
              id: `p-${newRollId}`,
              type: 'points',
              text: `+${formatNumber(totalEarned)}`,
              x: (Math.random() - 0.5) * 40,
              y: 20 + (Math.random() - 0.5) * 8, // Lower area below combo
              rot: (Math.random() - 0.5) * 8,
              colorClass: 'text-yellow-300 drop-shadow-[0_4px_6px_rgba(0,0,0,1)]',
            });

            // Combo pop (Always in the UPPER vertical zone)
            if (combos && combos.length > 0) {
              let maxMult = 1;
              let bestCombo = combos[0];
              combos.forEach(c => {
                if (c.mult > maxMult) {
                  maxMult = c.mult;
                  bestCombo = c;
                }
              });

              newParticles.push({
                id: `c-${newRollId}`,
                type: 'combo',
                text: `${bestCombo.name} (x${bestCombo.mult})`,
                x: (Math.random() - 0.5) * 40,
                y: -65 + (Math.random() - 0.5) * 8, // Upper area above points
                rot: (Math.random() - 0.5) * 8,
                colorClass: getComboColor(bestCombo.tier),
              });
            }

            // Streak pop if streak active (Base zone)
            if (comboStreak > 1 && Math.random() < 0.6) {
              newParticles.push({
                id: `s-${newRollId}`,
                type: 'streak',
                text: `🔥 Racha x${comboStreak} (+${((streakBonus - 1) * 100).toFixed(0)}%)`,
                x: (Math.random() - 0.5) * 40,
                y: 75 + (Math.random() - 0.5) * 8,
                rot: (Math.random() - 0.5) * 8,
                colorClass: 'text-orange-400 drop-shadow-[0_0_12px_#fb923c]',
              });
            }

            // Keep strictly at most 3 particles on screen at once
            setParticles(prev => [...prev.slice(-1), ...newParticles].slice(-3));
            setTimeout(() => {
              setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
            }, 700);
          }
        }
      }
    }
  }, [faces, totalEarned, combos, comboStreak, streakBonus, rollId, showFloatingTexts, enableConfetti]);

  return (
    <div 
      className="relative w-full flex-1 min-h-0 bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 rounded-2xl sm:rounded-3xl shadow-[inset_0_10px_30px_rgba(0,0,0,0.6),0_6px_20px_rgba(0,0,0,0.5)] border-[6px] sm:border-[12px] border-amber-950 overflow-hidden cursor-pointer flex flex-col items-center justify-center select-none"
      onClick={() => {
        if (!cooldownActive) onRoll();
      }}
    >
      {/* Table felt textures / casino watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-black/40" />

      {/* Streak Badge on Table */}
      {comboStreak > 1 && (
        <div 
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-orange-950/80 border border-orange-500 text-orange-400 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-20"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
          <span className="font-pixel text-xs sm:text-base font-bold">
            Racha x{comboStreak}
          </span>
        </div>
      )}

      {/* Lightweight Floating Notification Particles (Max 3, if enabled - Instant 100% Solid Opacity) */}
      {showFloatingTexts && (
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: p.x, y: p.y, scale: 1.15, rotate: p.rot }}
              animate={{ opacity: 1, x: p.x, y: p.y - 25, scale: 1.0, rotate: p.rot }}
              exit={{ opacity: 0, y: p.y - 50, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`absolute font-pixel font-black ${
                p.type === 'combo' ? 'text-base sm:text-2xl z-30' : 'text-lg sm:text-3xl z-20'
              } ${p.colorClass} pointer-events-none whitespace-nowrap transform-gpu will-change-transform`}
              style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Main Dice Pool Container (Up to 10 regular dice in responsive layout) */}
      <div 
        className={`flex flex-wrap justify-center items-center ${gapSize} p-1.5 sm:p-4 w-full max-w-sm sm:max-w-md z-10`} 
      >
        {faces.length === 0 && (
          <div className="text-emerald-950/70 font-pixel text-lg sm:text-2xl text-center font-bold drop-shadow-sm select-none px-4">
            Toca la mesa o pulsa el botón para lanzar
          </div>
        )}

        {faces.map((f, i) => {
          const comboColor = comboColorMap[i];
          return (
            <VectorTrue3DDie
              key={`die-r-${i}`}
              finalFace={f}
              sides={sides}
              materialLevel={materialLevel}
              rollId={rollId}
              manualCooldown={manualCooldown}
              animationSpeedMult={animationSpeedMult}
              size={dieSize}
              isGhost={false}
              comboColor={comboColor}
            />
          );
        })}
      </div>

      {/* Dedicated Separate Ghost Die Section (Centered lower down without text badge) */}
      {ghosts.length > 0 && (
        <div className="flex items-center justify-center z-10 mt-1 sm:mt-2 gap-2">
          {ghosts.map((g, i) => (
            <VectorTrue3DDie
              key={`die-g-${i}`}
              finalFace={g}
              sides={sides}
              materialLevel={materialLevel}
              rollId={rollId}
              manualCooldown={manualCooldown}
              animationSpeedMult={animationSpeedMult}
              size={dieSize >= 60 ? 52 : dieSize}
              isGhost={true}
              comboColor="#38bdf8"
            />
          ))}
        </div>
      )}
    </div>
  );
};
