import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UPGRADES,
  UpgradeId,
  getCost,
  UpgradeDef,
  UpgradeCategory,
  getDiceSides,
  getMaterialTierName,
  getMaterialMult,
  getManualCooldown,
  getAutoRollsPerSec,
  getAnimationSpeedMult,
  getFlatBonus,
  getComboMult
} from '../game/engine';
import { GameState } from '../hooks/useGameState';
import {
  Dices,
  Zap,
  Sparkles,
  Flame,
  Gift,
  Lock,
  CheckCircle2,
  Play,
  Pause,
  Eye,
  Wand2
} from 'lucide-react';
import { playBuySound, playTabNote, playKonamiSuccessSound } from '../utils/audio';
import { formatNumber } from '../utils/format';
import confetti from 'canvas-confetti';

interface ShopProps {
  state: GameState;
  onBuy: (id: UpgradeId) => void;
  onBuyM1: () => void;
  onBuyM2: () => void;
  onToggleAutoRoll: () => void;
  onUnlockCheats: () => void;
  isAutoRollPaused: boolean;
}

interface CategoryConfig {
  id: UpgradeCategory | 'milestones';
  name: string;
  note: 'Sol' | 'La' | 'Si' | 'Do' | 'Re';
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  inactiveClass: string;
  cardAffordableClass: string;
  badgeClass: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'dice',
    name: 'Dados',
    note: 'Sol',
    icon: Dices,
    activeClass: 'bg-blue-600 border-blue-300 border-b-4 border-b-blue-900 text-white shadow-[0_3px_0_#1e3a8a]',
    inactiveClass: 'bg-blue-950/60 hover:bg-blue-900/60 border-blue-600/70 border-b-4 border-b-blue-950 text-blue-200 shadow-[0_3px_0_#172554]',
    cardAffordableClass: 'bg-blue-950/60 hover:bg-blue-900/60 border-blue-400/80 border-b-4 border-b-blue-600 shadow-[0_4px_0_#1e40af] text-white',
    badgeClass: 'bg-blue-900/80 text-blue-200 border-blue-500/50'
  },
  {
    id: 'automation',
    name: 'Auto',
    note: 'La',
    icon: Zap,
    activeClass: 'bg-amber-600 border-amber-300 border-b-4 border-b-amber-900 text-white shadow-[0_3px_0_#78350f]',
    inactiveClass: 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-600/70 border-b-4 border-b-amber-950 text-amber-200 shadow-[0_3px_0_#451a03]',
    cardAffordableClass: 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-400/80 border-b-4 border-b-amber-600 shadow-[0_4px_0_#78350f] text-white',
    badgeClass: 'bg-amber-900/80 text-amber-200 border-amber-500/50'
  },
  {
    id: 'probability',
    name: 'Trucos',
    note: 'Si',
    icon: Sparkles,
    activeClass: 'bg-purple-600 border-purple-300 border-b-4 border-b-purple-950 text-white shadow-[0_3px_0_#4c1d95]',
    inactiveClass: 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-600/70 border-b-4 border-b-purple-950 text-purple-200 shadow-[0_3px_0_#2e1065]',
    cardAffordableClass: 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-400/80 border-b-4 border-b-purple-600 shadow-[0_4px_0_#581c87] text-white',
    badgeClass: 'bg-purple-900/80 text-purple-200 border-purple-500/50'
  },
  {
    id: 'combos',
    name: 'Combos',
    note: 'Do',
    icon: Flame,
    activeClass: 'bg-orange-600 border-orange-300 border-b-4 border-b-orange-950 text-white shadow-[0_3px_0_#7c2d12]',
    inactiveClass: 'bg-orange-950/60 hover:bg-orange-900/60 border-orange-600/70 border-b-4 border-b-orange-950 text-orange-200 shadow-[0_3px_0_#431407]',
    cardAffordableClass: 'bg-orange-950/60 hover:bg-orange-900/60 border-orange-400/80 border-b-4 border-b-orange-600 shadow-[0_4px_0_#9a3412] text-white',
    badgeClass: 'bg-orange-900/80 text-orange-200 border-orange-500/50'
  },
  {
    id: 'milestones',
    name: 'Secretos',
    note: 'Re',
    icon: Gift,
    activeClass: 'superstar-tab-active text-slate-950 font-black',
    inactiveClass: 'superstar-tab-inactive text-pink-200 font-bold',
    cardAffordableClass: '',
    badgeClass: ''
  },
];

// Himno de la Alegría Musical Sequence (30 notes)
const ODE_TO_JOY_SEQUENCE: (UpgradeCategory | 'milestones')[] = [
  'probability', 'probability', 'combos', 'milestones', 'milestones', 'combos', 'probability', 'automation', 'dice', 'dice', 'automation', 'probability', 'probability', 'automation', 'automation',
  'probability', 'probability', 'combos', 'milestones', 'milestones', 'combos', 'probability', 'automation', 'dice', 'dice', 'automation', 'probability', 'automation', 'dice', 'dice'
];

export const Shop: React.FC<ShopProps> = ({
  state,
  onBuy,
  onBuyM1,
  onBuyM2,
  onToggleAutoRoll,
  onUnlockCheats,
  isAutoRollPaused
}) => {
  const [activeTab, setActiveTab] = useState<UpgradeCategory | 'milestones'>('dice');
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const seqIndexRef = useRef(0);

  const m1Cost = 150000;
  const m2Cost = 1000000000; // 1B for Secret 2

  const totalUpgradesBought = Object.values(state.upgrades).reduce((sum, lvl) => sum + lvl, 0);
  const isM1Locked = totalUpgradesBought < 15 && !state.milestone1Unlocked;
  const isM2Locked = totalUpgradesBought < 50 && !state.milestone2Unlocked;

  // Handle Tab Click & Musical Note Sequence Detection (Repeatable anytime)
  const handleTabClick = (cat: CategoryConfig) => {
    playTabNote(cat.note);
    setActiveTab(cat.id);

    const expectedTab = ODE_TO_JOY_SEQUENCE[seqIndexRef.current];
    if (cat.id === expectedTab) {
      seqIndexRef.current++;
      if (seqIndexRef.current >= ODE_TO_JOY_SEQUENCE.length) {
        // Konami Code Complete!
        onUnlockCheats();
        playKonamiSuccessSound();
        setShowUnlockToast(true);
        setTimeout(() => setShowUnlockToast(false), 4500);

        confetti({
          particleCount: 60,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#a855f7', '#facc15', '#06b6d4', '#ec4899', '#ffffff'],
          zIndex: 9999
        });
        seqIndexRef.current = 0;
      }
    } else {
      if (cat.id === ODE_TO_JOY_SEQUENCE[0]) {
        seqIndexRef.current = 1;
      } else {
        seqIndexRef.current = 0;
      }
    }
  };

  // Notification count per category
  const getTabAffordableCount = (catId: UpgradeCategory | 'milestones'): number => {
    if (catId === 'milestones') {
      let count = 0;
      if (!isM1Locked && !state.milestone1Unlocked && state.points >= m1Cost) count++;
      if (!isM2Locked && !state.milestone2Unlocked && state.points >= m2Cost) count++;
      return count;
    }
    return Object.values(UPGRADES).filter(u => {
      if (u.category !== catId) return false;
      const currentLevel = state.upgrades[u.id] || 0;
      return currentLevel < u.maxLevel && state.points >= getCost(u.id, currentLevel);
    }).length;
  };

  const currentTabConfig = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  const getUpgradeStateSummary = (def: UpgradeDef, level: number, isMax: boolean): string => {
    switch (def.id) {
      case 'extra_dice':
        return `Dados activos: ${level + 1} dados${!isMax ? ` → ${level + 2} dados` : ''}`;
      case 'dice_sides':
        return `Poliedro: D${getDiceSides(level)}${!isMax ? ` → D${getDiceSides(level + 1)}` : ''}`;
      case 'material_tier':
        return `Material: ${getMaterialTierName(level)} (x${getMaterialMult(level)})${!isMax ? ` → ${getMaterialTierName(level + 1)} (x${getMaterialMult(level + 1)})` : ''}`;
      case 'manual_cooldown':
        return `Tiempo de recarga: ${getManualCooldown(level).toFixed(2)}s${!isMax ? ` → ${getManualCooldown(level + 1).toFixed(2)}s` : ''}`;
      case 'auto_roller':
        return `Tiradas automáticas: ${level === 0 ? '0/s (Desactivado)' : `${getAutoRollsPerSec(level).toFixed(1)} tiros/s`}${!isMax ? ` → ${getAutoRollsPerSec(level + 1).toFixed(1)} tiros/s` : ''}`;
      case 'cushioned_surface':
        return `Velocidad física de animación: ${getAnimationSpeedMult(level).toFixed(1)}x${!isMax ? ` → ${getAnimationSpeedMult(level + 1).toFixed(1)}x` : ''}`;
      case 'hold_to_roll':
        return level > 0 ? 'Tiro continuo activado (mantén presionado)' : 'Habilita disparar manteniendo presionado';
      case 'flat_bonus':
        return `Puntos base por dado: +${getFlatBonus(level)} pts${!isMax ? ` → +${getFlatBonus(level + 1)} pts` : ''}`;
      case 'worst_case_elim':
        return `Probabilidad de convertir 1s en máximo: ${level * 5}%${!isMax ? ` → ${(level + 1) * 5}%` : ''}`;
      case 'table_magnetism':
        return `Probabilidad de dados repetidos / pares: ${level * 8}%${!isMax ? ` → ${(level + 1) * 8}%` : ''}`;
      case 'ghost_dice': {
        const prob = level === 0 ? 0 : Math.round((0.02 + (level - 1) * 0.07) * 100);
        const nextProb = Math.round((0.02 + level * 0.07) * 100);
        return `Probabilidad de dado fantasma: ${prob}%${!isMax ? ` → ${nextProb}%` : ''}`;
      }
      case 'combo_mult':
        return `Multiplicador de combos: x${getComboMult(level).toFixed(1)}${!isMax ? ` → x${getComboMult(level + 1).toFixed(1)}` : ''}`;
      default:
        return '';
    }
  };

  const renderUpgradeCard = (def: UpgradeDef) => {
    const currentLevel = state.upgrades[def.id] || 0;
    const isMax = currentLevel >= def.maxLevel;
    const cost = getCost(def.id, currentLevel);
    const canAfford = state.points >= cost;
    const summary = getUpgradeStateSummary(def, currentLevel, isMax);

    return (
      <button
        key={def.id}
        onClick={() => {
          if (!isMax && canAfford) {
            playBuySound();
            onBuy(def.id);
          }
        }}
        disabled={isMax || !canAfford}
        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col mb-3 select-none box-border ${isMax
          ? 'bg-slate-800/40 border-slate-700/50 border-b-4 border-b-slate-700/60 opacity-70 cursor-default'
          : canAfford
            ? `${currentTabConfig.cardAffordableClass} active:translate-y-0.5 active:border-b-2 active:shadow-none cursor-pointer`
            : 'bg-slate-850 border-slate-700/80 border-b-4 border-b-slate-600 shadow-[0_3px_0_#334155] opacity-85 cursor-not-allowed'
          }`}
      >
        <div className="flex justify-between items-start w-full gap-2">
          <div className="flex-1">
            <h3 className={`font-bold flex items-center gap-1.5 text-sm sm:text-base ${canAfford ? 'text-white' : 'text-slate-200'}`}>
              {def.name}
              {isMax && (
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> MAX
                </span>
              )}
            </h3>

            <p className={`text-xs sm:text-sm mt-1 leading-snug ${canAfford ? 'text-slate-200' : 'text-slate-400'}`}>
              {def.desc}
            </p>

            {/* Dynamic Real-time Stat summary */}
            {summary && (
              <div className={`text-[11px] sm:text-xs font-mono font-bold mt-1.5 flex items-center gap-1 ${canAfford ? 'text-yellow-300' : 'text-slate-300'
                }`}>
                <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{summary}</span>
              </div>
            )}
          </div>

          <div className="text-right flex flex-col items-end shrink-0 pl-1">
            {!isMax ? (
              <span className={`font-pixel text-base sm:text-lg font-bold ${canAfford ? 'text-yellow-300 drop-shadow-sm' : 'text-slate-400'}`}>
                {formatNumber(cost)} pts
              </span>
            ) : (
              <span className="font-pixel text-emerald-400 text-base font-bold">COMPLETADO</span>
            )}
            <span className={`text-[10px] sm:text-xs font-mono font-medium px-2 py-0.5 rounded-md mt-1 border ${canAfford ? currentTabConfig.badgeClass : 'bg-slate-950 text-slate-400 border-slate-750'}`}>
              Lvl {currentLevel} / {def.maxLevel}
            </span>
          </div>
        </div>
      </button>
    );
  };

  const filteredUpgrades = Object.values(UPGRADES).filter(u => u.category === activeTab);

  return (
    <div className="w-full bg-slate-900 flex flex-col h-full overflow-hidden relative">
      {/* Toast Notification when Konami Code Unlocked */}
      <AnimatePresence>
        {showUnlockToast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-16 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white p-3 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-3 font-pixel text-xs sm:text-sm"
          >
            <div className="p-2 bg-yellow-400 text-purple-950 rounded-xl shrink-0">
              <Wand2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-yellow-300 text-sm">Trucos activados. Visita el menú de opciones</div>
              <div className="text-slate-100 font-mono text-[11px] mt-0.5">Nuevos trucos y Modo Fiesta disponibles 🧪🎉</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs Header with Musical Note Sounds and Sequence Detector */}
      <div className="p-2.5 sm:p-3 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            const affordableCount = getTabAffordableCount(cat.id);
            const isSuperstar = cat.id === 'milestones';

            return (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat)}
                className={`relative py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2 font-bold text-xs sm:text-sm cursor-pointer select-none ${isActive
                  ? `${cat.activeClass} translate-y-0.5`
                  : `${cat.inactiveClass} active:translate-y-1 active:shadow-none`
                  }`}
              >
                <div className={`flex items-center justify-center ${isSuperstar ? 'superstar-content-anim' : ''}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSuperstar && isActive ? 'text-slate-950 drop-shadow-none' : ''}`} />
                </div>
                <span className={`truncate text-[11px] sm:text-xs ${isSuperstar ? 'superstar-content-anim tracking-wider' : ''}`}>{cat.name}</span>

                {/* Prominent Large Notification Badge */}
                {affordableCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-rose-500 text-white text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-xl animate-bounce z-10">
                    {affordableCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Auto-roll toggle sub-bar if auto_roller unlocked */}
        {state.upgrades.auto_roller > 0 && activeTab === 'automation' && (
          <div className="mt-2.5 flex justify-between items-center bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Estado de Lanzador Automático
            </span>
            <button
              onClick={() => {
                playBuySound();
                onToggleAutoRoll();
              }}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer ${isAutoRollPaused
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 border-b-amber-800 shadow-[0_2px_0_#78350f] text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 border-b-emerald-800 shadow-[0_2px_0_#065f46] text-white'
                }`}
            >
              {isAutoRollPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isAutoRollPaused ? 'Pausado' : 'Activo'}
            </button>
          </div>
        )}
      </div>

      {/* Upgrades Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-32">
        {activeTab !== 'milestones' ? (
          <div className="space-y-1">
            {filteredUpgrades.map(renderUpgradeCard)}
          </div>
        ) : (
          /* Secretos Tab */
          <div className="space-y-3 sm:space-y-4">
            {/* Secreto 1 (Real.jpg) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all box-border ${isM1Locked
                ? 'bg-slate-850/90 border-slate-700/80 border-b-4 border-b-slate-600 shadow-[0_3px_0_#334155] opacity-80'
                : state.milestone1Unlocked
                  ? 'bg-blue-950/40 border-cyan-500/50 border-b-4 border-b-blue-900 shadow-[0_3px_0_#1e3a8a]'
                  : state.points >= m1Cost
                    ? 'bg-blue-900/60 hover:bg-blue-900/70 border-cyan-400 border-b-4 border-b-blue-700 shadow-[0_4px_0_#1d4ed8]'
                    : 'bg-blue-950/20 border-cyan-500/30 border-b-4 border-b-blue-950 opacity-75 shadow-[0_3px_0_#172554]'
                }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isM1Locked ? 'text-slate-400' : 'text-cyan-300'
                    }`}>
                    {isM1Locked ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Zap className="w-4 h-4 text-yellow-300" />
                    )}
                    Imagen?
                    {state.milestone1Unlocked && (
                      <span className="text-xs font-bold text-cyan-200 bg-blue-900/70 border border-cyan-500/60 px-2 py-0.5 rounded-full">
                        MAX
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 leading-snug ${isM1Locked ? 'text-slate-400' : 'text-slate-200'
                    }`}>
                    {isM1Locked ? 'Una sorpresa misteriosa.' : 'Una sorpresa misteriosa. Multiplica por 2 todas las tiradas de forma permanente.'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {isM1Locked ? (
                    <span className="font-pixel text-sm sm:text-base text-slate-400 font-bold">
                      Faltan {15 - totalUpgradesBought} mejoras
                    </span>
                  ) : !state.milestone1Unlocked ? (
                    <span className={`font-pixel text-base sm:text-xl font-bold ${state.points >= m1Cost ? 'text-cyan-300' : 'text-slate-400'
                      }`}>
                      {formatNumber(m1Cost)} pts
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons if not locked */}
              {!isM1Locked && (
                <div className="mt-3 sm:mt-4 flex gap-2">
                  {!state.milestone1Unlocked ? (
                    <button
                      onClick={onBuyM1}
                      disabled={state.points < m1Cost}
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-bold font-pixel text-base sm:text-lg flex items-center justify-center gap-2 border-2 border-b-4 transition-all ${state.points >= m1Cost
                        ? 'bg-blue-600 hover:bg-blue-500 border-cyan-300 border-b-blue-900 shadow-[0_3px_0_#1e3a8a] text-white cursor-pointer active:translate-y-0.5 active:shadow-none'
                        : 'bg-slate-800 text-slate-500 border-slate-700 border-b-slate-900 cursor-not-allowed'
                        }`}
                    >
                      <Sparkles className="w-4 h-4" /> Desbloquear
                    </button>
                  ) : (
                    <button
                      onClick={onBuyM1}
                      className="w-full py-2 sm:py-2.5 rounded-xl font-bold font-pixel text-sm sm:text-base bg-blue-900/40 hover:bg-blue-900/60 text-cyan-300 border-2 border-cyan-600/50 border-b-4 border-b-blue-950 shadow-[0_2px_0_#172554] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                    >
                      <Eye className="w-4 h-4" /> Ver de Nuevo
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Secreto 2 (Fake.jpg - 1B Cost) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all box-border ${isM2Locked
                ? 'bg-slate-850/90 border-slate-700/80 border-b-4 border-b-slate-600 shadow-[0_3px_0_#334155] opacity-80'
                : state.milestone2Unlocked
                  ? 'bg-purple-950/30 border-purple-500/40 border-b-4 border-b-purple-800 shadow-[0_3px_0_#3b0764]'
                  : state.points >= m2Cost
                    ? 'bg-purple-900/50 hover:bg-purple-900/60 border-purple-400 border-b-4 border-b-purple-600 shadow-[0_4px_0_#6b21a8]'
                    : 'bg-purple-950/20 border-purple-500/30 border-b-4 border-b-purple-900/40 opacity-75 shadow-[0_3px_0_#3b0764]'
                }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isM2Locked ? 'text-slate-400' : 'text-purple-400'
                    }`}>
                    <Lock className={`w-4 h-4 ${isM2Locked ? 'text-slate-500' : 'text-purple-300'}`} />
                    ???
                    {state.milestone2Unlocked && (
                      <span className="text-xs font-bold text-purple-300 bg-purple-900/60 border border-purple-600/60 px-2 py-0.5 rounded-full">
                        MAX
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 leading-snug ${isM2Locked ? 'text-slate-400' : 'text-slate-200'
                    }`}>
                    {isM2Locked ? 'Aún no estás listo.' : 'Termina el juego y desbloquea el registro de carrera.'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {isM2Locked ? (
                    <span className="font-pixel text-sm sm:text-base text-slate-400 font-bold">
                      Faltan {50 - totalUpgradesBought} mejoras
                    </span>
                  ) : !state.milestone2Unlocked ? (
                    <span className={`font-pixel text-base sm:text-xl font-bold ${state.points >= m2Cost ? 'text-purple-300' : 'text-slate-400'
                      }`}>
                      {formatNumber(m2Cost)} pts
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons if not locked */}
              {!isM2Locked && (
                <div className="mt-3 sm:mt-4 flex gap-2">
                  {!state.milestone2Unlocked ? (
                    <button
                      onClick={onBuyM2}
                      disabled={state.points < m2Cost}
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-bold font-pixel text-base sm:text-lg flex items-center justify-center gap-2 border-2 border-b-4 transition-all ${state.points >= m2Cost
                        ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 border-b-purple-800 shadow-[0_3px_0_#581c87] text-white cursor-pointer active:translate-y-0.5 active:shadow-none'
                        : 'bg-slate-800 text-slate-500 border-slate-700 border-b-slate-900 cursor-not-allowed'
                        }`}
                    >
                      <Lock className="w-4 h-4" /> Desbloquear
                    </button>
                  ) : (
                    <button
                      onClick={onBuyM2}
                      className="w-full py-2 sm:py-2.5 rounded-xl font-bold font-pixel text-sm sm:text-base bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border-2 border-purple-600/50 border-b-4 border-b-purple-900 shadow-[0_2px_0_#3b0764] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                    >
                      <Eye className="w-4 h-4" /> Ver de Nuevo
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
