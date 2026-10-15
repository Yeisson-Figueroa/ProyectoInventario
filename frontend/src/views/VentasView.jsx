import React, { useState } from 'react';
import { useProductoController } from '../controllers/producto.controller';
import { useVentaController } from '../controllers/venta.controller';
import { useAuth } from '../controllers/auth.controller';
import { Boton } from '../componentes/Boton';
import { Filtro } from '../componentes/Filtro';
import { Modal } from '../componentes/Modal';
import { Alerta, BadgeStock } from '../componentes/Alerta';
import { formatearQuetzales } from '../utils/formato';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Receipt, 
  Printer, 
  Store,
  Calendar,
  UserCheck
} from 'lucide-react';

export function VentasView() {
  const { productos, cargarProductos } = useProductoController();
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');

  const {
    carrito,
    totalCarrito,
    procesando,
    errorVenta,
    ventaCompletada,
    setVentaCompletada,
    agregarAlCarrito,
    modificarCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
    procesarVenta
  } = useVentaController();

  const productosFiltrados = productos.filter(
    p => p.NOMBRE.toLowerCase().includes(busqueda.toLowerCase()) ||
         p.CODIGO.toLowerCase().includes(busqueda.toLowerCase()) ||
         p.CATEGORIA.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleFinalizarVenta = async () => {
    try {
      await procesarVenta();
      await cargarProductos();
    } catch (e) {
      // Manejado por controller
    }
  };

  const handleImprimirComprobante = () => {
    if (!ventaCompletada) return;

    // Crear o reutilizar un iframe invisible para aislar completamente la impresión (sin hojas en blanco ni botones)
    let printIframe = document.getElementById('iframe-impresion-ticket');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'iframe-impresion-ticket';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentDocument || printIframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${ventaCompletada.numero_factura || 'Comprobante de Venta'}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #ffffff;
              color: #1e293b;
              display: flex;
              justify-content: center;
              padding: 10px;
            }
            .ticket-container {
              width: 100%;
              max-width: 420px;
              border: 1px solid #cbd5e1;
              border-radius: 16px;
              padding: 22px;
              background: #ffffff;
            }
            .header {
              text-align: center;
              padding-bottom: 12px;
              border-bottom: 1px dashed #cbd5e1;
              margin-bottom: 12px;
            }
            .header-title {
              font-size: 16px;
              font-weight: 900;
              color: #1e293b;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
            }
            .header-sub {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .badge-valido {
              display: inline-block;
              padding: 2px 12px;
              background: #ffffff;
              color: #334155;
              font-size: 10px;
              font-weight: bold;
              border-radius: 9999px;
              border: 1px solid #cbd5e1;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              font-size: 11px;
              color: #475569;
              padding-bottom: 10px;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 12px;
            }
            .meta-grid .full-row {
              grid-column: span 2;
            }
            .meta-strong {
              color: #0f172a;
              font-weight: bold;
            }
            .factura-no {
              font-family: monospace;
              font-weight: bold;
              color: #334155;
            }
            .section-title {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #334155;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              background: #ffffff;
              color: #475569;
              font-weight: bold;
              text-align: left;
              padding: 6px 4px;
              border-bottom: 1px solid #94a3b8;
            }
            td {
              padding: 6px 4px;
              border-bottom: 1px solid #f1f5f9;
            }
            .font-mono {
              font-family: monospace;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .totales-box {
              padding-top: 10px;
              border-top: 1px solid #cbd5e1;
              margin-top: 10px;
            }
            .subtotal-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748b;
              margin-bottom: 4px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 16px;
              font-weight: 900;
              color: #0f172a;
              padding-top: 6px;
              border-top: 1px solid #e2e8f0;
              margin-top: 6px;
            }
            .total-monto {
              font-size: 18px;
              font-weight: 900;
              font-family: monospace;
              color: #0f172a;
            }
            .footer-note {
              text-align: center;
              padding-top: 10px;
              margin-top: 12px;
              border-top: 1px dashed #cbd5e1;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="header">
              <div class="header-title">🏪 SISTEMA DE INVENTARIO Y VENTAS</div>
              <div class="header-sub">Guatemala, C.A. • Moneda: Quetzales (GTQ)</div>
              <div class="badge-valido">COMPROBANTE DE PAGO VÁLIDO</div>
            </div>

            <div class="meta-grid">
              <div>
                <span class="meta-strong">Factura No: </span>
                <span class="factura-no">${ventaCompletada.numero_factura}</span>
              </div>
              <div style="text-align: right;">
                <span class="meta-strong">Fecha/Hora: </span>
                <span>${new Date(ventaCompletada.fecha).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div class="full-row">
                <span class="meta-strong">Atendido por: </span>
                <span>${usuario?.nombre || 'Administrador'}</span>
              </div>
            </div>

            <div class="section-title">DETALLE DE PRODUCTOS</div>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right">Precio Unit.</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${(ventaCompletada.detalles || []).map(det => `
                  <tr>
                    <td class="font-mono" style="font-weight: 600;">${det.codigo || '—'}</td>
                    <td style="font-weight: 600; color: #1e293b;">${det.nombre}</td>
                    <td class="text-center" style="font-weight: bold;">${det.cantidad}</td>
                    <td class="text-right font-mono">${formatearQuetzales(det.precio_unitario)}</td>
                    <td class="text-right font-mono" style="font-weight: bold; color: #0f172a;">${formatearQuetzales(det.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totales-box">
              <div class="subtotal-row">
                <span>Subtotal:</span>
                <span>${formatearQuetzales(ventaCompletada.total)}</span>
              </div>
              <div class="subtotal-row">
                <span>Descuento aplicado:</span>
                <span>Q 0.00</span>
              </div>
              <div class="total-row">
                <span>TOTAL COBRADO:</span>
                <span class="total-monto">${formatearQuetzales(ventaCompletada.total)}</span>
              </div>
            </div>

            <div class="footer-note">
              ¡Gracias por su preferencia! • Conserve este comprobante para cualquier reclamo o garantía.
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Terminal de Ventas (Punto de Venta)</h2>
        <p className="text-sm text-slate-500">Cobro rápido en Quetzales (Q) y emisión de comprobantes de pago tipo factura</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selección de Productos (2 Columnas) */}
        <div className="lg:col-span-2 space-y-4">
          <Filtro
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por código (ej. azu01), nombre o categoría..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {productosFiltrados.map((p) => {
              const sinStock = p.STOCK_ACTUAL <= 0;

              return (
                <div
                  key={p.ID}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    sinStock
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {p.CODIGO}
                      </span>
                      <BadgeStock stockActual={p.STOCK_ACTUAL} stockMinimo={p.STOCK_MINIMO} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">{p.NOMBRE}</h4>
                    <p className="text-xs text-slate-400">{p.CATEGORIA}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatearQuetzales(p.PRECIO_VENTA)}
                    </span>
                    <Boton
                      onClick={() => agregarAlCarrito(p, 1)}
                      disabled={sinStock}
                      variante={sinStock ? 'secondary' : 'primary'}
                      tamano="sm"
                      icono={Plus}
                    >
                      {sinStock ? 'Agotado' : 'Agregar'}
                    </Boton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen del Carrito de Ventas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col justify-between h-[650px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <span>Carrito de Venta</span>
              </div>
              {carrito.length > 0 && (
                <button
                  onClick={limpiarCarrito}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Vaciar
                </button>
              )}
            </div>

            {errorVenta && (
              <Alerta tipo="danger" mensaje={errorVenta} className="my-3" />
            )}

            {/* Lista de Items */}
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">El carrito está vacío</p>
                  <p className="text-xs">Selecciona productos del catálogo para facturar</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.producto.ID}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className="font-semibold text-slate-800 text-sm truncate">{item.producto.NOMBRE}</h5>
                      <p className="text-xs text-slate-500 font-mono">
                        {formatearQuetzales(item.producto.PRECIO_VENTA)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => modificarCantidad(item.producto.ID, item.cantidad - 1)}
                          className="px-2 py-1 hover:bg-slate-100 text-slate-600"
                          disabled={item.cantidad <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.cantidad}</span>
                        <button
                          onClick={() => modificarCantidad(item.producto.ID, item.cantidad + 1)}
                          className="px-2 py-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => eliminarDelCarrito(item.producto.ID)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totales y Botón Cobrar */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span>Artículos a cobrar:</span>
              <span className="font-bold text-slate-800">{carrito.reduce((a, b) => a + b.cantidad, 0)} unidades</span>
            </div>

            <div className="flex justify-between items-center text-slate-900 text-xl font-extrabold">
              <span>Total a Pagar:</span>
              <span className="text-indigo-600 text-2xl">{formatearQuetzales(totalCarrito)}</span>
            </div>

            <Boton
              onClick={handleFinalizarVenta}
              disabled={carrito.length === 0}
              cargando={procesando}
              variante="success"
              icono={CheckCircle2}
              className="w-full py-3 text-base shadow-lg shadow-emerald-600/20"
            >
              Completar Venta y Emitir Factura
            </Boton>
          </div>
        </div>
      </div>

      {/* Modal Comprobante / Factura Detallada */}
      <Modal
        abierto={!!ventaCompletada}
        onCerrar={() => setVentaCompletada(null)}
        titulo="Comprobante de Venta / Factura Emitida"
      >
        {ventaCompletada && (
          <div className="space-y-4">
            {/* Contenedor Imprimible */}
            <div id="seccion-factura-imprimible" className="p-4 bg-white border border-slate-300 rounded-xl shadow-sm text-slate-800 font-sans space-y-3">
              {/* Cabecera de la Tienda */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-black text-lg tracking-wide">
                  <Store className="w-5 h-5" />
                  <span>SISTEMA DE INVENTARIO Y VENTAS</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Guatemala, C.A. • Moneda: Quetzales (GTQ)</p>
                <div className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                  COMPROBANTE DE PAGO VÁLIDO
                </div>
              </div>

              {/* Datos de la Factura */}
              <div className="grid grid-cols-2 text-xs py-1 border-b border-slate-200 gap-y-1 text-slate-600">
                <div>
                  <span className="font-bold text-slate-800">Factura No: </span>
                  <span className="font-mono font-bold text-indigo-700">{ventaCompletada.numero_factura}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">Fecha/Hora: </span>
                  <span>{new Date(ventaCompletada.fecha).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800">Atendido por: </span>
                  <span>{usuario?.nombre || 'Cajero en Turno'}</span>
                </div>
              </div>

              {/* Detalle de Productos llevados */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Detalle de Productos</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-600 font-semibold">
                        <th className="py-1.5 px-2">Código</th>
                        <th className="py-1.5 px-2">Producto</th>
                        <th className="py-1.5 px-2 text-center">Cant.</th>
                        <th className="py-1.5 px-2 text-right">Precio Unit.</th>
                        <th className="py-1.5 px-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(ventaCompletada.detalles || []).map((det, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2 font-mono text-[11px] font-bold text-indigo-600">
                            {det.codigo || '—'}
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-800">
                            {det.nombre}
                          </td>
                          <td className="py-1.5 px-2 text-center font-bold text-slate-700">
                            {det.cantidad}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-600 font-mono">
                            {formatearQuetzales(det.precio_unitario)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-slate-900 font-mono">
                            {formatearQuetzales(det.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="pt-2 border-t-2 border-slate-300 space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatearQuetzales(ventaCompletada.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Descuento aplicado:</span>
                  <span>Q 0.00</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL COBRADO:</span>
                  <span className="text-emerald-700 font-mono text-lg">{formatearQuetzales(ventaCompletada.total)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[11px] text-slate-400 border-t border-dashed border-slate-200">
                ¡Gracias por su preferencia! • Conserve este comprobante para cualquier reclamo o garantía.
              </div>
            </div>

            {/* Acciones del Comprobante (Ocultas al imprimir) */}
            <div className="flex justify-between items-center pt-2 no-print">
              <button
                type="button"
                onClick={handleImprimirComprobante}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-300 shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir / Guardar Ticket</span>
              </button>

              <Boton variante="primary" onClick={() => setVentaCompletada(null)}>
                Nueva Venta
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VentasView;
