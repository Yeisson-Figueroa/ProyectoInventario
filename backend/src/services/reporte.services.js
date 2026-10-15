const { executeQuery } = require('../../config/db');

class ReporteService {
  async obtenerReporteVentas(fechaInicio, fechaFin) {
    let sqlVentas = `
      SELECT v.id_venta AS id, v.fecha_hora AS fecha, v.total_recaudado AS total, e.nombre AS vendedor_nombre
      FROM venta v
      JOIN empleado e ON v.id_empleado = e.id_empleado
      WHERE 1=1
    `;
    const params = {};

    if (fechaInicio) {
      sqlVentas += ` AND v.fecha_hora >= TO_TIMESTAMP(:fechaInicio, 'YYYY-MM-DD')`;
      params.fechaInicio = fechaInicio;
    }
    if (fechaFin) {
      sqlVentas += ` AND v.fecha_hora <= TO_TIMESTAMP(:fechaFin || ' 23:59:59', 'YYYY-MM-DD HH24:MI:SS')`;
      params.fechaFin = fechaFin;
    }

    sqlVentas += ` ORDER BY v.fecha_hora DESC`;

    const resVentas = await executeQuery(sqlVentas, params);
    const ventas = resVentas.rows || [];

    const totalRecaudado = ventas.reduce((acc, v) => acc + (parseFloat(v.TOTAL) || 0), 0);

    // Productos más vendidos en el período
    let sqlTopProd = `
      SELECT p.codigo AS producto_codigo, 
             p.nombre AS producto_nombre, 
             SUM(dv.cantidad) AS total_vendido, 
             SUM(dv.cantidad * dv.precio_unitario) AS total_ingresos
      FROM detalle_venta dv
      JOIN venta v ON dv.id_venta = v.id_venta
      JOIN producto p ON dv.id_producto = p.id_producto
      WHERE 1=1
    `;

    if (fechaInicio) {
      sqlTopProd += ` AND v.fecha_hora >= TO_TIMESTAMP(:fechaInicio, 'YYYY-MM-DD')`;
    }
    if (fechaFin) {
      sqlTopProd += ` AND v.fecha_hora <= TO_TIMESTAMP(:fechaFin || ' 23:59:59', 'YYYY-MM-DD HH24:MI:SS')`;
    }

    sqlTopProd += `
      GROUP BY p.codigo, p.nombre
      ORDER BY total_vendido DESC
    `;

    const resTop = await executeQuery(sqlTopProd, params);

    return {
      total_recaudado: totalRecaudado,
      total_ventas_count: ventas.length,
      productos_mas_vendidos: resTop.rows || [],
      ventas: ventas
    };
  }

  async obtenerProductosAgotarse() {
    const sql = `
      SELECT p.id_producto AS id, p.codigo, p.nombre, c.nombre_categoria AS categoria, p.stock_actual, p.stock_minimo, p.precio_venta
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC
    `;
    const result = await executeQuery(sql);
    return result.rows || [];
  }
}

module.exports = new ReporteService();
