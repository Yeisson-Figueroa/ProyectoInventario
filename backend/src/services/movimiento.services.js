const { executeQuery, getConnection } = require('../../config/db');

class MovimientoService {
  async registrarEntrada(datosEntrada, empleado) {
    const prodId = datosEntrada.id_producto || datosEntrada.producto_id;
    const { cantidad, motivo } = datosEntrada;
    const cantNum = parseInt(cantidad, 10);
    const motivoFinal = (motivo && motivo.trim()) ? motivo.trim() : 'Reabastecimiento de Proveedor';

    if (!prodId) {
      throw new Error('Debe especificar el ID del producto');
    }

    if (isNaN(cantNum) || cantNum <= 0) {
      throw new Error('La cantidad a ingresar debe ser un número entero mayor a 0');
    }

    const conn = await getConnection();
    try {
      const prodRes = await conn.execute(
        `SELECT id_producto, codigo, nombre, stock_actual FROM producto WHERE id_producto = :id`,
        { id: prodId }
      );

      if (!prodRes.rows || prodRes.rows.length === 0) {
        throw new Error('Producto no encontrado en el sistema');
      }

      const producto = prodRes.rows[0];
      const stockAnterior = producto.STOCK_ACTUAL;
      const stockNuevo = stockAnterior + cantNum;

      // 1. Aumentar el stock del producto automáticamente
      await conn.execute(
        `UPDATE producto SET stock_actual = :stockNuevo WHERE id_producto = :id`,
        { stockNuevo, id: prodId }
      );

      // 2. Registrar el movimiento con stock_anterior, stock_nuevo y motivo
      const idEmp = (empleado && (empleado.id || empleado.ID_EMPLEADO)) ? (empleado.id || empleado.ID_EMPLEADO) : 1;

      await conn.execute(
        `INSERT INTO movimiento_inventario (tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_producto, id_empleado)
         VALUES ('ENTRADA', :cantidad, :stock_anterior, :stock_nuevo, :motivo, :id_producto, :id_empleado)`,
        {
          cantidad: cantNum,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: motivoFinal,
          id_producto: prodId,
          id_empleado: idEmp
        }
      );

      return {
        mensaje: 'Entrada registrada exitosamente',
        motivo: motivoFinal,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo
      };
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  async registrarSalida(datosSalida, empleado) {
    const prodId = datosSalida.id_producto || datosSalida.producto_id;
    const { cantidad, motivo } = datosSalida;
    const cantNum = parseInt(cantidad, 10);
    const motivoFinal = (motivo && motivo.trim()) ? motivo.trim() : 'DESCARTE - Producto vencido';

    if (!prodId) {
      throw new Error('Debe especificar el ID del producto');
    }

    if (isNaN(cantNum) || cantNum <= 0) {
      throw new Error('La cantidad a retirar debe ser un número entero mayor a 0');
    }

    const conn = await getConnection();
    try {
      const prodRes = await conn.execute(
        `SELECT id_producto, codigo, nombre, stock_actual FROM producto WHERE id_producto = :id`,
        { id: prodId }
      );

      if (!prodRes.rows || prodRes.rows.length === 0) {
        throw new Error('Producto no encontrado en el sistema');
      }

      const producto = prodRes.rows[0];
      const stockAnterior = producto.STOCK_ACTUAL;

      if (stockAnterior < cantNum) {
        throw new Error(`Stock insuficiente para descarte. Disponible: ${stockAnterior}, Solicitado: ${cantNum}`);
      }

      const stockNuevo = stockAnterior - cantNum;

      // 1. Descontar el stock
      await conn.execute(
        `UPDATE producto SET stock_actual = :stockNuevo WHERE id_producto = :id`,
        { stockNuevo, id: prodId }
      );

      // 2. Registrar el movimiento de salida con motivo
      const idEmp = (empleado && (empleado.id || empleado.ID_EMPLEADO)) ? (empleado.id || empleado.ID_EMPLEADO) : 1;

      await conn.execute(
        `INSERT INTO movimiento_inventario (tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_producto, id_empleado)
         VALUES ('SALIDA', :cantidad, :stock_anterior, :stock_nuevo, :motivo, :id_producto, :id_empleado)`,
        {
          cantidad: cantNum,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: motivoFinal,
          id_producto: prodId,
          id_empleado: idEmp
        }
      );

      return {
        mensaje: 'Salida / Descarte registrado exitosamente',
        motivo: motivoFinal,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo
      };
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  async obtenerHistorialMovimientos(id_producto = null) {
    let sql = `
      SELECT m.id_movimiento AS id,
             m.tipo_movimiento AS tipo,
             m.tipo_movimiento AS tipo_movimiento,
             m.cantidad,
             m.stock_anterior,
             m.stock_nuevo,
             NVL(m.motivo, 'Sin motivo') AS motivo,
             m.fecha_hora AS fecha,
             p.id_producto,
             p.codigo AS producto_codigo,
             p.nombre AS producto_nombre,
             e.nombre AS responsable_nombre
      FROM movimiento_inventario m
      JOIN producto p ON m.id_producto = p.id_producto
      JOIN empleado e ON m.id_empleado = e.id_empleado
    `;
    const params = {};

    if (id_producto) {
      sql += ` WHERE m.id_producto = :id_producto`;
      params.id_producto = id_producto;
    }

    sql += ` ORDER BY m.fecha_hora DESC`;

    const result = await executeQuery(sql, params);
    return result.rows || [];
  }
}

module.exports = new MovimientoService();
