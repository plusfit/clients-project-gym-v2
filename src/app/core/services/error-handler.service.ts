import { Injectable } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  constructor(private toastService: ToastService) {}

  /**
   * Traduce y maneja errores de Firebase y otros servicios
   */
  handleError(error: unknown, showToast = true): string {
    const translatedMessage = this.translateError(error);
    
    if (showToast) {
      this.toastService.showError(translatedMessage);
    }
    
    return translatedMessage;
  }

  /**
   * Traduce errores al español
   */
  private translateError(error: unknown): string {
    let errorMessage = '';

    // Extraer el mensaje del error
    if (error && typeof error === 'object' && 'code' in error) {
      errorMessage = (error as { code: string }).code;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'unknown-error';
    }

    return this.translateFirebaseError(errorMessage);
  }

  private translateFirebaseError(errorMessage: string): string {
    const firebaseErrors: { [key: string]: string } = {
      // Auth errors
      'auth/email-already-in-use': 'El email ya está registrado. Utilice otro email o inicie sesión.',
      'auth/weak-password': 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
      'auth/invalid-email': 'El formato del email no es válido.',
      'auth/user-not-found': 'No existe una cuenta con este email.',
      'auth/wrong-password': 'La contraseña es incorrecta.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intente más tarde.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
      'auth/operation-not-allowed': 'Esta operación no está permitida.',
      'auth/invalid-credential': 'Las credenciales proporcionadas no son válidas.',
      'auth/user-token-expired': 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      'auth/network-request-failed': 'Error de conexión. Verifique su internet.',
      'auth/requires-recent-login': 'Por seguridad, debe iniciar sesión nuevamente para realizar esta acción.',
      'auth/popup-closed-by-user': 'La ventana de autenticación fue cerrada. Intente de nuevo.',
      'auth/cancelled-popup-request': 'Solo puede tener una ventana de autenticación abierta a la vez.',
      'auth/popup-blocked': 'La ventana emergente fue bloqueada por el navegador. Permita ventanas emergentes.',
      'auth/invalid-api-key': 'Clave API inválida. Contacte al administrador.',
      'auth/app-deleted': 'La aplicación ha sido eliminada. Contacte al administrador.',
      'auth/app-not-authorized': 'La aplicación no está autorizada. Contacte al administrador.',
      'auth/argument-error': 'Argumentos inválidos proporcionados.',
      'auth/invalid-user-token': 'Token de usuario inválido. Inicie sesión nuevamente.',
      'auth/timeout': 'La operación tardó demasiado. Intente de nuevo.',

      // Firestore errors
      'permission-denied': 'No tiene permisos para acceder a este recurso.',
      'not-found': 'El documento solicitado no existe.',
      'already-exists': 'El documento ya existe.',
      'failed-precondition': 'La operación no se puede completar en el estado actual.',
      'out-of-range': 'El valor está fuera del rango permitido.',
      'unauthenticated': 'Debe iniciar sesión para acceder a este recurso.',
      'resource-exhausted': 'Se ha excedido el límite de recursos. Intente más tarde.',
      'cancelled': 'La operación fue cancelada.',
      'data-loss': 'Se ha perdido información. Contacte al administrador.',
      'unknown': 'Ha ocurrido un error desconocido. Intente de nuevo.',
      'invalid-argument': 'Los datos proporcionados no son válidos.',
      'deadline-exceeded': 'La operación tardó demasiado. Intente de nuevo.',
      'unavailable': 'El servicio no está disponible temporalmente.',

      // Storage errors
      'storage/unauthorized': 'No tiene permisos para acceder a este archivo.',
      'storage/canceled': 'La subida del archivo fue cancelada.',
      'storage/unknown': 'Error desconocido al subir el archivo.',
      'storage/object-not-found': 'El archivo no fue encontrado.',
      'storage/bucket-not-found': 'El almacenamiento no está disponible.',
      'storage/project-not-found': 'Proyecto no encontrado.',
      'storage/quota-exceeded': 'Se ha excedido el límite de almacenamiento.',
      'storage/unauthenticated': 'Debe iniciar sesión para subir archivos.',
      'storage/retry-limit-exceeded': 'Demasiados intentos. Intente más tarde.',
      'storage/invalid-checksum': 'El archivo está corrupto. Intente de nuevo.',
      'storage/invalid-event-name': 'Nombre de evento inválido.',
      'storage/invalid-url': 'URL de archivo inválida.',
      'storage/invalid-argument': 'Argumento inválido para la operación de almacenamiento.',
      'storage/no-default-bucket': 'No hay bucket de almacenamiento configurado.',
      'storage/cannot-slice-blob': 'Error al procesar el archivo.',
      'storage/server-file-wrong-size': 'El tamaño del archivo no coincide con el esperado.',

      // HTTP Errors
      'Failed to fetch': 'Por favor recargue la página',
      'NetworkError': 'Error de conexión. Verifique su internet.',
      'TimeoutError': 'La operación tardó demasiado. Intente de nuevo.',

      // Errores genéricos
      'unknown-error': 'Ha ocurrido un error. Por favor, intente de nuevo.',
      'connection-error': 'Error de conexión. Verifique su internet.',
      'server-error': 'Error del servidor. Intente más tarde.',
    };

    // Buscar por código de error completo
    if (firebaseErrors[errorMessage]) {
      return firebaseErrors[errorMessage];
    }

    // Buscar por fragmentos del mensaje
    for (const [key, value] of Object.entries(firebaseErrors)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Buscar patrones comunes en inglés
    const commonPatterns: { [key: string]: string } = {
      'email already in use': 'El email ya está registrado. Utilice otro email.',
      'weak password': 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
      'invalid email': 'El formato del email no es válido.',
      'user not found': 'No existe una cuenta con este email.',
      'wrong password': 'La contraseña es incorrecta.',
      'too many requests': 'Demasiados intentos. Intente más tarde.',
      'network error': 'Error de conexión. Verifique su internet.',
      'permission denied': 'No tiene permisos para realizar esta acción.',
      'document not found': 'El registro solicitado no existe.',
      'already exists': 'El registro ya existe.',
      'unauthorized': 'No tiene autorización para esta acción.',
      'quota exceeded': 'Se ha excedido el límite permitido.',
      'popup closed': 'La ventana de autenticación fue cerrada. Intente de nuevo.',
      'popup blocked': 'La ventana emergente fue bloqueada. Permita ventanas emergentes.',
      'cancelled': 'La operación fue cancelada.',
      'timeout': 'La operación tardó demasiado. Intente de nuevo.',
    };

    const lowerMessage = errorMessage.toLowerCase();
    for (const [pattern, translation] of Object.entries(commonPatterns)) {
      if (lowerMessage.includes(pattern)) {
        return translation;
      }
    }

    // Si no se encuentra traducción, devolver el mensaje original o uno genérico
    return errorMessage || 'Ha ocurrido un error. Por favor, intente de nuevo.';
  }
}
