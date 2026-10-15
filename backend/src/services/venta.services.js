const { getConnection, executeQuery } = require('../../config/db');
const oracledb = require('oracledb');

class VentaService {
  async registrarVenta(datosVenta, empleado) {
    const { items } = datosVenta;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('La venta debe contener al menos un producto');
    }

    const conn = await getConnection();
    try {
      let totalVenta = 0;
      const itemsProcesados = [];

      // 1. Validar disponibilidad de stock
      for (const item of items) {
        const cant = parseInt(item.cantidad, 10);
        if (isNaN(cant) || cant <= 0) {
          throw new Error(`Cantidad inválida para el producto`);
        }

        const prodId = item.id_producto || item.producto_id;
        const prodRes = await conn.execute(
          `SELECT id_producto, codigo, nombre, precio_venta, stock_actual FROM producto WHERE id_producto = :id`,
          { id: prodId }
        );

        if (!prodRes.rows || prodRes.rows.length === 0) {
          throw new Error(`El producto ID ${prodId} no existe`);
        }

        const producto = prodRes.rows[0];

        if (producto.STOCK_ACTUAL < cant) {
          throw new Error(`Stock insuficiente para "${producto.NOMBRE}". Disponible: ${producto.STOCK_ACTUAL}, Solicitado: ${cant}`);
        }

        const subtotal = producto.PRECIO_VENTA * cant;
        totalVenta += subtotal;

        itemsProcesados.push({
          producto,
          cantidad: cant,
          precio_unitario: producto.PRECIO_VENTA,
          subtotal
        });
      }

      // 2. Insertar cabecera de la VENTA usando BIND_OUT
      const idEmpleado = (empleado && (empleado.id || empleado.ID_EMPLEADO)) ? (empleado.id || empleado.ID_EMPLEADO) : 1;

      const ventaRes = await conn.execute(
        `INSERT INTO venta (total_recaudado, id_empleado)
         VALUES (:total_recaudado, :id_empleado)
         RETURN id_venta INTO :id_venta`,
        {
          total_recaudado: totalVenta,
          id_empleado: idEmpleado,
          id_venta: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }
      );

      const ventaId = Array.isArray(ventaRes.outBinds.id_venta)
        ? ventaRes.outBinds.id_venta[0]
        : ventaRes.outBinds.id_venta;

      // 3. Procesar cada detalle, reducir stock y registrar movimiento_inventario
      for (const item of itemsProcesados) {
        const { producto, cantidad, precio_unitario } = item;
        const stockAnterior = producto.STOCK_ACTUAL;
        const stockNuevo = stockAnterior - cantidad;

        // Insertar en detalle_venta
        await conn.execute(
          `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
           VALUES (:id_venta, :id_producto, :cantidad, :precio_unitario)`,
          {
            id_venta: ventaId,
            id_producto: producto.ID_PRODUCTO,
            cantidad: cantidad,
            precio_unitario: precio_unitario
          }
        );

        // Descontar stock
        await conn.execute(
          `UPDATE producto SET stock_actual = :stockNuevo WHERE id_producto = :id`,
          { stockNuevo, id: producto.ID_PRODUCTO }
        );

        // Registrar movimiento de SALIDA en movimiento_inventario con motivo VENTA
        await conn.execute(
          `INSERT INTO movimiento_inventario (tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_producto, id_empleado)
           VALUES ('SALIDA', :cantidad, :stock_anterior, :stock_nuevo, :motivo, :id_producto, :id_empleado)`,
          {
            cantidad: cantidad,
            stock_anterior: stockAnterior,
            stock_nuevo: stockNuevo,
            motivo: `VENTA (Ticket #${ventaId})`,
            id_producto: producto.ID_PRODUCTO,
            id_empleado: idEmpleado
          }
        );
      }

      return {
        mensaje: 'Venta registrada con éxito',
        id_venta: ventaId,
        numero_factura: `FAC-${String(ventaId).padStart(6, '0')}`,
        fecha: new Date(),
        total: totalVenta,
        total_recaudado: totalVenta,
        detalles: itemsProcesados.map(ip => ({
          id_producto: ip.producto.ID_PRODUCTO,
          codigo: ip.producto.CODIGO,
          nombre: ip.producto.NOMBRE,
          cantidad: ip.cantidad,
          precio_unitario: ip.precio_unitario,
          subtotal: ip.subtotal
        }))
      };
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  async obtenerVentas() {
    const sql = `
      SELECT v.id_venta AS id, 
             v.fecha_hora AS fecha, 
             v.total_recaudado AS total, 
             e.nombre AS vendedor_nombre
      FROM venta v
      JOIN empleado e ON v.id_empleado = e.id_empleado
      ORDER BY v.fecha_hora DESC
    `;
    const result = await executeQuery(sql);
    return result.rows || [];
  }

  async obtenerDetalleVenta(ventaId) {
    const cabeceraSql = `
      SELECT v.id_venta AS id, v.fecha_hora AS fecha, v.total_recaudado AS total, e.nombre AS vendedor_nombre
      FROM venta v
      JOIN empleado e ON v.id_empleado = e.id_empleado
      WHERE v.id_venta = :id
    `;
    const cabeceraRes = await executeQuery(cabeceraSql, { id: ventaId });

    if (!cabeceraRes.rows || cabeceraRes.rows.length === 0) {
      throw new Error('Venta no encontrada');
    }

    const detalleSql = `
      SELECT dv.id_detalle AS id, dv.cantidad, dv.precio_unitario, (dv.cantidad * dv.precio_unitario) AS subtotal,
             p.codigo AS producto_codigo, p.nombre AS producto_nombre
      FROM detalle_venta dv
      JOIN producto p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = :id
    `;
    const detalleRes = await executeQuery(detalleSql, { id: ventaId });

    return {
      venta: cabeceraRes.rows[0],
      detalles: detalleRes.rows || []
    };
  }
}

module.exports = new VentaService();
