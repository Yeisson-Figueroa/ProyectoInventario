const oracledb = require('oracledb');

async function testConn() {
  let connection;
  try {
    console.log('Intentando conectar a Oracle DB...');
    connection = await oracledb.getConnection({
      user: 'system',
      password: '2003',
      connectString: 'localhost:1521/xe'
    });
    console.log('¡Conexión a Oracle DB Exitosa!');
    const result = await connection.execute(`SELECT sysdate FROM dual`);
    console.log('Fecha DB:', result.rows);
  } catch (err) {
    console.error('Error al conectar:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

testConn();
