import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions"; // Import getFunctions
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app); // Add this line

// Authentication functions
const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

const signInWithFacebook = () => {
  const provider = new FacebookAuthProvider();
  signInWithRedirect(auth, provider);
};

const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // The user is signed in
      // Check for email verification
      if (user.emailVerified) {
        // Email is verified
        callback(user);
      } else {
        // Email is not verified
        // Handle accordingly, maybe prompt the user to verify their email
      }
    } else {
      // No user is signed in
      callback(null);
    }
  });
};

// Exporting the functions
export { db, auth, functions, signUpWithEmail, signInWithGoogle, signInWithFacebook, onAuthStateChangedListener };
