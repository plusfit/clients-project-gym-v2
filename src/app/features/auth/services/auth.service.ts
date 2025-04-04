import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay, tap } from "rxjs/operators";
import {
	AuthResponse,
	LoginCredentials,
	User,
	UserRole,
} from "../interfaces/user.interface";

@Injectable({
	providedIn: "root",
})
export class AuthService {
	private mockUser: User = {
		_id: "67c1e7f693b18ac69b4482d1",
		role: UserRole.ADMIN,
		email: "steelparadisegym@gmail.com",
		userInfo: {
			_id: "67c1e7f793b18ac69b4482d3",
			name: "Federico",
			password: "PlusFit1!",
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
		refreshToken:
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2MxZTdmNjkzYjE4YWM2OWI0NDgyZDEiLCJyb2xlIjoiQWRtaW4iLCJlbWFpbCI6InN0ZWVscGFyYWRpc2VneW1AZ21haWwuY29tIiwiX192IjowLCJ1c2VySW5mbyI6eyJuYW1lIjoiRmVkZXJpY28iLCJwYXNzd29yZCI6IlBsdXNGaXQxISIsImlkZW50aWZpZXIiOiJzdGVlbHBhcmFkaXNlZ3ltQGdtYWlsLmNvbSIsImRhdGVCaXJ0aGRheSI6IjIwMjUtMDItMDYUMDM6MDA6MDAuMDAwWiIsInNleCI6Ik1hc2N1bGlubyIsInBob25lIjoiMTI0MzI1MiIsImFkZHJlc3MiOiJld2dld2dyZXciLCJoaXN0b3J5b2ZQYXRob2xvZ2ljYWxMZXNpb25zIjoiZmFsc2UiLCJtZWRpY2FsU29jaWV0eSI6ImRmYnJkcm50IiwiY2FyZGlhY0hpc3RvcnkiOiJmYWxzZSIsImJsb29kUHJlc3N1cmUiOiJOb3JtYWwiLCJmcmVxdWVuY3lPZlBoeXNpY2FsRXhlcmNpc2UiOiJEaWFyaW8iLCJyZXNwaXJhdG9yeUhpc3RvcnkiOiJ0cnVlIiwic3VyZ2ljYWxIaXN0b3J5IjoiZmFsc2UiLCJDSSI6IjIzNDIzNTY2NTciLCJfaWQiOiI2N2MxZTdmNzkzYjE4YWM2OWI0NDgyZDMifSwicGxhbklkIjoiNjdjMGE5YWJkZTYyODJkMTA3ZTI3ODhkIiwicm91dGluZUlkIjoiNjdjMGE5NWNkZTYyODJkMTA3ZTI3ODZkIiwiY3JlYXRlZEF0IjoxNzQxODA5NDM0MTcxLCJpYXQiOjE3NDE4MDk0MzQsImV4cCI6MTc0MjI0MTQzNH0.OaLGjYKE-cqmAcHtjhUPTQd_KLC6R-pu_q5LRXK22mU",
	};

	private mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken";

	constructor() {}

	login(credentials: LoginCredentials): Observable<AuthResponse> {
		// Simulamos la verificación de credenciales
		if (
			credentials.email === this.mockUser.email &&
			credentials.password === this.mockUser.userInfo.password
		) {
			return of({
				user: this.mockUser,
				token: this.mockToken,
			}).pipe(
				delay(300), // Reducimos el delay para que sea más rápido
				tap((response) => {
					// Guardar el token
					localStorage.setItem("token", response.token);
				}),
			);
		} else {
			return throwError(() => new Error("Credenciales inválidas")).pipe(
				delay(300),
			);
		}
	}

	getCurrentUser(): Observable<User> {
		// Simulamos obtener el usuario de una sesión existente
		return of(this.mockUser).pipe(delay(300));
	}

	// Método sincrónico para obtener el usuario actual
	// Útil para servicios que necesitan acceder al ID del usuario inmediatamente
	getCurrentUserSync(): User {
		return this.mockUser;
	}

	logout(): Observable<boolean> {
		// Simulamos logout exitoso
		localStorage.removeItem("token");
		return of(true).pipe(delay(300));
	}

	refreshSession(): Observable<AuthResponse> {
		// Simulamos renovación de token
		return of({
			user: this.mockUser,
			token: this.mockToken + ".refreshed",
		}).pipe(delay(300));
	}
}
