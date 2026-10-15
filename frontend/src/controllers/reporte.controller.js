import { useState, useCallback } from 'react';
import { reporteService } from '../services/reporte.service';

export function useReporteController() {
  const [reporte, setReporte] = useState(null);
  const [productosAgotarse, setProductosAgotarse] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarReporte = useCallback(async (fInicio = fechaInicio, fFin = fechaFin) => {
    setCargando(true);
    setError(null);
    try {
      const dataReporte = await reporteService.obtenerReporteVentas(fInicio, fFin);
      const dataAgotarse = await reporteService.obtenerProductosAgotarse();
      setReporte(dataReporte);
      setProductosAgotarse(dataAgotarse);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  return {
    reporte,
    productosAgotarse,
    cargando,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargarReporte
  };
}
