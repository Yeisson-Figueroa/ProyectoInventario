const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimiento.controllers');
const { autenticarToken } = require('../middlewares/auth.middleware');

router.use(autenticarToken);

router.post('/entrada', (req, res) => movimientoController.registrarEntrada(req, res));
router.post('/salida', (req, res) => movimientoController.registrarSalida(req, res));
router.get('/historial', (req, res) => movimientoController.obtenerHistorial(req, res));

module.exports = router;
