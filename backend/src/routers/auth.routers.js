const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const { autenticarToken, esAdmin } = require('../middlewares/auth.middleware');

router.post('/login', (req, res) => authController.login(req, res));
router.post('/registrar', autenticarToken, esAdmin, (req, res) => authController.registrar(req, res));
router.get('/usuarios', autenticarToken, esAdmin, (req, res) => authController.listarUsuarios(req, res));
router.put('/usuarios/:id', autenticarToken, esAdmin, (req, res) => authController.actualizarUsuario(req, res));
router.patch('/usuarios/:id', autenticarToken, esAdmin, (req, res) => authController.actualizarUsuario(req, res));
router.get('/perfil', autenticarToken, (req, res) => authController.perfil(req, res));

module.exports = router;
