import React, { useEffect, useState } from 'react';
import { useMovimientoController } from '../controllers/movimiento.controller';
import { useProductoController } from '../controllers/producto.controller';
import { Tabla } from '../componentes/Tabla';
import { Filtro } from '../componentes/Filtro';
import { Boton } from '../componentes/Boton';
import { Modal } from '../componentes/Modal';
import { Alerta } from '../componentes/Alerta';
import { FormularioInput } from '../componentes/FormularioInput';
import { exportarAExcel } from '../utils/formato';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  FileSpreadsheet, 
  Trash2, 
  ShoppingCart,
  Calendar,
  X,
  Filter
} from 'lucide-react';

export function HistorialView() {
  const { historial, cargando, cargarHistorial, registrarSalida } = useMovimientoController();
  const { productos, cargarProductos } = useProductoController();

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Modal para Descarte / Salida
  const [modalDescarteAbierto, setModalDescarteAbierto] = useState(false);
  const [descarteProductoId, setDescarteProductoId] = useState('');
  const [descarteCantidad, setDescarteCantidad] = useState('1');
  const [descarteMotivo, setDescarteMotivo] = useState('DESCARTE - Producto vencido');
  const [descarteOtro, setDescarteOtro] = useState('');
  const [guardandoDescarte, setGuardandoDescarte] = useState(false);
  const [errorDescarte, setErrorDescarte] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const historialFiltrado = historial.filter(m => {
    // 1. Filtro por fecha inicio
    if (fechaInicio) {
      const fechaMov = new Date(m.FECHA);
      const desde = new Date(`${fechaInicio}T00:00:00`);
      if (fechaMov < desde) return false;
    }

    // 2. Filtro por fecha fin
    if (fechaFin) {
      const fechaMov = new Date(m.FECHA);
      const hasta = new Date(`${fechaFin}T23:59:59`);
      if (fechaMov > hasta) return false;
    }

    // 3. Filtro por texto
    const coincideTexto = 
      (m.PRODUCTO_NOMBRE && m.PRODUCTO_NOMBRE.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.PRODUCTO_CODIGO && m.PRODUCTO_CODIGO.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.MOTIVO && m.MOTIVO.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.RESPONSABLE_NOMBRE && m.RESPONSABLE_NOMBRE.toLowerCase().includes(busqueda.toLowerCase()));

    if (!coincideTexto) return false;

    // 4. Filtro por tipo
    const tipoStr = String(m.TIPO || m.TIPO_MOVIMIENTO || '').trim().toUpperCase();
    const motivoStr = String(m.MOTIVO || '').toUpperCase();

    if (filtroTipo === 'ENTRADA') return tipoStr === 'ENTRADA';
    if (filtroTipo === 'VENTA') return tipoStr === 'SALIDA' && motivoStr.includes('VENTA');
    if (filtroTipo === 'DESCARTE') return tipoStr === 'SALIDA' && !motivoStr.includes('VENTA');

    return true;
  });

  const handleDescargarExcel = () => {
    if (!historialFiltrado || historialFiltrado.length === 0) {
      alert('No hay movimientos en el rango de fechas seleccionado para exportar.');
      return;
    }

    const dataExcel = historialFiltrado.map(m => {
      const tipoStr = String(m.TIPO || m.TIPO_MOVIMIENTO || '').trim().toUpperCase();
      const motivoStr = m.MOTIVO || (tipoStr === 'ENTRADA' ? 'Entrada de mercancía' : 'Salida de inventario');

      return {
        'ID Movimiento': m.ID,
        'Fecha y Hora': new Date(m.FECHA).toLocaleString('es-GT'),
        'Tipo de Movimiento': tipoStr,
        'Código Producto': m.PRODUCTO_CODIGO,
        'Nombre del Producto': m.PRODUCTO_NOMBRE,
        'Cantidad': m.CANTIDAD,
        'Stock Anterior': m.STOCK_ANTERIOR,
        'Total Inventario': m.STOCK_NUEVO,
        'Motivo Detallado': motivoStr,
        'Responsable': m.RESPONSABLE_NOMBRE || 'Sistema'
      };
    });

    const nombreArchivo = (fechaInicio || fechaFin)
      ? `Historial_Movimientos_${fechaInicio || 'inicio'}_al_${fechaFin || 'hoy'}.xlsx`
      : 'Historial_Movimientos_Completo.xlsx';

    exportarAExcel(nombreArchivo, dataExcel);
  };

  const handleLimpiarFiltroFechas = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  const handleGuardarDescarte = async (e) => {
    e.preventDefault();
    setErrorDescarte('');
    setMensajeExito('');

    if (!descarteProductoId) {
      setErrorDescarte('Selecciona un producto para descartar');
      return;
    }

    const motivoFinal = descarteMotivo === 'OTRO' 
      ? (descarteOtro.trim() || 'DESCARTE - Ajuste manual') 
      : descarteMotivo;

    setGuardandoDescarte(true);
    try {
      const res = await registrarSalida({
        producto_id: parseInt(descarteProductoId, 10),
        cantidad: parseInt(descarteCantidad, 10),
        motivo: motivoFinal
      });

      setMensajeExito(`¡Salida/Descarte registrado exitosamente! Motivo: "${motivoFinal}". Nuevo stock: ${res.stock_nuevo}`);
      setModalDescarteAbierto(false);
      setDescarteCantidad('1');
      setDescarteProductoId('');
      setDescarteMotivo('DESCARTE - Producto vencido');
      setDescarteOtro('');
      await cargarProductos();
      await cargarHistorial();
    } catch (err) {
      setErrorDescarte(err.message || 'Error al registrar descarte');
    } finally {
      setGuardandoDescarte(false);
    }
  };

  const columnas = [
    { titulo: 'Fecha y Hora' },
    { titulo: 'Tipo' },
    { titulo: 'Código' },
    { titulo: 'Producto' },
    { titulo: 'Cantidad' },
    { titulo: 'Stock Ant' },
    { titulo: 'Total Inv' },
    { titulo: 'Motivo Detallado' },
    { titulo: 'Responsable' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial de Movimientos (Kardex)</h2>
          <p className="text-sm text-slate-500">Trazabilidad detallada de entradas, ventas y descartes por vencimiento</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDescargarExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            title="Descargar movimientos filtrados por fecha en Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar en Excel</span>
          </button>

          <Boton
            onClick={() => {
              setErrorDescarte('');
              setModalDescarteAbierto(true);
            }}
            variante="danger"
            icono={Trash2}
          >
            Registrar Descarte / Salida
          </Boton>

          <button
            onClick={() => cargarHistorial()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {mensajeExito && <Alerta tipo="success" mensaje={mensajeExito} />}

      {/* Bloque de Filtrado: Rango de Fechas + Búsqueda de Texto + Tipo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
          {/* Selector Fecha Inicio */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fecha Inicio (Desde)</span>
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Selector Fecha Fin */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fecha Fin (Hasta)</span>
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Botón para Limpiar Fechas */}
          {(fechaInicio || fechaFin) && (
            <button
              onClick={handleLimpiarFiltroFechas}
              className="h-[38px] px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 self-end"
              title="Quitar rango de fechas"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar Fechas</span>
            </button>
          )}
        </div>

        {/* Segunda fila: Búsqueda rápida y Pestañas de Tipo */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex-1 w-full">
            <Filtro
              valor={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por producto, código, motivo o responsable..."
            />
          </div>

          {/* Botones de Filtro Rápido por Tipo */}
          <div className="flex items-center gap-1 self-start md:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filtroTipo === 'TODOS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('ENTRADA')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filtroTipo === 'ENTRADA' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFiltroTipo('VENTA')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filtroTipo === 'VENTA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Ventas
            </button>
            <button
              onClick={() => setFiltroTipo('DESCARTE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filtroTipo === 'DESCARTE' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Descartes
            </button>
          </div>
        </div>
      </div>

      <Tabla
        columnas={columnas}
        datos={historialFiltrado}
        cargando={cargando}
        mensajeVacio="No existen movimientos registrados con los filtros de fecha y tipo seleccionados"
        renderFila={(m) => {
          const tipoStr = String(m.TIPO || m.TIPO_MOVIMIENTO || m.tipo || m.tipo_movimiento || '').trim().toUpperCase();
          const esEntrada = tipoStr === 'ENTRADA';
          const motivoStr = String(m.MOTIVO || '').toUpperCase();
          const esVenta = !esEntrada && motivoStr.includes('VENTA');

          return (
            <tr key={m.ID} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                {new Date(m.FECHA).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {esEntrada ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ArrowDownLeft className="w-3 h-3" /> ENTRADA
                  </span>
                ) : esVenta ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <ShoppingCart className="w-3 h-3" /> SALIDA (VENTA)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <Trash2 className="w-3 h-3" /> SALIDA (DESCARTE)
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                {m.PRODUCTO_CODIGO}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">
                {m.PRODUCTO_NOMBRE}
              </td>
              <td className={`px-4 py-3 font-bold whitespace-nowrap ${esEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                {esEntrada ? `+${m.CANTIDAD}` : `-${m.CANTIDAD}`}
              </td>
              <td className="px-4 py-3 text-xs font-mono text-slate-500 text-center">
                {m.STOCK_ANTERIOR}
              </td>
              <td className="px-4 py-3 text-xs font-mono font-bold text-slate-900 text-center bg-slate-50/50">
                {m.STOCK_NUEVO}
              </td>
              <td className="px-4 py-3 text-xs">
                <span className={`inline-block px-2 py-0.5 rounded font-medium border ${
                  esEntrada 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : esVenta 
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {m.MOTIVO || (esEntrada ? 'Reabastecimiento de Proveedor' : 'VENTA')}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                {m.RESPONSABLE_NOMBRE || 'Sistema'}
              </td>
            </tr>
          );
        }}
      />

      {/* Modal para Registrar Descarte / Salida */}
      <Modal
        abierto={modalDescarteAbierto}
        onCerrar={() => setModalDescarteAbierto(false)}
        titulo="Registrar Salida de Mercancía / Descarte por Vencimiento"
      >
        {errorDescarte && <Alerta tipo="danger" mensaje={errorDescarte} className="mb-4" />}

        <form onSubmit={handleGuardarDescarte} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Seleccionar Producto *
            </label>
            <select
              value={descarteProductoId}
              onChange={(e) => setDescarteProductoId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-sm"
            >
              <option value="">-- Selecciona el producto a retirar --</option>
              {productos.map((p) => (
                <option key={p.ID} value={p.ID}>
                  {p.CODIGO} - {p.NOMBRE} (Stock disponible: {p.STOCK_ACTUAL})
                </option>
              ))}
            </select>
          </div>

          <FormularioInput
            label="Cantidad a Retirar / Descartar *"
            type="number"
            min="1"
            value={descarteCantidad}
            onChange={(e) => setDescarteCantidad(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Motivo de la Salida / Descarte *
            </label>
            <select
              value={descarteMotivo}
              onChange={(e) => setDescarteMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 shadow-sm"
            >
              <option value="DESCARTE - Producto vencido">DESCARTE - Producto vencido</option>
              <option value="DESCARTE - Producto dañado o roto">DESCARTE - Producto dañado o roto</option>
              <option value="DESCARTE - Deterioro / Merma">DESCARTE - Deterioro / Merma</option>
              <option value="AJUSTE - Inventario / Auditoría">AJUSTE - Corrección de Inventario</option>
              <option value="OTRO">Otro motivo personalizado...</option>
            </select>
          </div>

          {descarteMotivo === 'OTRO' && (
            <FormularioInput
              label="Especifique el Motivo *"
              type="text"
              value={descarteOtro}
              onChange={(e) => setDescarteOtro(e.target.value)}
              placeholder="Ej. Devolución a proveedor por defecto"
              required
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Boton variante="secondary" onClick={() => setModalDescarteAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="danger" type="submit" cargando={guardandoDescarte} icono={Trash2}>
              Confirmar Descarte (- Stock)
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HistorialView;
