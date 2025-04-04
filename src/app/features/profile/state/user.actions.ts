export class LoadUser {
	static readonly type = "[User] Load";
	constructor(public readonly id: string) {}
}
export class LoadPlan {
	static readonly type = "[Plan] Load Plan";
	constructor(public planId: string) {}
}
