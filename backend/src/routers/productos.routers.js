const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controllers');
const { autenticarToken } = require('../middlewares/auth.middleware');

router.use(autenticarToken);

router.get('/', (req, res) => productoController.obtenerProductos(req, res));
router.get('/categorias', (req, res) => productoController.obtenerCategorias(req, res));
router.get('/generar-codigo', (req, res) => productoController.generarCodigo(req, res));
router.get('/:id', (req, res) => productoController.obtenerProductoPorId(req, res));
router.post('/', (req, res) => productoController.crearProducto(req, res));
router.put('/:id', (req, res) => productoController.actualizarProducto(req, res));
router.delete('/:id', (req, res) => productoController.eliminarProducto(req, res));

module.exports = router;
