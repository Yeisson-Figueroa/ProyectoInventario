import { apiFetch } from './api.service';

export const ventaService = {
  async registrarVenta(items) {
    return await apiFetch('/ventas', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },

  async obtenerVentas() {
    return await apiFetch('/ventas');
  },

  async obtenerDetalleVenta(id) {
    return await apiFetch(`/ventas/${id}`);
  }
};
