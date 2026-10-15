import React from 'react';
import { X } from 'lucide-react';

export function Modal({
  abierto = false,
  onCerrar,
  titulo,
  children,
  ancho = 'max-w-lg'
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative w-full ${ancho} bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">{titulo}</h3>
          <button
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
