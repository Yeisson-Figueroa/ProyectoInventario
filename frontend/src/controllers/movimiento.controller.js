import { useState, useCallback } from 'react';
import { movimientoService } from '../services/movimiento.service';

export function useMovimientoController() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarHistorial = useCallback(async (productoId = null) => {
    setCargando(true);
    setError(null);
    try {
      const data = await movimientoService.obtenerHistorial(productoId);
      setHistorial(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  const registrarEntrada = async (datosEntrada) => {
    const res = await movimientoService.registrarEntrada(datosEntrada);
    return res;
  };

  const registrarSalida = async (datosSalida) => {
    const res = await movimientoService.registrarSalida(datosSalida);
    return res;
  };

  return {
    historial,
    cargando,
    error,
    cargarHistorial,
    registrarEntrada,
    registrarSalida
  };
}
