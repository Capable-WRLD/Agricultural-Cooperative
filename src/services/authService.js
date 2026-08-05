import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";

// Register User
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Send verification email
  await sendEmailVerification(userCredential.user);

  return userCredential;
};

// Login User
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Login
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};