import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// ============================================================
// GET ORGANIZATION INVENTORY IN REAL TIME
// ============================================================

export function listenToInventory({ organizationId, callback }) {
  if (!organizationId) {
    console.error("listenToInventory: organizationId is required");
    callback([]);
    return () => {};
  }

  const inventoryRef = collection(
    db,
    "organizations",
    organizationId,
    "inventory"
  );

  return onSnapshot(
    inventoryRef,
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      // Newest items first
      items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;

        const bTime = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;

        return bTime - aTime;
      });

      callback(items);
    },
    (error) => {
      console.error("Inventory listener error:", error);
      callback([]);
    }
  );
}

// ============================================================
// ADD INVENTORY ITEM
// ============================================================

export async function addInventoryItem({
  organizationId,
  name,
  category,
  quantity,
  unitPrice,
  minimumStock,
}) {
  if (!organizationId) {
    throw new Error("Organization ID is required.");
  }

  if (!name?.trim()) {
    throw new Error("Inventory item name is required.");
  }

  const numericQuantity = Number(quantity);
  const numericUnitPrice = Number(unitPrice);
  const numericMinimumStock = Number(minimumStock);

  if (
    Number.isNaN(numericQuantity) ||
    numericQuantity < 0
  ) {
    throw new Error("Enter a valid quantity.");
  }

  if (
    Number.isNaN(numericUnitPrice) ||
    numericUnitPrice < 0
  ) {
    throw new Error("Enter a valid unit price.");
  }

  if (
    Number.isNaN(numericMinimumStock) ||
    numericMinimumStock < 0
  ) {
    throw new Error("Enter a valid minimum stock.");
  }

  const totalValue =
    numericQuantity * numericUnitPrice;

  const inventoryRef = collection(
    db,
    "organizations",
    organizationId,
    "inventory"
  );

  const itemRef = await addDoc(inventoryRef, {
    organizationId,

    name: name.trim(),

    category: category?.trim() || "General",

    quantity: numericQuantity,

    unitPrice: numericUnitPrice,

    totalValue,

    minimumStock: numericMinimumStock,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  console.log(
    "Inventory item created:",
    itemRef.id
  );

  return itemRef.id;
}

// ============================================================
// UPDATE INVENTORY ITEM
// ============================================================

export async function updateInventoryItem({
  organizationId,
  itemId,
  name,
  category,
  quantity,
  unitPrice,
  minimumStock,
}) {
  if (!organizationId || !itemId) {
    throw new Error(
      "Organization ID and item ID are required."
    );
  }

  const numericQuantity = Number(quantity);
  const numericUnitPrice = Number(unitPrice);
  const numericMinimumStock = Number(minimumStock);

  if (
    Number.isNaN(numericQuantity) ||
    numericQuantity < 0
  ) {
    throw new Error("Enter a valid quantity.");
  }

  if (
    Number.isNaN(numericUnitPrice) ||
    numericUnitPrice < 0
  ) {
    throw new Error("Enter a valid unit price.");
  }

  if (
    Number.isNaN(numericMinimumStock) ||
    numericMinimumStock < 0
  ) {
    throw new Error("Enter a valid minimum stock.");
  }

  const totalValue =
    numericQuantity * numericUnitPrice;

  const itemRef = doc(
    db,
    "organizations",
    organizationId,
    "inventory",
    itemId
  );

  await updateDoc(itemRef, {
    name: name?.trim() || "Unnamed Item",

    category: category?.trim() || "General",

    quantity: numericQuantity,

    unitPrice: numericUnitPrice,

    totalValue,

    minimumStock: numericMinimumStock,

    updatedAt: serverTimestamp(),
  });

  console.log(
    "Inventory item updated:",
    itemId
  );
}

// ============================================================
// DELETE INVENTORY ITEM
// ============================================================

export async function deleteInventoryItem({
  organizationId,
  itemId,
}) {
  if (!organizationId || !itemId) {
    throw new Error(
      "Organization ID and item ID are required."
    );
  }

  const itemRef = doc(
    db,
    "organizations",
    organizationId,
    "inventory",
    itemId
  );

  await deleteDoc(itemRef);

  console.log(
    "Inventory item deleted:",
    itemId
  );
}