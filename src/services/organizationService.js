import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

// Generate Cooperative Code
export const generateOrganizationCode = (organizationName) => {
  const prefix = organizationName
    .substring(0, 3)
    .toUpperCase();

  const random = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}-${random}`;
};

// Create Organization
export const createOrganization = async (organizationData) => {
  const docRef = await addDoc(
    collection(db, "organizations"),
    organizationData
  );

  return docRef.id;
};

// Update User
export const updateUserOrganization = async (
  uid,
  organizationData
) => {
  await updateDoc(doc(db, "users", uid), organizationData);
};