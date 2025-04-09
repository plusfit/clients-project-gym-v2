import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { User, UserRole } from "../interfaces/user.interface";
import { AuthState, GetCurrentUser, Login, Logout, RefreshSession, SetMockUser } from "../state/auth.state";

@Injectable({
	providedIn: "root",
})
export class AuthFacadeService {
	constructor(private store: Store) {}

	// Getters del estado
	get user$(): Observable<User | null> {
		return this.store.select(AuthState.getUser);
	}

	get isAuthenticated$(): Observable<boolean> {
		return this.store.select(AuthState.isAuthenticated);
	}

	get loading$(): Observable<boolean> {
		return this.store.select(AuthState.isLoading);
	}

	get error$(): Observable<string | null> {
		return this.store.select(AuthState.getError);
	}

	// Acciones
	login(email: string, password: string): void {
		this.store.dispatch(new Login({ email, password }));
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
		// Este método es para pruebas - establece directamente el estado sin pasar por el login
		const mockUser = {
			_id: "67c1e7f693b18ac69b4482d1",
			role: UserRole.ADMIN,
			email: "steelparadisegym@gmail.com",
			userInfo: {
				_id: "67c1e7f793b18ac69b4482d3",
				name: "Federico",
				identifier: "steelparadisegym@gmail.com",
				dateBirthday: "2025-02-06T03:00:00.000Z",
				sex: "Masculino",
				phone: "1243252",
				address: "ewgewgrew",
				historyofPathologicalLesions: "false",
				medicalSociety: "dfbrdrnt",
				cardiacHistory: "false",
				bloodPressure: "Normal",
				frequencyOfPhysicalExercise: "Diario",
				respiratoryHistory: "true",
				surgicalHistory: "false",
				CI: "2342356657",
			},
			planId: "67c0a9abde6282d107e2788d",
			routineId: "67c0a95cde6282d107e2786d",
		};

		// Guardar datos importantes en localStorage para mayor compatibilidad
		localStorage.setItem("token", "mock-token");
		localStorage.setItem("userId", mockUser._id);
		console.log(`🧪 Usuario mock establecido con ID: ${mockUser._id}`);

		// Este dispatch actualizará el estado
		this.store.dispatch(new SetMockUser(mockUser));
	}
}
