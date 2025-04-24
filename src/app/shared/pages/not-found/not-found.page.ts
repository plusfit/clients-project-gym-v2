import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule],
  template: `
    <ion-content class="ion-padding">
      <div class="not-found-container">
        <img src="assets/logos/logo-white.png" alt="Logo del gimnasio" class="gym-logo" />
        <div class="error-code">404</div>
        <h1>Página no encontrada</h1>
        <p>La página que estás buscando no existe o ha sido movida.</p>
        <ion-button (click)="goHome()" expand="block" class="back-button">
          <ion-icon name="home-outline" slot="start"></ion-icon>
          Volver al inicio
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 20px;
    }

    .gym-logo {
      width: 180px;
      max-width: 50%;
      margin-bottom: 30px;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    .error-code {
      font-size: 8rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: 20px;
      text-shadow: 0 2px 10px rgba(var(--ion-color-primary-rgb), 0.3);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 10px;
      color: white;
    }

    p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      color: rgba(255, 255, 255, 0.7);
      max-width: 80%;
    }

    .back-button {
      margin-top: 20px;
      --border-radius: 10px;
      --padding-start: 24px;
      --padding-end: 24px;
      font-weight: 600;
    }
  `]
})
export class NotFoundPage {
  constructor(private router: Router) {
    addIcons({ homeOutline });
  }

  goHome() {
    this.router.navigate(['/cliente/inicio']);
  }
}
