import { apiFetch } from './api.service';

export const productoService = {
  async obtenerProductos(busqueda = '') {
    const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
    return await apiFetch(`/productos${query}`);
  },

  async obtenerCategorias() {
    return await apiFetch('/productos/categorias');
  },

  async obtenerProductoPorId(id) {
    return await apiFetch(`/productos/${id}`);
  },

  async crearProducto(datosProducto) {
    return await apiFetch('/productos', {
      method: 'POST',
      body: JSON.stringify(datosProducto)
    });
  },

  async actualizarProducto(id, datosProducto) {
    return await apiFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosProducto)
    });
  },

  async eliminarProducto(id) {
    return await apiFetch(`/productos/${id}`, {
      method: 'DELETE'
    });
  },

  async generarCodigo(nombre) {
    const query = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';
    return await apiFetch(`/productos/generar-codigo${query}`);
  }
};
