// Archivo temporal para debugging - ELIMINAR DESPUÉS DEL TESTING
// Este archivo contiene datos de prueba para verificar que la funcionalidad de días deshabilitados funciona correctamente

import { Schedule } from '../state/schedule.state';

export const DEBUG_SCHEDULES: Schedule[] = [
  // ✅ LUNES - Horarios normales (habilitados)
  {
    _id: "debug-lunes-1",
    startTime: "08",
    endTime: "09",
    maxCount: 15,
    clients: [],
    day: "Lunes"
    // No se especifica disabled = está habilitado por defecto
  },
  {
    _id: "debug-lunes-2",
    startTime: "09",
    endTime: "10",
    maxCount: 15,
    clients: [],
    day: "Lunes",
    disabled: false // Explícitamente habilitado
  },

  // ❌ MARTES - Día completamente deshabilitado
  {
    _id: "debug-martes-1",
    startTime: "08",
    endTime: "09",
    maxCount: 15,
    clients: [],
    day: "Martes",
    disabled: true // ❌ Deshabilitado
  },
  {
    _id: "debug-martes-2",
    startTime: "09",
    endTime: "10",
    maxCount: 15,
    clients: [],
    day: "Martes",
    disabled: true // ❌ Deshabilitado
  },

  // ⚠️  MIÉRCOLES - Día parcialmente deshabilitado
  {
    _id: "debug-miercoles-1",
    startTime: "08",
    endTime: "09",
    maxCount: 15,
    clients: [],
    day: "Miércoles"
    // No disabled = habilitado
  },
  {
    _id: "debug-miercoles-2",
    startTime: "09",
    endTime: "10",
    maxCount: 15,
    clients: [],
    day: "Miércoles",
    disabled: true // ❌ Este horario específico está deshabilitado
  },
  {
    _id: "debug-miercoles-3",
    startTime: "10",
    endTime: "11",
    maxCount: 15,
    clients: [],
    day: "Miércoles",
    disabled: false // ✅ Explícitamente habilitado
  },

  // ✅ JUEVES - Horarios normales
  {
    _id: "debug-jueves-1",
    startTime: "08",
    endTime: "09",
    maxCount: 15,
    clients: [],
    day: "Jueves"
  },

  // VIERNES, SÁBADO, DOMINGO - Sin horarios (para testing de días sin data)
];

// Función para activar datos de debug temporalmente
// USAR SOLO PARA TESTING - ELIMINAR DESPUÉS
export function useDebugSchedules(): boolean {
  // Cambiar a true para usar datos de debug
  // Cambiar a false para usar datos reales del backend
  return false; // ⚠️ IMPORTANTE: Asegurar que esté en false en producción
}

// Instrucciones de uso:
// 1. Cambiar useDebugSchedules() a return true
// 2. Modificar schedule.service.ts para usar estos datos
// 3. Verificar comportamiento en el frontend
// 4. Cambiar de vuelta a false cuando termines
// 5. ELIMINAR este archivo completamente antes de commit a producción
