import React, { useState, useEffect } from 'react';
import { useAuth } from '../controllers/auth.controller';
import { authService } from '../services/auth.service';
import { Boton } from '../componentes/Boton';
import { Tabla } from '../componentes/Tabla';
import { Modal } from '../componentes/Modal';
import { FormularioInput } from '../componentes/FormularioInput';
import { Alerta } from '../componentes/Alerta';
import { 
  UserPlus, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Lock, 
  User, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Briefcase 
} from 'lucide-react';

export function UsuariosView() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const [formDataCrear, setFormDataCrear] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'USER',
    estado: 'ACTIVO'
  });

  const [formDataEditar, setFormDataEditar] = useState({
    nombre: '',
    correo: '',
    rol: 'USER',
    estado: 'ACTIVO'
  });

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await authService.listarUsuarios();
      setUsuarios(data);
    } catch (e) {
      console.error('Error cargando usuarios:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioActual?.rol === 'ADMIN') {
      cargarUsuarios();
    }
  }, [usuarioActual]);

  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');
    setMensajeExito('');
    setGuardando(true);
    try {
      await authService.registrar(formDataCrear);
      setMensajeExito(`Cuenta de empleado para "${formDataCrear.nombre}" creada con éxito.`);
      setModalCrearAbierto(false);
      setFormDataCrear({ nombre: '', email: '', password: '', rol: 'USER', estado: 'ACTIVO' });
      await cargarUsuarios();
    } catch (err) {
      setErrorForm(err.message || 'Error al crear usuario');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEditar = (u) => {
    setUsuarioEditar(u);
    setFormDataEditar({
      nombre: u.NOMBRE || '',
      correo: u.CORREO || u.correo || u.EMAIL || u.email || '',
      rol: u.ROL || 'USER',
      estado: u.ESTADO || 'ACTIVO'
    });
    setErrorForm('');
    setModalEditarAbierto(true);
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioEditar) return;
    setErrorForm('');
    setGuardando(true);
    try {
      await authService.actualizarUsuario(usuarioEditar.ID, formDataEditar);
      setMensajeExito(`Usuario "${formDataEditar.nombre}" actualizado correctamente.`);
      setModalEditarAbierto(false);
      await cargarUsuarios();
    } catch (err) {
      setErrorForm(err.message || 'Error al actualizar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (u) => {
    const nuevoEstado = (u.ESTADO === 'ACTIVO') ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'dar de ALTA' : 'dar de BAJA';
    
    if (!window.confirm(`¿Estás seguro de que deseas ${accion} al usuario "${u.NOMBRE}"?`)) {
      return;
    }

    try {
      await authService.actualizarUsuario(u.ID, { estado: nuevoEstado });
      setMensajeExito(`El usuario "${u.NOMBRE}" ha sido ${nuevoEstado === 'ACTIVO' ? 'dado de ALTA' : 'dado de BAJA'} exitosamente.`);
      await cargarUsuarios();
    } catch (err) {
      alert(err.message || 'Error al cambiar estado del usuario');
    }
  };

  if (usuarioActual?.rol !== 'ADMIN') {
    return (
      <Alerta
        tipo="danger"
        titulo="Acceso Restringido"
        mensaje="Sólo los usuarios con rol Administrador pueden gestionar roles y cuentas de empleados."
      />
    );
  }

  const columnas = [
    { titulo: 'ID' },
    { titulo: 'Nombre Completo' },
    { titulo: 'Correo Electrónico' },
    { titulo: 'Rol de Sistema' },
    { titulo: 'Estado (Alta / Baja)' },
    { titulo: 'Acciones', className: 'text-right' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios y Roles</h2>
          <p className="text-sm text-slate-500">Editar roles del personal y controlar altas y bajas de cuentas</p>
        </div>
        <Boton
          onClick={() => {
            setErrorForm('');
            setModalCrearAbierto(true);
          }}
          variante="primary"
          icono={UserPlus}
        >
          Crear Nuevo Usuario
        </Boton>
      </div>

      {mensajeExito && <Alerta tipo="success" mensaje={mensajeExito} />}

      <Tabla
        columnas={columnas}
        datos={usuarios}
        cargando={cargando}
        mensajeVacio="No existen usuarios registrados"
        renderFila={(u) => {
          const esActivo = (u.ESTADO || 'ACTIVO').toUpperCase() === 'ACTIVO';
          const correo = u.CORREO || u.correo || u.EMAIL || u.email || 'Sin correo';

          return (
            <tr key={u.ID} className={`hover:bg-slate-50 transition-colors ${!esActivo ? 'bg-slate-50/70 opacity-75' : ''}`}>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">#{u.ID}</td>
              <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                {esActivo ? (
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <UserX className="w-4 h-4 text-rose-500" />
                )}
                <span>{u.NOMBRE}</span>
              </td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs">{correo}</td>
              <td className="px-4 py-3">
                {u.ROL === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    <Shield className="w-3 h-3" /> ADMIN
                  </span>
                ) : u.ROL === 'VENDEDOR' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Briefcase className="w-3 h-3" /> VENDEDOR
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <User className="w-3 h-3" /> {u.ROL || 'USER'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {esActivo ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> ACTIVO (Alta)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3 h-3" /> INACTIVO (Baja)
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => abrirModalEditar(u)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200"
                  title="Editar Rol o Datos"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Rol</span>
                </button>

                <button
                  onClick={() => handleToggleEstado(u)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
                    esActivo
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                  title={esActivo ? 'Dar de Baja este usuario' : 'Dar de Alta este usuario'}
                >
                  {esActivo ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Dar de Baja</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Dar de Alta</span>
                    </>
                  )}
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Modal para Crear Usuario */}
      <Modal
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        titulo="Registrar Nuevo Usuario / Empleado"
      >
        {errorForm && <Alerta tipo="danger" mensaje={errorForm} className="mb-4" />}

        <form onSubmit={handleCrearSubmit} className="space-y-4">
          <FormularioInput
            label="Nombre Completo *"
            name="nombre"
            value={formDataCrear.nombre}
            onChange={(e) => setFormDataCrear({ ...formDataCrear, nombre: e.target.value })}
            placeholder="Ej. María López"
            required
            icono={User}
          />

          <FormularioInput
            label="Correo Electrónico *"
            type="email"
            name="email"
            value={formDataCrear.email}
            onChange={(e) => setFormDataCrear({ ...formDataCrear, email: e.target.value })}
            placeholder="maria@tienda.com"
            required
            icono={Mail}
          />

          <FormularioInput
            label="Contraseña *"
            type="password"
            name="password"
            value={formDataCrear.password}
            onChange={(e) => setFormDataCrear({ ...formDataCrear, password: e.target.value })}
            placeholder="••••••••"
            required
            icono={Lock}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Rol del Usuario *
            </label>
            <select
              value={formDataCrear.rol}
              onChange={(e) => setFormDataCrear({ ...formDataCrear, rol: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="USER">USER (Empleado estándar - Ventas / Entradas)</option>
              <option value="VENDEDOR">VENDEDOR (Operador de Punto de Venta)</option>
              <option value="ADMIN">ADMIN (Administrador - Acceso Total y Gestión)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Estado Inicial *
            </label>
            <select
              value={formDataCrear.estado}
              onChange={(e) => setFormDataCrear({ ...formDataCrear, estado: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="ACTIVO">ACTIVO (Cuenta dada de alta)</option>
              <option value="INACTIVO">INACTIVO (Cuenta dada de baja)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Boton variante="secondary" onClick={() => setModalCrearAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="primary" type="submit" cargando={guardando}>
              Crear Cuenta
            </Boton>
          </div>
        </form>
      </Modal>

      {/* Modal para Editar Usuario y Roles */}
      <Modal
        abierto={modalEditarAbierto}
        onCerrar={() => setModalEditarAbierto(false)}
        titulo={`Editar Usuario / Rol: ${usuarioEditar?.NOMBRE || ''}`}
      >
        {errorForm && <Alerta tipo="danger" mensaje={errorForm} className="mb-4" />}

        <form onSubmit={handleEditarSubmit} className="space-y-4">
          <FormularioInput
            label="Nombre Completo *"
            name="nombre"
            value={formDataEditar.nombre}
            onChange={(e) => setFormDataEditar({ ...formDataEditar, nombre: e.target.value })}
            required
            icono={User}
          />

          <FormularioInput
            label="Correo Electrónico *"
            type="email"
            name="correo"
            value={formDataEditar.correo}
            onChange={(e) => setFormDataEditar({ ...formDataEditar, correo: e.target.value })}
            required
            icono={Mail}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Asignar Rol de Sistema *
            </label>
            <select
              value={formDataEditar.rol}
              onChange={(e) => setFormDataEditar({ ...formDataEditar, rol: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="USER">USER (Empleado estándar)</option>
              <option value="VENDEDOR">VENDEDOR (Operador Punto de Venta)</option>
              <option value="ADMIN">ADMIN (Administrador con privilegios totales)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Estado de la Cuenta (Alta / Baja) *
            </label>
            <select
              value={formDataEditar.estado}
              onChange={(e) => setFormDataEditar({ ...formDataEditar, estado: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="ACTIVO">ACTIVO (Dar de Alta / Permitir Acceso)</option>
              <option value="INACTIVO">INACTIVO (Dar de Baja / Bloquear Acceso)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Boton variante="secondary" onClick={() => setModalEditarAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="primary" type="submit" cargando={guardando}>
              Guardar Cambios
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsuariosView;
