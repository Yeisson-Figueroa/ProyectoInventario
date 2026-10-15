import { apiFetch } from './api.service';

export const authService = {
  async login(email, password) {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async registrar(datosUsuario) {
    return await apiFetch('/auth/registrar', {
      method: 'POST',
      body: JSON.stringify(datosUsuario)
    });
  },

  async listarUsuarios() {
    return await apiFetch('/auth/usuarios');
  },

  async actualizarUsuario(id, datos) {
    return await apiFetch(`/auth/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  },

  async obtenerPerfil() {
    return await apiFetch('/auth/perfil');
  }
};
