const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || '2003',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xe'
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Error al conectar a Oracle Database:', err);
    throw err;
  }
}

async function executeQuery(sql, params = {}, options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, params, options);
    return result;
  } catch (err) {
    console.error('Error ejecutando consulta SQL:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
}

module.exports = {
  getConnection,
  executeQuery
};
