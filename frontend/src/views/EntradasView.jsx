import React, { useState, useEffect } from 'react';
import { useProductoController } from '../controllers/producto.controller';
import { useMovimientoController } from '../controllers/movimiento.controller';
import { Boton } from '../componentes/Boton';
import { Tabla } from '../componentes/Tabla';
import { FormularioInput } from '../componentes/FormularioInput';
import { Alerta } from '../componentes/Alerta';
import { ArrowDownLeft, PackagePlus, FileText, CheckCircle2 } from 'lucide-react';

export function EntradasView() {
  const { productos, cargarProductos } = useProductoController();
  const { historial, cargarHistorial, registrarEntrada } = useMovimientoController();

  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState('Reabastecimiento de Proveedor');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (!productoId) {
      setError('Por favor selecciona un producto');
      return;
    }

    setGuardando(true);
    try {
      const res = await registrarEntrada({
        id_producto: parseInt(productoId, 10),
        producto_id: parseInt(productoId, 10),
        cantidad: parseInt(cantidad, 10),
        motivo: motivo.trim() || 'Reabastecimiento de Proveedor'
      });

      setMensajeExito(`¡Entrada registrada con éxito! Nuevo total en inventario: ${res.stock_nuevo} unidades.`);
      setCantidad('1');
      setMotivo('Reabastecimiento de Proveedor');
      await cargarProductos();
      await cargarHistorial();
    } catch (err) {
      setError(err.message || 'Error al registrar entrada');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar movimientos de tipo ENTRADA
  const entradas = historial.filter(m => {
    const tipoStr = String(m.TIPO || m.TIPO_MOVIMIENTO || m.tipo || m.tipo_movimiento || '').trim().toUpperCase();
    return tipoStr === 'ENTRADA' || (m.STOCK_NUEVO !== undefined && m.STOCK_ANTERIOR !== undefined && m.STOCK_NUEVO > m.STOCK_ANTERIOR);
  });

  const columnas = [
    { titulo: 'Fecha / Hr' },
    { titulo: 'Código' },
    { titulo: 'Producto' },
    { titulo: 'Cantidad Ingresada' },
    { titulo: 'Stock Ant' },
    { titulo: 'Total Inv' },
    { titulo: 'Motivo' },
    { titulo: 'Responsable' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Entradas de Mercancía</h2>
        <p className="text-sm text-slate-500">Registrar reabastecimientos e ingresos con motivo y trazabilidad de inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Entrada */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold border-b border-slate-100 pb-3">
            <PackagePlus className="w-5 h-5" />
            <span>Registrar Nueva Entrada</span>
          </div>

          {mensajeExito && (
            <Alerta tipo="success" mensaje={mensajeExito} />
          )}

          {error && (
            <Alerta tipo="danger" mensaje={error} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Seleccionar Producto *
              </label>
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map((p) => (
                  <option key={p.ID} value={p.ID}>
                    {p.CODIGO} - {p.NOMBRE} (Stock actual: {p.STOCK_ACTUAL})
                  </option>
                ))}
              </select>
            </div>

            <FormularioInput
              label="Cantidad a Ingresar *"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Motivo de Entrada *
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Factura Proveedor #1234, Reabastecimiento, Devolución"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <p className="text-xs text-slate-400 mt-1">Este motivo quedará visible en la tabla y en el historial.</p>
            </div>

            <Boton
              type="submit"
              variante="success"
              icono={ArrowDownLeft}
              cargando={guardando}
              className="w-full py-2.5 shadow-md shadow-emerald-600/20"
            >
              Confirmar Entrada (+ Stock)
            </Boton>
          </form>
        </div>

        {/* Tabla de Entradas Recientes Desglosada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Desglose de Entradas Registradas</h3>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              {entradas.length} ingresos registrados
            </span>
          </div>

          <Tabla
            columnas={columnas}
            datos={entradas}
            mensajeVacio="No se han registrado entradas de mercancía"
            renderFila={(m) => (
              <tr key={m.ID} className="hover:bg-slate-50 transition-colors">
                {/* 1. Fecha/hr */}
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(m.FECHA).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                {/* 2. Codigo */}
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                  {m.PRODUCTO_CODIGO}
                </td>
                {/* 3. Producto */}
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {m.PRODUCTO_NOMBRE}
                </td>
                {/* 4. Cantidad ingresada */}
                <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">
                  +{m.CANTIDAD}
                </td>
                {/* 5. Stock Ant */}
                <td className="px-4 py-3 font-mono text-xs text-slate-500 text-center">
                  {m.STOCK_ANTERIOR}
                </td>
                {/* 6. Total Inv */}
                <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 text-center bg-slate-50/50">
                  {m.STOCK_NUEVO}
                </td>
                {/* 7. Motivo */}
                <td className="px-4 py-3 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-[200px] truncate" title={m.MOTIVO}>
                    {m.MOTIVO || 'Reabastecimiento'}
                  </span>
                </td>
                {/* 8. Responsable */}
                <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                  {m.RESPONSABLE_NOMBRE || 'Sistema'}
                </td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default EntradasView;
