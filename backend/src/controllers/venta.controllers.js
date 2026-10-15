const ventaService = require('../services/venta.services');

class VentaController {
  async registrarVenta(req, res) {
    try {
      const resultado = await ventaService.registrarVenta(req.body, req.user);
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async obtenerVentas(req, res) {
    try {
      const ventas = await ventaService.obtenerVentas();
      return res.json(ventas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerDetalleVenta(req, res) {
    try {
      const { id } = req.params;
      const detalle = await ventaService.obtenerDetalleVenta(id);
      return res.json(detalle);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new VentaController();
