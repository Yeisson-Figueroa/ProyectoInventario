require('dotenv').config();
const app = require('./src/app');
const initDB = require('./init-db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Inicializar base de datos Oracle
    await initDB();

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(` Servidor Backend corriendo en puerto: ${PORT}`);
      console.log(` Endpoint API: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor backend:', error);
  }
}

startServer();
