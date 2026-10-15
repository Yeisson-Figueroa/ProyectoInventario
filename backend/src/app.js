const express = require('express');
const cors = require('cors');

const authRouters = require('./routers/auth.routers');
const productosRouters = require('./routers/productos.routers');
const movimientosRouters = require('./routers/movimientos.routers');
const ventasRouters = require('./routers/ventas.routers');
const reportesRouters = require('./routers/reportes.routers');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouters);
app.use('/api/productos', productosRouters);
app.use('/api/movimientos', movimientosRouters);
app.use('/api/ventas', ventasRouters);
app.use('/api/reportes', reportesRouters);

app.get('/api/health', (req, res) => {
  res.json({ estado: 'OK', sistema: 'Sistema de Inventario y Ventas', oracle: 'Conectado' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
