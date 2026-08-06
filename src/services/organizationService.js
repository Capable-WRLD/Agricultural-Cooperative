import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";

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
  uid,
  organizationData
) => {
  await updateDoc(
    doc(db, "users", uid),
    organizationData
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
  // Read current user profile from Firestore
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User profile not found.");
  }

  const userData = userSnap.data();

  // Save member inside organization
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
      fullName: userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      savings: userData.savings || 0,
      loanBalance: userData.loanBalance || 0,
      role: "Member",
      status: "Active",
      joinedAt: new Date().toISOString(),
    }
  );

  // Update user document
  await updateDoc(
    doc(db, "users", user.uid),
    {
      organizationId: organization.id,
      organizationName: organization.organizationName,
      organizationCode: organization.organizationCode,
      role: "Member",
      status: "Active",
    }
  );
};