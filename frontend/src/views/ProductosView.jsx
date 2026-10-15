import React, { useState, useEffect } from 'react';
import { useProductoController } from '../controllers/producto.controller';
import { productoService } from '../services/producto.service';
import { Boton } from '../componentes/Boton';
import { Tabla } from '../componentes/Tabla';
import { Filtro } from '../componentes/Filtro';
import { Modal } from '../componentes/Modal';
import { BadgeStock } from '../componentes/Alerta';
import { FormularioInput } from '../componentes/FormularioInput';
import { formatearQuetzales, generarCodigoIncremental } from '../utils/formato';
import { Plus, Edit2, Trash2, Tag, Layers, Sparkles, AlertTriangle } from 'lucide-react';

export function ProductosView() {
  const {
    productos,
    cargando,
    busqueda,
    setBusqueda,
    error,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  } = useProductoController();

  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [codigoModificadoManual, setCodigoModificadoManual] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    id_categoria: '1',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '0',
    stock_minimo: '5'
  });

  useEffect(() => {
    async function cargarCats() {
      try {
        const cats = await productoService.obtenerCategorias();
        setCategorias(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, id_categoria: cats[0].ID_CATEGORIA.toString() }));
        }
      } catch (e) {
        console.error('Error al cargar categorías:', e);
      }
    }
    cargarCats();
  }, []);

  const abrirModalNuevo = () => {
    setProductoEditar(null);
    setCodigoModificadoManual(false);
    setFormData({
      codigo: '',
      nombre: '',
      id_categoria: categorias.length > 0 ? categorias[0].ID_CATEGORIA.toString() : '1',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '0',
      stock_minimo: '5'
    });
    setErrorForm('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (p) => {
    setProductoEditar(p);
    setCodigoModificadoManual(true);
    setFormData({
      codigo: p.CODIGO,
      nombre: p.NOMBRE,
      id_categoria: (p.ID_CATEGORIA || 1).toString(),
      precio_compra: p.PRECIO_COMPRA.toString(),
      precio_venta: p.PRECIO_VENTA.toString(),
      stock_actual: p.STOCK_ACTUAL.toString(),
      stock_minimo: p.STOCK_MINIMO.toString()
    });
    setErrorForm('');
    setModalAbierto(true);
  };

  const handleNombreChange = (e) => {
    const nuevoNombre = e.target.value;
    if (!productoEditar && !codigoModificadoManual) {
      const codigoSugerido = generarCodigoIncremental(nuevoNombre, productos);
      setFormData(prev => ({ ...prev, nombre: nuevoNombre, codigo: codigoSugerido }));
    } else {
      setFormData(prev => ({ ...prev, nombre: nuevoNombre }));
    }
  };

  const handleGenerarCodigoManual = () => {
    const cod = generarCodigoIncremental(formData.nombre, productos);
    setFormData(prev => ({ ...prev, codigo: cod }));
    setCodigoModificadoManual(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');

    let codigoFinal = formData.codigo.trim();
    if (!codigoFinal) {
      codigoFinal = generarCodigoIncremental(formData.nombre, productos);
    }

    if (!codigoFinal) {
      setErrorForm('Por favor ingrese o genere un código para el producto');
      return;
    }

    setGuardando(true);
    try {
      if (productoEditar) {
        await actualizarProducto(productoEditar.ID, { ...formData, codigo: codigoFinal });
      } else {
        await crearProducto({ ...formData, codigo: codigoFinal });
      }
      setModalAbierto(false);
    } catch (err) {
      setErrorForm(err.message || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      try {
        await eliminarProducto(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const columnas = [
    { titulo: 'Código' },
    { titulo: 'Nombre de Producto' },
    { titulo: 'Categoría' },
    { titulo: 'Precio Compra (Q)' },
    { titulo: 'Precio Venta (Q)' },
    { titulo: 'Stock' },
    { titulo: 'Estado / Alerta' },
    { titulo: 'Acciones', className: 'text-right' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h2>
          <p className="text-sm text-slate-500">Gestión de mercancía con precios en Quetzales (Q) y códigos inteligentes incrementales</p>
        </div>
        <Boton
          onClick={abrirModalNuevo}
          variante="primary"
          icono={Plus}
        >
          Nuevo Producto
        </Boton>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          {error}
        </div>
      )}

      <Filtro
        valor={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por código (ej. azu01), nombre o categoría..."
      />

      <Tabla
        columnas={columnas}
        datos={productos}
        cargando={cargando}
        mensajeVacio="No se encontraron productos registrados"
        renderFila={(p) => {
          const esAlerta = p.STOCK_ACTUAL <= p.STOCK_MINIMO;
          return (
            <tr
              key={p.ID}
              className={`hover:bg-slate-50 transition-colors ${
                esAlerta ? 'bg-amber-50/40' : ''
              }`}
            >
              <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/30 rounded">
                {p.CODIGO}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">{p.NOMBRE}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {p.CATEGORIA}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium">
                {formatearQuetzales(p.PRECIO_COMPRA)}
              </td>
              <td className="px-4 py-3 font-bold text-slate-900">
                {formatearQuetzales(p.PRECIO_VENTA)}
              </td>
              <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.STOCK_ACTUAL}</td>
              <td className="px-4 py-3">
                <BadgeStock stockActual={p.STOCK_ACTUAL} stockMinimo={p.STOCK_MINIMO} />
              </td>
              <td className="px-4 py-3 text-right space-x-1">
                <button
                  onClick={() => abrirModalEditar(p)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminar(p.ID, p.NOMBRE)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Modal para Crear / Editar Producto */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={productoEditar ? 'Editar Producto' : 'Registrar Nuevo Producto'}
      >
        {errorForm && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {errorForm}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleNombreChange}
              placeholder="Ej. Azúcar Blanca 1kg ó Gaseosa Cola 2.5L"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Al escribir el nombre, el código incremental se calcula automáticamente (ej: Azúcar &rarr; azu01, Gaseosa &rarr; gas01).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Código *
                </label>
                <button
                  type="button"
                  onClick={handleGenerarCodigoManual}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  title="Regenerar código según el nombre"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={(e) => {
                  setCodigoModificadoManual(true);
                  setFormData({ ...formData, codigo: e.target.value });
                }}
                placeholder="Ej. azu01, gas01"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-indigo-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Categoría *
              </label>
              <select
                value={formData.id_categoria}
                onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {categorias.map((c) => (
                  <option key={c.ID_CATEGORIA} value={c.ID_CATEGORIA}>
                    {c.NOMBRE_CATEGORIA}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormularioInput
              label="Precio Compra (Q) *"
              type="number"
              step="0.01"
              min="0"
              name="precio_compra"
              value={formData.precio_compra}
              onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
              placeholder="0.00"
              required
            />
            <FormularioInput
              label="Precio Venta (Q) *"
              type="number"
              step="0.01"
              min="0"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormularioInput
              label="Stock Inicial"
              type="number"
              min="0"
              name="stock_actual"
              value={formData.stock_actual}
              onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
              disabled={!!productoEditar}
            />
            <FormularioInput
              label="Stock Mínimo (Alerta)"
              type="number"
              min="1"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
              required
              icono={AlertTriangle}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Boton variante="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="primary" type="submit" cargando={guardando}>
              {productoEditar ? 'Guardar Cambios' : 'Crear Producto'}
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductosView;
