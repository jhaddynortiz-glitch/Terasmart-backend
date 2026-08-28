import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

const serviceAccountPathInDist = path.join(__dirname, "serviceAccountKey.json");
const serviceAccountPathInSrc = path.join(__dirname, "../../src/config/serviceAccountKey.json");

const finalPath = fs.existsSync(serviceAccountPathInDist)
  ? serviceAccountPathInDist
  : fs.existsSync(serviceAccountPathInSrc)
  ? serviceAccountPathInSrc
  : null;

if (!admin.apps.length) {
  try {
    if (finalPath) {
      const serviceAccount = require(finalPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin SDK inicializado exitosamente con");
    } else {
      admin.initializeApp();
      console.log("serviceAccountKey.json no encontrado, usando inicialización por defecto.");
    }
  } catch (error) {
    console.error("Error al inicializar Firebase Admin SDK:", error);
  }
}

export const firebaseAdmin = admin;
