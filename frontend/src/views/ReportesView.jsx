import React, { useEffect } from 'react';
import { useReporteController } from '../controllers/reporte.controller';
import { TarjetaMetrica } from '../componentes/TarjetaMetrica';
import { Tabla } from '../componentes/Tabla';
import { Boton } from '../componentes/Boton';
import { FormularioInput } from '../componentes/FormularioInput';
import { BadgeStock } from '../componentes/Alerta';
import { formatearQuetzales } from '../utils/formato';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Filter, 
  Coins 
} from 'lucide-react';

export function ReportesView() {
  const {
    reporte,
    productosAgotarse,
    cargando,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargarReporte
  } = useReporteController();

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const handleFiltrar = (e) => {
    e.preventDefault();
    cargarReporte();
  };

  const columnasTop = [
    { titulo: 'Código' },
    { titulo: 'Producto' },
    { titulo: 'Unidades Vendidas' },
    { titulo: 'Total Generado (Q)' }
  ];

  const columnasAgotarse = [
    { titulo: 'Código' },
    { titulo: 'Producto' },
    { titulo: 'Categoría' },
    { titulo: 'Stock Actual' },
    { titulo: 'Stock Mínimo' },
    { titulo: 'Alerta Stock' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes de Ventas e Inventario</h2>
          <p className="text-sm text-slate-500">Métricas recaudadas en Quetzales (Q), productos más vendidos y alertas de stock bajo</p>
        </div>
      </div>

      {/* Filtro por Rango de Fechas */}
      <form onSubmit={handleFiltrar} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-end gap-4">
        <FormularioInput
          label="Fecha Inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="mb-0 flex-1"
          icono={Calendar}
        />
        <FormularioInput
          label="Fecha Fin"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="mb-0 flex-1"
          icono={Calendar}
        />
        <Boton
          type="submit"
          variante="primary"
          icono={Filter}
          cargando={cargando}
          className="mb-[2px]"
        >
          Aplicar Filtro
        </Boton>
      </form>

      {/* Tarjetas resumen KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <TarjetaMetrica
          titulo="Total Recaudado (Q)"
          valor={formatearQuetzales(reporte ? reporte.total_recaudado : 0)}
          subtitulo="Ingresos en Quetzales del período"
          icono={Coins}
          color="emerald"
        />
        <TarjetaMetrica
          titulo="Total de Ventas"
          valor={reporte ? reporte.total_ventas_count : 0}
          subtitulo="Facturas / Comprobantes emitidos"
          icono={ShoppingBag}
          color="indigo"
        />
        <TarjetaMetrica
          titulo="Por Agotarse / Bajo Stock"
          valor={productosAgotarse.length}
          subtitulo="Productos requiriendo reabastecimiento"
          icono={AlertTriangle}
          color={productosAgotarse.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Secciones de Tablas: Productos Más Vendidos y Alertas de Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Vendidos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Productos Más Vendidos</span>
          </div>

          <Tabla
            columnas={columnasTop}
            datos={reporte ? reporte.productos_mas_vendidos : []}
            cargando={cargando}
            mensajeVacio="No hay ventas registradas en el rango seleccionado"
            renderFila={(item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/30 rounded">
                  {item.PRODUCTO_CODIGO}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{item.PRODUCTO_NOMBRE}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{item.TOTAL_VENDIDO} u.</td>
                <td className="px-4 py-3 font-extrabold text-emerald-600 font-mono">
                  {formatearQuetzales(item.TOTAL_INGRESOS)}
                </td>
              </tr>
            )}
          />
        </div>

        {/* Productos por Agotarse */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Alerta: Productos por Agotarse</span>
          </div>

          <Tabla
            columnas={columnasAgotarse}
            datos={productosAgotarse}
            cargando={cargando}
            mensajeVacio="¡Excelente! No hay productos con stock por debajo del mínimo"
            renderFila={(p) => (
              <tr key={p.ID} className="hover:bg-slate-50 transition-colors bg-amber-50/40">
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{p.CODIGO}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{p.NOMBRE}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{p.CATEGORIA}</td>
                <td className="px-4 py-3 font-bold text-rose-600">{p.STOCK_ACTUAL}</td>
                <td className="px-4 py-3 text-slate-600">{p.STOCK_MINIMO}</td>
                <td className="px-4 py-3">
                  <BadgeStock stockActual={p.STOCK_ACTUAL} stockMinimo={p.STOCK_MINIMO} />
                </td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default ReportesView;
