import { useState } from 'react';
import { ventaService } from '../services/venta.service';

export function useVentaController() {
  const [carrito, setCarrito] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [errorVenta, setErrorVenta] = useState(null);
  const [ventaCompletada, setVentaCompletada] = useState(null);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setErrorVenta(null);
    const cant = parseInt(cantidad, 10);
    if (isNaN(cant) || cant <= 0) return;

    setCarrito(prev => {
      const existe = prev.find(item => item.producto.ID === producto.ID);
      const stockDisponible = producto.STOCK_ACTUAL;

      if (existe) {
        const nuevaCantidad = existe.cantidad + cant;
        if (nuevaCantidad > stockDisponible) {
          setErrorVenta(`No puedes agregar más de ${stockDisponible} unidades de ${producto.NOMBRE}`);
          return prev;
        }
        return prev.map(item =>
          item.producto.ID === producto.ID ? { ...item, cantidad: nuevaCantidad } : item
        );
      } else {
        if (cant > stockDisponible) {
          setErrorVenta(`El stock disponible de ${producto.NOMBRE} es sólo ${stockDisponible}`);
          return prev;
        }
        return [...prev, { producto, cantidad: cant }];
      }
    });
  };

  const modificarCantidad = (productoId, nuevaCantidad) => {
    setErrorVenta(null);
    const cant = parseInt(nuevaCantidad, 10);
    if (isNaN(cant) || cant <= 0) return;

    setCarrito(prev => {
      return prev.map(item => {
        if (item.producto.ID === productoId) {
          if (cant > item.producto.STOCK_ACTUAL) {
            setErrorVenta(`Stock disponible superado (${item.producto.STOCK_ACTUAL})`);
            return item;
          }
          return { ...item, cantidad: cant };
        }
        return item;
      });
    });
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(prev => prev.filter(item => item.producto.ID !== productoId));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setErrorVenta(null);
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.producto.PRECIO_VENTA * item.cantidad,
    0
  );

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      setErrorVenta('El carrito está vacío');
      return null;
    }

    setProcesando(true);
    setErrorVenta(null);
    try {
      const itemsPayload = carrito.map(item => ({
        producto_id: item.producto.ID,
        cantidad: item.cantidad
      }));

      const itemsComprados = carrito.map(item => ({
        id_producto: item.producto.ID,
        codigo: item.producto.CODIGO,
        nombre: item.producto.NOMBRE,
        cantidad: item.cantidad,
        precio_unitario: item.producto.PRECIO_VENTA,
        subtotal: item.producto.PRECIO_VENTA * item.cantidad
      }));

      const res = await ventaService.registrarVenta(itemsPayload);
      setVentaCompletada({
        ...res,
        numero_factura: res.numero_factura || `FAC-${String(res.id_venta).padStart(6, '0')}`,
        fecha: res.fecha || new Date().toISOString(),
        detalles: res.detalles && res.detalles.length > 0 ? res.detalles : itemsComprados,
        total: res.total || res.total_recaudado || totalCarrito
      });
      limpiarCarrito();
      return res;
    } catch (err) {
      setErrorVenta(err.message);
      throw err;
    } finally {
      setProcesando(false);
    }
  };

  return {
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
  };
}
