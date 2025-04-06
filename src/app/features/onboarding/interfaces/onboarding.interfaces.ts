export interface Step1 {
	fullName: string;
	address: string;
	phone: string;
	mutual: string;
	dateOfBirth: string;
	sex: string;
	ci: string;
}
export interface Step2 {
	bloodPressure: string;
	history: {
		respiratory: string;
		cardiac: string;
		chirurgical: string;
		injuries: string;
	};
}
export interface Step3 {
	trainingDays: number;
	goal: string;
	trainingType: string;
	trainingLevel: string;
}
