import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { ensureUserProfile } from "./userService";

// ===============================
// Generate Cooperative Code
// ===============================
export const generateOrganizationCode = (organizationName) => {
  const prefix = organizationName
    .substring(0, 3)
    .toUpperCase();

  const random = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}-${random}`;
};

// ===============================
// Create Organization
// ===============================
export const createOrganization = async (organizationData) => {
  const docRef = await addDoc(
    collection(db, "organizations"),
    organizationData
  );

  return docRef.id;
};

// ===============================
// Update User Organization
// ===============================
export const updateUserOrganization = async (
  user,
  organizationData
) => {
  await ensureUserProfile(user);

  await setDoc(
    doc(db, "users", user.uid),
    organizationData,
    { merge: true }
  );
};

// ===============================
// Search Organization By Code
// ===============================
export const findOrganizationByCode = async (organizationCode) => {
  const q = query(
    collection(db, "organizations"),
    where("organizationCode", "==", organizationCode)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const organizationDoc = querySnapshot.docs[0];

  return {
    id: organizationDoc.id,
    ...organizationDoc.data(),
  };
};

// ===============================
// Join Organization
// ===============================
export const joinOrganization = async (
  organization,
  user
) => {
  if (!organization?.id) {
    throw new Error("Select an organization before joining.");
  }

  await ensureUserProfile(user);

  // Read current user profile
  const userRef = doc(db, "users", user.uid);

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User profile not found.");
  }

  const userData = userSnap.data();

  // Save member under organization
  await setDoc(
    doc(
      db,
      "organizations",
      organization.id,
      "members",
      user.uid
    ),
    {
      uid: user.uid,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      savings: userData.savings || 0,
      loanBalance: userData.loanBalance || 0,
      role: "Member",
      status: "Active",
      joinedAt: new Date().toISOString(),
    }
  );

  // Update user's profile
  await setDoc(userRef, {
    organizationId: organization.id,
    organizationName: organization.organizationName,
    organizationCode: organization.organizationCode,
    role: "Member",
    status: "Active",
  }, { merge: true });

  return true;
};
