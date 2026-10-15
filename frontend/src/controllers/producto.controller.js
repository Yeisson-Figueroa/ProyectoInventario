import { useState, useEffect, useCallback } from 'react';
import { productoService } from '../services/producto.service';

export function useProductoController() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async (query = '') => {
    setCargando(true);
    setError(null);
    try {
      const data = await productoService.obtenerProductos(query);
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos(busqueda);
  }, [busqueda, cargarProductos]);

  const crearProducto = async (datos) => {
    const res = await productoService.crearProducto(datos);
    await cargarProductos(busqueda);
    return res;
  };

  const actualizarProducto = async (id, datos) => {
    const res = await productoService.actualizarProducto(id, datos);
    await cargarProductos(busqueda);
    return res;
  };

  const eliminarProducto = async (id) => {
    const res = await productoService.eliminarProducto(id);
    await cargarProductos(busqueda);
    return res;
  };

  return {
    productos,
    cargando,
    busqueda,
    setBusqueda,
    error,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  };
}
