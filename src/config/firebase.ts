import * as admin from "firebase-admin";

// Inicialización de Firebase Admin SDK (mock para entornos de desarrollo si no existe credencial local)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (e) {
    admin.initializeApp();
  }
}

export const firebaseAdmin = admin;
