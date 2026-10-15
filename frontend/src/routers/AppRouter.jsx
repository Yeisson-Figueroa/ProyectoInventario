import React, { useState } from 'react';
import { useAuth } from '../controllers/auth.controller';
import { LoginView } from '../views/LoginView';
import { ProductosView } from '../views/ProductosView';
import { EntradasView } from '../views/EntradasView';
import { VentasView } from '../views/VentasView';
import { HistorialView } from '../views/HistorialView';
import { ReportesView } from '../views/ReportesView';
import { UsuariosView } from '../views/UsuariosView';
import { Boton } from '../componentes/Boton';
import {
  Package,
  ArrowDownLeft,
  ShoppingCart,
  History,
  BarChart3,
  Users,
  LogOut,
  Store,
  Shield,
  User
} from 'lucide-react';

export function AppRouter() {
  const { usuario, logout, cargando } = useAuth();
  const [vistaActual, setVistaActual] = useState('productos');

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium">Iniciando aplicación...</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <LoginView />;
  }

  const itemsNavegacion = [
    { id: 'productos', titulo: 'Catálogo Productos', icono: Package },
    { id: 'entradas', titulo: 'Entradas Mercancía', icono: ArrowDownLeft },
    { id: 'ventas', titulo: 'Punto de Venta', icono: ShoppingCart },
    { id: 'historial', titulo: 'Historial Movimientos', icono: History },
    { id: 'reportes', titulo: 'Reportes y Métricas', icono: BarChart3 },
    ...(usuario.rol === 'ADMIN' ? [{ id: 'usuarios', titulo: 'Gestión Usuarios', icono: Users }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Barra Superior / Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Inventario & Ventas</h1>
                <p className="text-xs text-indigo-300">Conectado a Oracle Database XE</p>
              </div>
            </div>

            {/* Perfil & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-sm flex items-center gap-1.5 justify-end">
                  {usuario.rol === 'ADMIN' ? (
                    <Shield className="w-4 h-4 text-purple-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                  <span>{usuario.nombre}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{usuario.email} ({usuario.rol})</span>
              </div>

              <Boton
                onClick={logout}
                variante="outline"
                tamano="sm"
                icono={LogOut}
                className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-rose-900 hover:text-white hover:border-rose-800"
              >
                Salir
              </Boton>
            </div>
          </div>

          {/* Menú de Pestañas / Rutas */}
          <nav className="flex space-x-1 overflow-x-auto pb-1 border-t border-slate-800 pt-1">
            {itemsNavegacion.map((item) => {
              const Icono = item.icono;
              const activo = vistaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setVistaActual(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  <span>{item.titulo}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Contenido Principal según la vista actual */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vistaActual === 'productos' && <ProductosView />}
        {vistaActual === 'entradas' && <EntradasView />}
        {vistaActual === 'ventas' && <VentasView />}
        {vistaActual === 'historial' && <HistorialView />}
        {vistaActual === 'reportes' && <ReportesView />}
        {vistaActual === 'usuarios' && <UsuariosView />}
      </main>

      {/* Pie de página */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Sistema de Control de Inventario y Ventas &copy; 2026 - Conexión Oracle DB (system / XE)
      </footer>
    </div>
  );
}

export default AppRouter;
