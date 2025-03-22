import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthFacadeService } from '@feature/auth/services/auth-facade.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private authFacade: AuthFacadeService) {}

  ngOnInit(): void {
    // Verificamos el estado de autenticación en el localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Si hay un token, obtenemos los datos del usuario
      this.authFacade.getCurrentUser();
    }
  }
}
