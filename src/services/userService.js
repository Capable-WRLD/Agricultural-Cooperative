import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveUserData = async (uid, userData) => {
  await setDoc(doc(db, "users", uid), userData);
};

// Creates only a missing profile for an authenticated user. Existing profile
// fields are never replaced by this recovery path.
export const ensureUserProfile = async (user) => {
  if (!user?.uid) {
    throw new Error("Authenticated user details are required.");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  const profile = {
    fullName: user.displayName || user.email?.split("@")[0] || "Member",
    email: user.email || "",
    phone: "",
    role: null,
    status: "New",
    organizationId: null,
    organizationName: null,
    organizationCode: null,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, profile, { merge: true });

  return profile;
};

export const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
};
