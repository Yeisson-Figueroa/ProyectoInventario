import React from 'react';

export function Tabla({
  columnas = [],
  datos = [],
  cargando = false,
  mensajeVacio = 'No hay registros disponibles',
  renderFila,
  claveFila = (item, index) => item.id || index
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200">
          <tr>
            {columnas.map((col, index) => (
              <th key={index} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {cargando ? (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando información...</span>
                </div>
              </td>
            </tr>
          ) : datos.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-slate-400">
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            datos.map((item, index) => renderFila(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tabla;
