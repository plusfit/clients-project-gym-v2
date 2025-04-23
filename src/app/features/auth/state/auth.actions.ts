import { RefreshTokenPayload, RegisterCredentials, User } from "../interfaces/user.interface";

export class Login {
	static readonly type = "[Auth] Login";
	constructor(public credentials: { email: string; password: string }) {}
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
