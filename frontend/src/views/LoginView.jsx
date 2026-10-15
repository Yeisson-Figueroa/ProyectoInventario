import React, { useState } from 'react';
import { useAuth } from '../controllers/auth.controller';
import { Boton } from '../componentes/Boton';
import { FormularioInput } from '../componentes/FormularioInput';
import { Alerta } from '../componentes/Alerta';
import { Store, Mail, Lock } from 'lucide-react';

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Error de inicio de sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sistema de Inventario y Ventas</h1>
          <p className="text-sm text-slate-500 mt-1">Control de stock, entradas, salidas y reportes</p>
        </div>

        {error && (
          <Alerta
            tipo="danger"
            mensaje={error}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormularioInput
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@tienda.com"
            icono={Mail}
            required
          />

          <FormularioInput
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icono={Lock}
            required
          />

          <Boton
            type="submit"
            variante="primary"
            cargando={cargando}
            className="w-full py-3 text-base font-semibold mt-2 shadow-md shadow-indigo-500/20"
          >
            Iniciar Sesión
          </Boton>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-600 mb-1">Cuentas de prueba:</p>
          <p>Admin: <span className="font-mono text-slate-700">admin@tienda.com</span> / <span className="font-mono text-slate-700">admin123</span></p>
          <p>Empleado: <span className="font-mono text-slate-700">juan@tienda.com</span> / <span className="font-mono text-slate-700">user123</span></p>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
