const authService = require('../services/auth.services');

class AuthController {
  async login(req, res) {
    try {
      const correo = req.body.correo || req.body.email;
      const contrasena = req.body.contrasena || req.body.password;

      if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      const resultado = await authService.login(correo, contrasena);
      return res.json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registrar(req, res) {
    try {
      if (req.user && req.user.rol !== 'ADMIN') {
        return res.status(403).json({ error: 'Sólo el Administrador puede registrar nuevos empleados' });
      }
      const nombre = req.body.nombre;
      const correo = req.body.correo || req.body.email;
      const contrasena = req.body.contrasena || req.body.password;
      const rol = req.body.rol;

      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
      }

      const resultado = await authService.registrarUsuario({ nombre, correo, contrasena, rol });
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listarUsuarios(req, res) {
    try {
      const usuarios = await authService.listarUsuarios();
      return res.json(usuarios);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async perfil(req, res) {
    return res.json({ usuario: req.user });
  }

  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { rol, estado, nombre, correo } = req.body;
      const resultado = await authService.actualizarUsuario(id, { rol, estado, nombre, correo });
      return res.json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
