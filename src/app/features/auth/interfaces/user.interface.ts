export interface RegisterCredentials {
	email: string;
	password: string;
	recaptchaToken?: string;
}

export interface RegisterResponse {
	success: boolean;
	data: {
		_id: string;
		identifier: string;
		role: string;
	};
}

export interface FirebaseRegisterResponse {
	user: any;
}

export interface FirebaseAuthResponse {
	_tokenResponse: {
		idToken: string;
		refreshToken: string;
		expiresIn: string;
	};
	email: string;
	password: string;
}

export interface RegisterResponse {
	success: boolean;
	data: {
		_id: string;
		identifier: string;
		role: string;
	};
}

export interface FirebaseRegisterResponse {
	user: any;
}
export interface User {
	_id: string;
	role: UserRole;
	email: string;
	userInfo: UserInfo;
	planId?: string;
	routineId?: string;
	refreshToken?: string;
	isOnboardingCompleted?: boolean;
}

export enum UserRole {
	ADMIN = "Admin",
	USER = "User",
	TRAINER = "Trainer",
}

export interface UserInfo {
	_id: string;
	name: string;
	password?: string;
	identifier: string;
	dateBirthday: Date | string;
	sex: string;
	phone: string;
	address: string;
	historyofPathologicalLesions: string;
	medicalSociety: string;
	cardiacHistory: string;
	bloodPressure: string;
	respiratoryHistory: string;
	surgicalHistory: string;
	CI: string;
	avatarUrl?: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RefreshTokenPayload {
	refreshToken?: string;
}
export interface RefreshToken {
	refreshToken?: string;
	accessToken?: string;
}
