import React from 'react';
import { AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';

export function Alerta({
  tipo = 'info', // info, success, warning, danger
  titulo,
  mensaje,
  icono = true,
  className = ''
}) {
  const estilos = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-900'
  };

  const Iconos = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertOctagon
  };

  const ComponenteIcono = Iconos[tipo] || Info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${estilos[tipo] || estilos.info} ${className}`}>
      {icono && <ComponenteIcono className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 text-sm">
        {titulo && <h4 className="font-semibold mb-0.5">{titulo}</h4>}
        {mensaje && <p>{mensaje}</p>}
      </div>
    </div>
  );
}

// Subcomponente de Badge o Etiqueta de Alerta Visual
export function BadgeStock({ stockActual, stockMinimo }) {
  const esAgotado = stockActual <= 0;
  const esBajo = stockActual <= stockMinimo;

  if (esAgotado) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
        ¡AGOTADO! ({stockActual})
      </span>
    );
  }

  if (esBajo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        STOCK BAJO ({stockActual} / Mín: {stockMinimo})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      Normal ({stockActual})
    </span>
  );
}

export default Alerta;
