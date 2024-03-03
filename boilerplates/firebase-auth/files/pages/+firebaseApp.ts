// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, inMemoryPersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

let firebaseApp: FirebaseApp | undefined;
// create a singleton client side firebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
  deleteApp(firebaseApp);
  firebaseApp = initializeApp(firebaseConfig);
}

const auth = getAuth(firebaseApp);

// As httpOnly cookies are to be used, do not persist any state client side.
// `inMemoryPersistence` is an implementation of Persistence of type 'NONE'.
auth.setPersistence(inMemoryPersistence);

// export the firebaseApp
export default firebaseApp;
