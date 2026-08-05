import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const getDashboardData = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) return null;

  // Get current user
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data();

  // Get organization
  const orgRef = doc(db, "organizations", userData.organizationId);
  const orgSnap = await getDoc(orgRef);

  let organization = null;

  if (orgSnap.exists()) {
    organization = orgSnap.data();
  }

  return {
    user: userData,
    organization,
  };
};