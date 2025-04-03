import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  /**
   * Muestra una notificación toast al usuario
   * @param message Mensaje a mostrar
   * @param type Tipo de mensaje (success, error, warning, info)
   * @param duration Duración del toast en ms (default: 2500ms)
   */
  async showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 2500,
  ) {
    const icon = this.getIconForType(type);
    const color = this.getColorForType(type);

    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color,
      icon,
      cssClass: 'custom-toast',
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
          side: 'end',
        },
      ],
    });

    await toast.present();
    return toast;
  }

  /**
   * Muestra un mensaje de éxito
   * @param message Mensaje a mostrar
   */
  async showSuccess(message: string) {
    return this.showToast(message, 'success');
  }

  /**
   * Muestra un mensaje de error
   * @param message Mensaje a mostrar
   */
  async showError(message: string) {
    return this.showToast(message, 'error');
  }

  /**
   * Muestra un mensaje de advertencia
   * @param message Mensaje a mostrar
   */
  async showWarning(message: string) {
    return this.showToast(message, 'warning');
  }

  /**
   * Muestra un mensaje informativo
   * @param message Mensaje a mostrar
   */
  async showInfo(message: string) {
    return this.showToast(message, 'info');
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  }

  private getColorForType(type: string): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'primary';
    }
  }
}
