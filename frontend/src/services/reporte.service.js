import { apiFetch } from './api.service';

export const reporteService = {
  async obtenerReporteVentas(fechaInicio = '', fechaFin = '') {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`/reportes/ventas${queryString}`);
  },

  async obtenerProductosAgotarse() {
    return await apiFetch('/reportes/agotarse');
  }
};
