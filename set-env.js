// Script simple para generar environments desde .env
require('dotenv').config();

const fs = require('fs');

// Crear environment.ts
const environment = `export const environment = {
  production: false,
  apiUrl: '${process.env.API_URL || ""}',
  firebase: {
    projectId: '${process.env.FIREBASE_PROJECT_ID || ""}',
    appId: '${process.env.FIREBASE_APP_ID || ""}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ""}',
    apiKey: '${process.env.FIREBASE_API_KEY || ""}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ""}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ""}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID || ""}'
  },
  recaptcha: {
		siteKey: '${process.env.RECAPTCHA_SITE_KEY || ""}',
	},
  
};
`;

// Crear environment.prod.ts
const environmentProd = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ""}',
  firebase: {
    projectId: '${process.env.FIREBASE_PROJECT_ID || ""}',
    appId: '${process.env.FIREBASE_APP_ID || ""}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ""}',
    apiKey: '${process.env.FIREBASE_API_KEY || ""}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ""}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ""}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID || ""}'
  },
  recaptcha: {
		siteKey: '${process.env.RECAPTCHA_SITE_KEY || ""}',
	},
};
`;

// Asegurar que existe la carpeta
if (!fs.existsSync('./src/environments')) {
  fs.mkdirSync('./src/environments', { recursive: true });
}

// Guardar los archivos
fs.writeFileSync('./src/environments/environment.ts', environment);
fs.writeFileSync('./src/environments/environment.prod.ts', environmentProd);

console.log('Archivos de entorno generados desde .env');
