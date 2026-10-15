import React from 'react';
import { Search, X } from 'lucide-react';

export function Filtro({
  valor = '',
  onChange,
  onLimpiar,
  placeholder = 'Buscar...',
  accionesExtra
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        />
        {valor && (
          <button
            type="button"
            onClick={onLimpiar || (() => onChange(''))}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {accionesExtra && (
        <div className="flex items-center gap-2">
          {accionesExtra}
        </div>
      )}
    </div>
  );
}

export default Filtro;
