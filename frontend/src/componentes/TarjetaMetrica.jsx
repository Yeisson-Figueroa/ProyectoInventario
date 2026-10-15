import React from 'react';

export function TarjetaMetrica({
  titulo,
  valor,
  subtitulo,
  icono: Icono,
  color = 'indigo' // indigo, emerald, rose, amber
}) {
  const colores = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{titulo}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{valor}</h3>
        {subtitulo && <p className="text-xs text-slate-500 mt-1">{subtitulo}</p>}
      </div>
      {Icono && (
        <div className={`p-3.5 rounded-xl border ${colores[color] || colores.indigo}`}>
          <Icono className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

export default TarjetaMetrica;
