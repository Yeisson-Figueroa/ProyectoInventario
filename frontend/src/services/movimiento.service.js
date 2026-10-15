import { apiFetch } from './api.service';

export const movimientoService = {
  async registrarEntrada(datosEntrada) {
    return await apiFetch('/movimientos/entrada', {
      method: 'POST',
      body: JSON.stringify(datosEntrada)
    });
  },

  async registrarSalida(datosSalida) {
    return await apiFetch('/movimientos/salida', {
      method: 'POST',
      body: JSON.stringify(datosSalida)
    });
  },

  async obtenerHistorial(productoId = null) {
    const query = productoId ? `?producto_id=${productoId}` : '';
    return await apiFetch(`/movimientos/historial${query}`);
  }
};
