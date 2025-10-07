import { RefreshTokenPayload, RegisterCredentials, User } from "../interfaces/user.interface";

export class Login {
	static readonly type = "[Auth] Login";
	constructor(public credentials: { email: string; password: string; recaptchaToken?: string }) {}
}

export class Logout {
	static readonly type = "[Auth] Logout";
}

export class GetCurrentUser {
	static readonly type = "[Auth] Get Current User";
}

export class RefreshSession {
	static readonly type = "[Auth] Refresh Session";
}

// Acción para establecer usuario directamente (para pruebas/mock)
export class SetMockUser {
	static readonly type = "[Auth] Set Mock User";
	constructor(public user: User) {}
}

export class Register {
	static readonly type = "[Auth] Register";
	constructor(public credentials: RegisterCredentials) {}
}

export class GetNewToken {
	static readonly type = "[Auth] Get New Token";
	constructor(public readonly payload: RefreshTokenPayload) {}
}

export class GoogleLogin {
	static readonly type = "[Auth] Google Login";
	constructor(public recaptchaToken?: string) {}
}

export class GoogleRegister {
	static readonly type = "[Auth] Google Register";
	constructor(public recaptchaToken?: string) {}
}

export class SetOnboardingCompleted {
	static readonly type = "[Auth] Set Onboarding Completed";
}

export class UpdateUser {
	static readonly type = "[Auth] Update User";
	constructor(public user: User) {}
}

export class ForgotPassword {
	static readonly type = "[Auth] Forgot Password";
	constructor(public email: string) {}
}

export class ShowPasswordReminder {
	static readonly type = "[Auth] Show Password Reminder";
	constructor(public password: string) {}
}

export class HidePasswordReminder {
	static readonly type = "[Auth] Hide Password Reminder";
}
