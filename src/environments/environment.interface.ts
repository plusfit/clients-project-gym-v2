export interface Environment {
	production: boolean;
	apiUrl: string;
	firebase: {
		projectId: string;
		appId: string;
		storageBucket: string;
		apiKey: string;
		authDomain: string;
		messagingSenderId: string;
		measurementId: string;
	};
	recaptcha: {
		siteKey: string;
	};
}
