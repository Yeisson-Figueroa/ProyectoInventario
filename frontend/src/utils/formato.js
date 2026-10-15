import * as XLSX from 'xlsx';

/**
 * Formatea un valor numérico a moneda Quetzales (GTQ)
 * @param {number|string} valor
 * @returns {string} Ejemplo: Q 25.50
 */
export function formatearQuetzales(valor) {
  const num = parseFloat(valor);
  if (isNaN(num)) return 'Q 0.00';
  return `Q ${num.toFixed(2)}`;
}

/**
 * Genera y descarga un archivo Excel (.xlsx) a partir de un arreglo de objetos o múltiples hojas
 * @param {string} nombreArchivo Ejemplo: 'historial_movimientos.xlsx'
 * @param {Array<Object>|Object} data Si es Array se crea una sola hoja 'Datos'. Si es Object con clave->array crea múltiples hojas.
 */
export function exportarAExcel(nombreArchivo, data) {
  const wb = XLSX.utils.book_new();

  if (Array.isArray(data)) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  } else if (typeof data === 'object') {
    for (const [nombreHoja, filas] of Object.entries(data)) {
      const ws = XLSX.utils.json_to_sheet(Array.isArray(filas) ? filas : []);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja.slice(0, 31)); // Límite de 31 caracteres por hoja en Excel
    }
  }

  // Generar y descargar archivo binario
  XLSX.writeFile(wb, nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`);
}

/**
 * Generador inteligente de código de producto incremental
 * Ejemplo: 'Azúcar Blanca' -> 'azu01', si existe 'azu01' -> 'azu02'
 * @param {string} nombre
 * @param {Array<Object>} productosExistentes
 * @returns {string}
 */
export function generarCodigoIncremental(nombre, productosExistentes = []) {
  if (!nombre || !nombre.trim()) return '';

  // 1. Limpiar nombre (sin tildes, solo letras y números)
  const limpio = nombre
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (!limpio) return 'prd01';

  // 2. Tomar las primeras 3 letras del nombre (o rellenar si tiene menos)
  const prefijo = (limpio.slice(0, 3)).padEnd(3, 'x');

  // 3. Buscar productos existentes cuyo código inicie con ese prefijo y termine en número
  const regex = new RegExp(`^${prefijo}(\\d+)$`, 'i');
  let maxNumero = 0;

  for (const p of productosExistentes) {
    const cod = (p.CODIGO || p.codigo || '').trim().toLowerCase();
    const match = cod.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNumero) {
        maxNumero = num;
      }
    }
  }

  const siguienteNumero = maxNumero + 1;
  const numPadded = siguienteNumero.toString().padStart(2, '0');
  return `${prefijo}${numPadded}`;
}
