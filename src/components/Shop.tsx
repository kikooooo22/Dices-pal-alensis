import React, { useState, useRef, useEffect } from 'react';
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
  Wand2,
  HelpCircle
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
  tutorialStep?: number;
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
  isAutoRollPaused,
  tutorialStep = 0
}) => {
  const [activeTab, setActiveTab] = useState<UpgradeCategory | 'milestones'>('dice');
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const seqIndexRef = useRef(0);

  // If in tutorial step 4, focus on automation tab for Dedos Rápidos
  useEffect(() => {
    if (tutorialStep === 4) {
      setActiveTab('automation');
    }
  }, [tutorialStep]);

  const m1Cost = 150000;
  const m2Cost = 1000000000; // 1B for Secret 2

  const totalUpgradesBought = Object.values(state.upgrades).reduce((sum, lvl) => sum + lvl, 0);
  const isM1Locked = totalUpgradesBought < 15 && !state.milestone1Unlocked;
  const isM2Locked = totalUpgradesBought < 50 && !state.milestone2Unlocked;

  // Handle Tab Click & Musical Note Sequence Detection (Repeatable anytime)
  const handleTabClick = (cat: CategoryConfig) => {
    if (tutorialStep > 0) return; // Tab switching blocked during tutorial
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
      seqIndexRef.current = cat.id === ODE_TO_JOY_SEQUENCE[0] ? 1 : 0;
    }
  };

  const currentTabConfig = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  // Real-time state indicator for each upgrade card
  const getUpgradeStateSummary = (def: UpgradeDef, level: number, isMax: boolean) => {
    switch (def.id) {
      case 'extra_dice':
        return `Dados activos: ${level + 1} dados${!isMax ? ` → ${level + 2} dados` : ''}`;
      case 'dice_sides':
        return `Caras del dado: D${getDiceSides(level)}${!isMax ? ` → D${getDiceSides(level + 1)}` : ''}`;
      case 'material_tier':
        return `Material: ${getMaterialTierName(level)} (x${getMaterialMult(level)})${!isMax ? ` → ${getMaterialTierName(level + 1)} (x${getMaterialMult(level + 1)})` : ''}`;
      case 'manual_cooldown':
        return `Recarga: ${getManualCooldown(level).toFixed(3)}s (${(1 / getManualCooldown(level)).toFixed(1)}/s)${!isMax ? ` → ${getManualCooldown(level + 1).toFixed(3)}s (${(1 / getManualCooldown(level + 1)).toFixed(1)}/s)` : ''}`;
      case 'auto_roller':
        return level > 0
          ? `Tiros automáticos: ${getAutoRollsPerSec(level).toFixed(1)} tiros/s${!isMax ? ` → ${getAutoRollsPerSec(level + 1).toFixed(1)} tiros/s` : ''}`
          : 'Inactivo → Desbloquear 0.3 tiros/s';
      case 'cushioned_surface':
        return `Velocidad animación: x${getAnimationSpeedMult(level).toFixed(1)}${!isMax ? ` → x${getAnimationSpeedMult(level + 1).toFixed(1)}` : ''}`;
      case 'hold_to_roll':
        return level > 0 ? 'Tiro continuo activado (mantén presionado)' : 'Habilita disparar manteniendo presionado';
      case 'flat_bonus':
        return `Puntos base por dado: +${getFlatBonus(level)} pts${!isMax ? ` → +${getFlatBonus(level + 1)} pts` : ''}`;
      case 'less_is_more':
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
    const isTutorialTarget = tutorialStep === 4 && def.id === 'manual_cooldown';
    const isLockedByTutorial = tutorialStep > 0 && def.id !== 'manual_cooldown';

    return (
      <button
        key={def.id}
        onClick={() => {
          if (!isMax && canAfford && !isLockedByTutorial) {
            playBuySound();
            onBuy(def.id);
          }
        }}
        disabled={isMax || !canAfford || isLockedByTutorial}
        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col mb-3 select-none box-border ${
          isTutorialTarget ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''
        } ${isLockedByTutorial ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800' : isMax
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
              <div className="font-bold text-yellow-300 uppercase tracking-wider text-sm sm:text-base">
                ¡Código Musical Descubierto!
              </div>
              <div className="text-white text-xs">
                Trucos activados. Visita el menú de opciones.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Musical Category Tabs Strip */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-2 pt-2 gap-1.5 shrink-0 overflow-x-auto select-none no-scrollbar">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          const count = cat.id === 'milestones'
            ? (!isM1Locked && state.points >= m1Cost ? 1 : 0) + (!isM2Locked && state.points >= m2Cost ? 1 : 0)
            : Object.values(UPGRADES)
              .filter(u => u.category === cat.id)
              .filter(u => {
                const lvl = state.upgrades[u.id] || 0;
                return lvl < u.maxLevel && state.points >= getCost(u.id, lvl);
              }).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat)}
              className={`flex-1 min-w-[58px] py-2 px-1 rounded-t-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all relative border-2 border-b-0 cursor-pointer ${isActive ? cat.activeClass : cat.inactiveClass
                }`}
            >
              <div className="flex items-center gap-1">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${cat.id === 'milestones' ? 'text-pink-300 animate-bounce' : ''}`} />
                <span className="truncate">{cat.name}</span>
              </div>

              {count > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full border border-slate-950 shadow-md">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Upgrades List Container with Smooth Momentum Scroll */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain">
        {activeTab !== 'milestones' ? (
          <div>
            {filteredUpgrades.map(renderUpgradeCard)}
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Secret Card 1 */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col ${isM1Locked
              ? 'bg-slate-950/80 border-slate-800 text-slate-400 opacity-70'
              : state.points >= m1Cost
                ? 'bg-gradient-to-br from-purple-950/80 to-pink-950/80 border-pink-400 border-b-4 border-b-pink-600 shadow-[0_4px_0_#831843] text-white'
                : 'bg-slate-900 border-purple-900/60 border-b-4 border-b-slate-950 text-slate-400'
              }`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Gift className={`w-5 h-5 ${isM1Locked ? 'text-slate-500' : 'text-pink-400'}`} />
                    <h3 className="font-bold text-sm sm:text-base text-pink-200">
                      {isM1Locked ? '(Bloqueado)' : '28 de Agosto'}
                    </h3>
                  </div>
                  {isM1Locked ? (
                    <p className="text-xs sm:text-sm mt-1 text-slate-300 font-bold">
                      Desbloquea {Math.max(0, 15 - totalUpgradesBought)} mejoras más
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm mt-1 text-slate-400 italic">
                      ¿Qué es? ¿Qué es?
                    </p>
                  )}
                </div>
                {!isM1Locked && (
                  <div className="text-right">
                    <span className={`font-pixel text-base sm:text-lg font-bold ${state.points >= m1Cost ? 'text-yellow-300' : 'text-slate-500'}`}>
                      {formatNumber(m1Cost)} pts
                    </span>
                  </div>
                )}
              </div>

              {!isM1Locked && (
                <div className="mt-3 pt-3 border-t border-pink-900/40 flex justify-end">
                  <button
                    onClick={() => {
                      playBuySound();
                      onBuyM1();
                    }}
                    disabled={state.points < m1Cost && !state.milestone1Unlocked}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all border-2 ${state.milestone1Unlocked
                      ? 'bg-pink-600 text-white border-pink-400 border-b-4 border-b-pink-800 cursor-pointer shadow-[0_2px_0_#831843]'
                      : state.points >= m1Cost
                        ? 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400 border-b-4 border-b-pink-800 cursor-pointer shadow-[0_2px_0_#831843] active:translate-y-0.5 active:border-b-2 active:shadow-none'
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                  >
                    {state.milestone1Unlocked ? 'Ver de nuevo' : 'Comprar Secreto'}
                  </button>
                </div>
              )}
            </div>

            {/* Secret Card 2 */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col ${isM2Locked
              ? 'bg-slate-950/80 border-slate-800 text-slate-400 opacity-70'
              : state.points >= m2Cost
                ? 'bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border-cyan-400 border-b-4 border-b-cyan-600 shadow-[0_4px_0_#0e7490] text-white'
                : 'bg-slate-900 border-cyan-900/60 border-b-4 border-b-slate-950 text-slate-400'
              }`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className={`w-5 h-5 ${isM2Locked ? 'text-slate-500' : 'text-cyan-400'}`} />
                    <h3 className="font-bold text-sm sm:text-base text-cyan-200">
                      {isM2Locked ? '(Bloqueado)' : '???'}
                    </h3>
                  </div>
                  {isM2Locked && (
                    <p className="text-xs sm:text-sm mt-1 text-slate-300 font-bold">
                      Desbloquea {Math.max(0, 50 - totalUpgradesBought)} mejoras más
                    </p>
                  )}
                </div>
                {!isM2Locked && (
                  <div className="text-right">
                    <span className={`font-pixel text-base sm:text-lg font-bold ${state.points >= m2Cost ? 'text-yellow-300' : 'text-slate-500'}`}>
                      {formatNumber(m2Cost)} pts
                    </span>
                  </div>
                )}
              </div>

              {!isM2Locked && (
                <div className="mt-3 pt-3 border-t border-cyan-900/40 flex justify-end">
                  <button
                    onClick={() => {
                      playBuySound();
                      onBuyM2();
                    }}
                    disabled={state.points < m2Cost && !state.milestone2Unlocked}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all border-2 ${state.milestone2Unlocked
                      ? 'bg-cyan-600 text-white border-cyan-400 border-b-4 border-b-cyan-800 cursor-pointer shadow-[0_2px_0_#0891b2]'
                      : state.points >= m2Cost
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 border-b-4 border-b-cyan-800 cursor-pointer shadow-[0_2px_0_#0891b2] active:translate-y-0.5 active:border-b-2 active:shadow-none'
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                  >
                    {state.milestone2Unlocked ? 'Ver de nuevo' : 'Comprar Secreto'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
