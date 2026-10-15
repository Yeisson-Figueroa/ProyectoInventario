const { executeQuery } = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_inventario_ventas_2026';

class AuthService {
  async login(correo, contrasena) {
    const sql = `SELECT id_empleado, nombre, correo, contrasena, rol, NVL(estado, 'ACTIVO') AS estado FROM empleado WHERE correo = :correo`;
    const result = await executeQuery(sql, { correo });

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Empleado no encontrado con este correo');
    }

    const emp = result.rows[0];

    if (emp.ESTADO === 'INACTIVO') {
      throw new Error('Esta cuenta ha sido dada de baja (inactiva). Contacte al Administrador.');
    }

    const isMatch = await bcrypt.compare(contrasena, emp.CONTRASENA);
    if (!isMatch) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      {
        id: emp.ID_EMPLEADO,
        nombre: emp.NOMBRE,
        correo: emp.CORREO,
        rol: emp.ROL,
        estado: emp.ESTADO
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      usuario: {
        id: emp.ID_EMPLEADO,
        nombre: emp.NOMBRE,
        correo: emp.CORREO,
        rol: emp.ROL,
        estado: emp.ESTADO
      }
    };
  }

  async registrarUsuario(datosEmpleado) {
    const { nombre, correo, contrasena, rol = 'USER', estado = 'ACTIVO' } = datosEmpleado;

    const checkSql = `SELECT id_empleado FROM empleado WHERE correo = :correo`;
    const checkResult = await executeQuery(checkSql, { correo });
    if (checkResult.rows && checkResult.rows.length > 0) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const insertSql = `
      INSERT INTO empleado (nombre, correo, contrasena, rol, estado)
      VALUES (:nombre, :correo, :contrasena, :rol, :estado)
    `;

    await executeQuery(insertSql, {
      nombre,
      correo,
      contrasena: hashedPassword,
      rol: rol.toUpperCase(),
      estado: estado.toUpperCase()
    });

    return { mensaje: 'Empleado creado exitosamente' };
  }

  async listarUsuarios() {
    const sql = `SELECT id_empleado AS id, nombre, correo, rol, NVL(estado, 'ACTIVO') AS estado FROM empleado ORDER BY id_empleado DESC`;
    const result = await executeQuery(sql);
    return result.rows || [];
  }

  async actualizarUsuario(id, datos) {
    const { rol, estado, nombre, correo } = datos;

    const checkSql = `SELECT id_empleado, rol, estado FROM empleado WHERE id_empleado = :id`;
    const checkRes = await executeQuery(checkSql, { id });
    if (!checkRes.rows || checkRes.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const setClauses = [];
    const params = { id };

    if (rol !== undefined && rol.trim()) {
      setClauses.push('rol = :rol');
      params.rol = rol.trim().toUpperCase();
    }
    if (estado !== undefined && estado.trim()) {
      setClauses.push('estado = :estado');
      params.estado = estado.trim().toUpperCase();
    }
    if (nombre !== undefined && nombre.trim()) {
      setClauses.push('nombre = :nombre');
      params.nombre = nombre.trim();
    }
    if (correo !== undefined && correo.trim()) {
      setClauses.push('correo = :correo');
      params.correo = correo.trim();
    }

    if (setClauses.length === 0) {
      throw new Error('No se enviaron datos para actualizar');
    }

    const updateSql = `UPDATE empleado SET ${setClauses.join(', ')} WHERE id_empleado = :id`;
    await executeQuery(updateSql, params);

    return { mensaje: 'Usuario actualizado correctamente' };
  }
}

module.exports = new AuthService();
