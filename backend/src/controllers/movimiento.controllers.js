const movimientoService = require('../services/movimiento.services');

class MovimientoController {
  async registrarEntrada(req, res) {
    try {
      const resultado = await movimientoService.registrarEntrada(req.body, req.user);
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registrarSalida(req, res) {
    try {
      const resultado = await movimientoService.registrarSalida(req.body, req.user);
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async obtenerHistorial(req, res) {
    try {
      const { producto_id } = req.query;
      const historial = await movimientoService.obtenerHistorialMovimientos(producto_id);
      return res.json(historial);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MovimientoController();
