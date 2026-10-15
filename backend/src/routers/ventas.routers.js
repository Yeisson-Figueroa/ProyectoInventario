const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controllers');
const { autenticarToken } = require('../middlewares/auth.middleware');

router.use(autenticarToken);

router.post('/', (req, res) => ventaController.registrarVenta(req, res));
router.get('/', (req, res) => ventaController.obtenerVentas(req, res));
router.get('/:id', (req, res) => ventaController.obtenerDetalleVenta(req, res));

module.exports = router;
