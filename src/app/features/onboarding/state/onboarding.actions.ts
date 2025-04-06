import { Step1, Step2, Step3 } from "../interfaces/onboarding.interfaces";

export class LoadOnboardingData {
	static readonly type = "[Onboarding] Load Data";
}

export class InitOnboarding {
	static readonly type = "[Onboarding] Initialize";
}

export class SetStep1 {
	static readonly type = "[Onboarding] Set Step 1";
	constructor(public readonly step: Step1) {}
}
export class SetStep2 {
	static readonly type = "[Onboarding] Set Step 2";
	constructor(public step: Step2) {}
}
export class SetStep3 {
	static readonly type = "[Onboarding] Set Step 3";
	constructor(public step: Step3) {}
}
