import React from 'react';

export const ResetModal = ({ onConfirm, onClose }: { onConfirm: () => void, onClose: () => void }) => {
  const [progress, setProgress] = React.useState(0);
  const reqRef = React.useRef<number | null>(null);
  
  const startHold = () => {
    const start = Date.now();
    const duration = 2000;
    
    const update = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        onConfirm();
        onClose();
      } else {
        reqRef.current = requestAnimationFrame(update);
      }
    };
    reqRef.current = requestAnimationFrame(update);
  };
  
  const stopHold = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-2xl max-w-sm w-full">
        <h3 className="text-xl font-black text-red-500 mb-2">¿Borrar Progreso?</h3>
        <p className="text-slate-300 text-sm mb-6">Mantén presionado el botón para confirmar. Perderás todos tus puntos y mejoras.</p>
        <button 
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onContextMenu={(e) => e.preventDefault()}
          className="relative w-full py-4 bg-slate-800 border-b-4 border-slate-950 rounded-xl overflow-hidden active:border-b-0 active:translate-y-1 transition-all"
        >
          <div className="absolute inset-y-0 left-0 bg-red-600/80" style={{ width: `${progress}%` }} />
          <span className="relative z-10 font-bold text-white uppercase tracking-widest">
            {progress >= 100 ? 'Borrando...' : 'Mantén para borrar'}
          </span>
        </button>
        <button onClick={onClose} className="w-full mt-3 py-3 text-slate-400 font-bold hover:text-slate-200 transition-colors">Cancelar</button>
      </div>
    </div>
  );
};
