const reporteService = require('../services/reporte.services');

class ReporteController {
  async obtenerReporteVentas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const reporte = await reporteService.obtenerReporteVentas(fecha_inicio, fecha_fin);
      return res.json(reporte);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerProductosAgotarse(req, res) {
    try {
      const productos = await reporteService.obtenerProductosAgotarse();
      return res.json(productos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReporteController();
