// Ejemplo de datos de testing para verificar días deshabilitados
// Este archivo muestra cómo deben estructurarse los datos desde el backend

import { Schedule } from '../state/schedule.state';

export const SCHEDULE_TEST_DATA = {
  // Ejemplo 1: Día completamente deshabilitado (Martes)
  // Todos los horarios del Martes tienen isEnabled: false
  tuesdayDisabledExample: [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "startTime": "08",
      "endTime": "09",
      "maxCount": 15,
      "clients": [],
      "day": "Martes",
      "isEnabled": false  // ❌ Deshabilitado
    },
    {
      "_id": "64a1b2c3d4e5f6789012345b",
      "startTime": "09",
      "endTime": "10",
      "maxCount": 15,
      "clients": [],
      "day": "Martes",
      "isEnabled": false  // ❌ Deshabilitado
    },
    {
      "_id": "64a1b2c3d4e5f6789012345c",
      "startTime": "10",
      "endTime": "11",
      "maxCount": 15,
      "clients": [],
      "day": "Martes",
      "isEnabled": false  // ❌ Deshabilitado
    }
  ],

  // Ejemplo 2: Día parcialmente deshabilitado (Miércoles)
  // Algunos horarios habilitados, otros no
  wednesdayMixedExample: [
    {
      "_id": "64a1b2c3d4e5f6789012346a",
      "startTime": "08",
      "endTime": "09",
      "maxCount": 15,
      "clients": ["user1", "user2"],
      "day": "Miércoles",
      "isEnabled": true   // ✅ Habilitado
    },
    {
      "_id": "64a1b2c3d4e5f6789012346b",
      "startTime": "09",
      "endTime": "10",
      "maxCount": 15,
      "clients": [],
      "day": "Miércoles",
      "isEnabled": false  // ❌ Deshabilitado (instructor no disponible)
    },
    {
      "_id": "64a1b2c3d4e5f6789012346c",
      "startTime": "10",
      "endTime": "11",
      "maxCount": 15,
      "clients": [],
      "day": "Miércoles",
      "isEnabled": true   // ✅ Habilitado
    }
  ],

  // Ejemplo 3: Día normal (Lunes)
  // Todos los horarios habilitados o sin especificar (por defecto habilitado)
  mondayNormalExample: [
    {
      "_id": "64a1b2c3d4e5f6789012347a",
      "startTime": "08",
      "endTime": "09",
      "maxCount": 15,
      "clients": ["user1", "user2", "user3"],
      "day": "Lunes"
      // isEnabled no especificado = habilitado por defecto
    },
    {
      "_id": "64a1b2c3d4e5f6789012347b",
      "startTime": "09",
      "endTime": "10",
      "maxCount": 15,
      "clients": [],
      "day": "Lunes",
      "isEnabled": true   // ✅ Explícitamente habilitado
    }
  ],

  // Ejemplo 4: Día sin horarios (Domingo)
  // No se envían horarios para este día
  sundayNoSchedulesExample: []
};

// Función para simular deshabilitar un día completo
export function disableDay(schedules: Schedule[], dayName: string): Schedule[] {
  return schedules.map(schedule => {
    if (schedule.day === dayName) {
      return { ...schedule, isEnabled: false };
    }
    return schedule;
  });
}

// Función para simular habilitar un día completo
export function enableDay(schedules: Schedule[], dayName: string): Schedule[] {
  return schedules.map(schedule => {
    if (schedule.day === dayName) {
      return { ...schedule, isEnabled: true };
    }
    return schedule;
  });
}

// Función para deshabilitar un horario específico
export function disableSchedule(schedules: Schedule[], scheduleId: string): Schedule[] {
  return schedules.map(schedule => {
    if (schedule._id === scheduleId) {
      return { ...schedule, isEnabled: false };
    }
    return schedule;
  });
}

// Ejemplo de uso para testing:
// 1. Copiar uno de los ejemplos arriba
// 2. Modificar tu servicio ScheduleService temporalmente para retornar estos datos
// 3. Verificar que la UI responde correctamente

/*
PARA TESTING RÁPIDO:

1. En tu schedule.service.ts, modifica temporalmente el método getSchedules():

getSchedules(): Observable<Schedule[]> {
  // Comentar la llamada real al API
  // return this.http.get<ScheduleResponse>(this.apiUrl).pipe(...)
  
  // Usar datos de prueba
  import { SCHEDULE_TEST_DATA } from './schedule-test-data';
  
  const testData = [
    ...SCHEDULE_TEST_DATA.mondayNormalExample,
    ...SCHEDULE_TEST_DATA.tuesdayDisabledExample,    // Martes deshabilitado
    ...SCHEDULE_TEST_DATA.wednesdayMixedExample
  ];
  
  return of(testData);
}

2. Verificar que:
   - Martes aparece como "Deshabilitado" en el selector
   - No se puede hacer click en los días deshabilitados
   - Los horarios deshabilitados muestran "NO DISPONIBLE"
   - Aparecen los mensajes de advertencia correctos

3. Restaurar el código original cuando termines el testing
*/
