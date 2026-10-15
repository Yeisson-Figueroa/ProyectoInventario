const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controllers');
const { autenticarToken } = require('../middlewares/auth.middleware');

router.use(autenticarToken);

router.get('/ventas', (req, res) => reporteController.obtenerReporteVentas(req, res));
router.get('/agotarse', (req, res) => reporteController.obtenerProductosAgotarse(req, res));

module.exports = router;
