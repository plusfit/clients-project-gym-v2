import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
	Auth,
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
} from "@angular/fire/auth";
import { environment } from "environments/environment";
import { jwtDecode } from "jwt-decode";
import { Observable, from, of, throwError } from "rxjs";
import { delay, map } from "rxjs/operators";
import {
	AuthResponse,
	GoogleAuthPayload,
	LoginCredentials,
	LoginPayload,
	RefreshTokenPayload,
	RegisterPayload,
	RegisterResponse,
	User,
	ValidateCIResponse,
	ValidateInvitationCodeResponse,
} from "../interfaces/user.interface";

@Injectable({
	providedIn: "root",
})
export class AuthService {
	constructor(
		private _auth: Auth,
		private http: HttpClient,
	) { }

	loginFirebase(authCredentials: LoginCredentials): any {
		const { email, password } = authCredentials;
		return from(signInWithEmailAndPassword(this._auth, email, password));
	}

	login(token: string, recaptchaToken?: string, password?: string): Observable<AuthResponse> {
		const payload: LoginPayload = { token };
		if (recaptchaToken) {
			payload.recaptchaToken = recaptchaToken;
		}
		if (password) {
			payload.password = password;
		}
		return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload);
	}

	getCurrentUser(): Observable<User> {
		// Try to get userId from JWT in localStorage
		let userId: string | null = null;
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded: any = jwtDecode(token);
				userId = decoded?._id || decoded?.id || null;
			} catch { }
		}
		if (!userId) {
			userId = localStorage.getItem("userId");
		}
		if (!userId) {
			return throwError(() => new Error("No user id found"));
		}
		return this.http.get<any>(`${environment.apiUrl}/clients/${userId}`).pipe(map((response) => response.data as User));
	}

	logout(): Observable<boolean> {
		// Simulamos logout exitoso
		localStorage.removeItem("token");
		return of(true).pipe(delay(300));
	}

	refreshSession(): Observable<AuthResponse> {
		// Implement with real backend call or throw error if not implemented
		return throwError(() => new Error("refreshSession not implemented"));
	}

	register(
		email: string,
		password?: string,
		displayName?: string,
		photoURL?: string,
		recaptchaToken?: string,
		invitationCode?: string,
	): Observable<RegisterResponse> {
		const payload: RegisterPayload = { email };
		if (password) payload.password = password;
		if (displayName) payload.displayName = displayName;
		if (photoURL) payload.photoURL = photoURL;
		if (recaptchaToken) payload.recaptchaToken = recaptchaToken;
		if (invitationCode) payload.invitationCode = invitationCode;

		return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, payload);
	}

	registerFirebase(email: string, password: string): any {
		return from(createUserWithEmailAndPassword(this._auth, email, password));
	}

	getNewToken(refreshToken: RefreshTokenPayload): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refreshToken`, refreshToken);
	}

	signInWithGoogle(): any {
		const provider = new GoogleAuthProvider();
		return from(signInWithPopup(this._auth, provider));
	}

	googleAuth(idToken: string, name?: string, photoURL?: string, recaptchaToken?: string, invitationCode?: string): Observable<AuthResponse> {
		const payload: GoogleAuthPayload = { idToken };
		if (name) payload.name = name;
		if (photoURL) payload.avatarUrl = photoURL;
		if (recaptchaToken) payload.recaptchaToken = recaptchaToken;
		if (invitationCode) payload.invitationCode = invitationCode;

		return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, payload);
	}

	updateOnboardingCompleted(userId: string): Observable<User> {
		return this.http
			.patch<any>(`${environment.apiUrl}/clients/${userId}`, { isOnboardingCompleted: true })
			.pipe(map((response) => response.data));
	}

	forgotPassword(email: string): Observable<any> {
		return from(sendPasswordResetEmail(this._auth, email));
	}

	validateCI(ci: string): Observable<ValidateCIResponse> {
		return this.http.get<ValidateCIResponse>(`${environment.apiUrl}/clients/validate/ci/${ci}`);
	}

	validateInvitationCode(code: string): Observable<ValidateInvitationCodeResponse> {
		return this.http.get<ValidateInvitationCodeResponse>(`${environment.apiUrl}/auth/invitation-code/validate/${code}`);
	}
}
