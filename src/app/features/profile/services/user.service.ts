import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '@feature/profile/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}

  getUser(): Observable<User> {
    // Simulación de llamada al backend con los datos de ejemplo
    const user: User = {
      _id: '67c1e9620dd078c1a869dbc2',
      role: 'User',
      email: 'federicotodaro1995@gmail.com',
      userInfo: {
        name: 'Federico',
        password: 'PlusFit1!',
        identifier: 'Federicotodaro1995@gmail.com',
        dateBirthday: new Date('1995-09-19T03:00:00.000Z'),
        sex: 'Masculino',
        phone: '092744211',
        address: 'Salinas Norte Calle Ceibo M 166 S 22 Esq Ruta 87',
        historyofPathologicalLesions: false,
        medicalSociety: 'Circulo Catolico',
        cardiacHistory: false,
        bloodPressure: 'Normal',
        frequencyOfPhysicalExercise: 'Diario',
        respiratoryHistory: false,
        surgicalHistory: false,
        CI: '49911824',
      },
      planId: '67c0a9abde6282d107e2788d',
      routineId: '67c0a95cde6282d107e2786d',
    };

    return of(user).pipe(delay(1000));
  }
}
