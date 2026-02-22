//src/config/firebase.js
import admin from "firebase-admin";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // console.log(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT));
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
