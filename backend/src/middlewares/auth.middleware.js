const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_inventario_ventas_2026';

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido o expirado' });
    }
    req.user = user;
    next();
  });
}

function esAdmin(req, res, next) {
  if (req.user && req.user.rol === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador' });
  }
}

module.exports = {
  autenticarToken,
  esAdmin
};
