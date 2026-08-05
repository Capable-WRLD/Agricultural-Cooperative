import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveUserData = async (uid, userData) => {
  await setDoc(doc(db, "users", uid), userData);
};

export const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};