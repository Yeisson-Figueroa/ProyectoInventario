const { executeQuery } = require('../../config/db');

class ProductoService {
  async obtenerProductos(busqueda = '') {
    let sql = `
      SELECT p.id_producto AS id, 
             p.codigo, 
             p.nombre, 
             p.precio_compra, 
             p.precio_venta, 
             p.stock_actual, 
             p.stock_minimo, 
             p.id_categoria, 
             c.nombre_categoria AS categoria,
             CASE WHEN p.stock_actual <= p.stock_minimo THEN 1 ELSE 0 END AS alerta_stock
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
    `;
    const params = {};

    if (busqueda && busqueda.trim() !== '') {
      sql += ` WHERE LOWER(p.nombre) LIKE :busqueda OR LOWER(p.codigo) LIKE :busqueda OR LOWER(c.nombre_categoria) LIKE :busqueda`;
      params.busqueda = `%${busqueda.toLowerCase()}%`;
    }

    sql += ` ORDER BY p.nombre ASC`;

    const result = await executeQuery(sql, params);
    return result.rows || [];
  }

  async obtenerProductoPorId(id) {
    const sql = `
      SELECT p.id_producto AS id, p.codigo, p.nombre, p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.id_categoria, c.nombre_categoria AS categoria
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = :id
    `;
    const result = await executeQuery(sql, { id });
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Producto no encontrado');
    }
    return result.rows[0];
  }

  async obtenerCategorias() {
    const sql = `SELECT id_categoria, nombre_categoria, descripcion FROM categoria ORDER BY nombre_categoria ASC`;
    const result = await executeQuery(sql);
    return result.rows || [];
  }

  async generarSiguienteCodigo(nombre) {
    if (!nombre || !nombre.trim()) {
      return 'prd01';
    }

    const limpio = nombre
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const prefijo = (limpio.slice(0, 3)).padEnd(3, 'x');

    const sql = `SELECT codigo FROM producto WHERE LOWER(codigo) LIKE :patron`;
    const result = await executeQuery(sql, { patron: `${prefijo}%` });

    let maxNum = 0;
    const regex = new RegExp(`^${prefijo}(\\d+)$`, 'i');

    if (result.rows) {
      for (const row of result.rows) {
        const cod = (row.CODIGO || '').trim();
        const match = cod.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    const sigNum = (maxNum + 1).toString().padStart(2, '0');
    return `${prefijo}${sigNum}`;
  }

  async crearProducto(datosProducto) {
    let { codigo, nombre, id_categoria = 1, precio_compra, precio_venta, stock_actual = 0, stock_minimo = 5 } = datosProducto;

    if (!codigo || !codigo.trim()) {
      codigo = await this.generarSiguienteCodigo(nombre);
    } else {
      codigo = codigo.trim();
    }

    const checkSql = `SELECT id_producto FROM producto WHERE LOWER(codigo) = LOWER(:codigo)`;
    const checkRes = await executeQuery(checkSql, { codigo });
    if (checkRes.rows && checkRes.rows.length > 0) {
      throw new Error(`Ya existe un producto registrado con el código "${codigo}"`);
    }

    const sql = `
      INSERT INTO producto (codigo, nombre, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo)
      VALUES (:codigo, :nombre, :id_categoria, :precio_compra, :precio_venta, :stock_actual, :stock_minimo)
    `;

    await executeQuery(sql, {
      codigo,
      nombre,
      id_categoria: parseInt(id_categoria, 10),
      precio_compra: parseFloat(precio_compra),
      precio_venta: parseFloat(precio_venta),
      stock_actual: parseInt(stock_actual, 10),
      stock_minimo: parseInt(stock_minimo, 10)
    });

    return { mensaje: 'Producto creado exitosamente', codigo };
  }

  async actualizarProducto(id, datosProducto) {
    const { codigo, nombre, id_categoria, precio_compra, precio_venta, stock_minimo } = datosProducto;

    const sql = `
      UPDATE producto 
      SET codigo = :codigo,
          nombre = :nombre,
          id_categoria = :id_categoria,
          precio_compra = :precio_compra,
          precio_venta = :precio_venta,
          stock_minimo = :stock_minimo
      WHERE id_producto = :id
    `;

    await executeQuery(sql, {
      id,
      codigo,
      nombre,
      id_categoria: parseInt(id_categoria, 10),
      precio_compra: parseFloat(precio_compra),
      precio_venta: parseFloat(precio_venta),
      stock_minimo: parseInt(stock_minimo, 10)
    });

    return { mensaje: 'Producto actualizado exitosamente' };
  }

  async eliminarProducto(id) {
    const sql = `DELETE FROM producto WHERE id_producto = :id`;
    await executeQuery(sql, { id });
    return { mensaje: 'Producto eliminado exitosamente' };
  }
}

module.exports = new ProductoService();
