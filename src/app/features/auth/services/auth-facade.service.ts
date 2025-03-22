import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { User, UserInfo, UserRole } from '../interfaces/user.interface';
import {
  Login,
  Logout,
  GetCurrentUser,
  RefreshSession,
  AuthState,
  SetMockUser,
} from '../state/auth.state';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthFacadeService {
  constructor(private store: Store) {}

  // Getters del estado
  get user$(): Observable<User | null> {
    console.log('AuthFacade: Obteniendo observable user$');
    return this.store
      .select(AuthState.getUser)
      .pipe(tap((user) => console.log('AuthFacade: Emitiendo user:', user)));
  }

  get userInfo$(): Observable<UserInfo | undefined> {
    return this.store.select(AuthState.getUserInfo);
  }

  get userRole$(): Observable<UserRole | undefined> {
    return this.store.select(AuthState.getUserRole);
  }

  get isAuthenticated$(): Observable<boolean> {
    console.log('AuthFacade: Obteniendo observable isAuthenticated$');
    return this.store
      .select(AuthState.isAuthenticated)
      .pipe(
        tap((isAuth) =>
          console.log('AuthFacade: Emitiendo isAuthenticated:', isAuth),
        ),
      );
  }

  get token$(): Observable<string | null> {
    return this.store.select(AuthState.getToken);
  }

  get loading$(): Observable<boolean> {
    return this.store.select(AuthState.getLoading);
  }

  get error$(): Observable<string | null> {
    return this.store.select(AuthState.getError);
  }

  // Acciones
  login(email: string, password: string): void {
    this.store.dispatch(new Login(email, password));
  }

  logout(): void {
    this.store.dispatch(new Logout());
  }

  getCurrentUser(): void {
    this.store.dispatch(new GetCurrentUser());
  }

  refreshSession(): void {
    this.store.dispatch(new RefreshSession());
  }

  // Método para establecer rápidamente el estado del usuario si ya tenemos uno por defecto
  setMockUserState(): void {
    console.log('AuthFacade: Estableciendo estado de usuario directamente');
    // Este método es para pruebas - establece directamente el estado sin pasar por el login
    const mockUser = {
      _id: '67c1e7f693b18ac69b4482d1',
      role: UserRole.ADMIN,
      email: 'steelparadisegym@gmail.com',
      userInfo: {
        _id: '67c1e7f793b18ac69b4482d3',
        name: 'Federico',
        identifier: 'steelparadisegym@gmail.com',
        dateBirthday: '2025-02-06T03:00:00.000Z',
        sex: 'Masculino',
        phone: '1243252',
        address: 'ewgewgrew',
        historyofPathologicalLesions: 'false',
        medicalSociety: 'dfbrdrnt',
        cardiacHistory: 'false',
        bloodPressure: 'Normal',
        frequencyOfPhysicalExercise: 'Diario',
        respiratoryHistory: 'true',
        surgicalHistory: 'false',
        CI: '2342356657',
      },
      planId: '67c0a9abde6282d107e2788d',
      routineId: '67c0a95cde6282d107e2786d',
    };

    // Establecer token en localStorage
    localStorage.setItem('token', 'mock-token');

    // Este dispatch actualizará el estado
    this.store.dispatch(new SetMockUser(mockUser));
  }
}
