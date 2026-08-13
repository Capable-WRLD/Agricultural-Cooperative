import { db } from "../firebase";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

const CLOUDINARY_CLOUD_NAME = "nzxjwhpe";
const CLOUDINARY_UPLOAD_PRESET = "agrocoop_receipts";

// ============================================================
// UPLOAD RECEIPT TO CLOUDINARY
// ============================================================

async function uploadReceiptToCloudinary(file) {
  if (!file) {
    throw new Error("Please upload your payment receipt.");
  }

  // Basic file validation
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid receipt format. Please upload JPG, PNG, or PDF."
    );
  }

  // Keep uploads reasonably small
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    throw new Error("Receipt file must not be larger than 5MB.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/` +
    `${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Receipt upload failed.";

    try {
      const errorData = await response.json();

      console.error(
        "Cloudinary error:",
        errorData
      );

      errorMessage =
        errorData?.error?.message ||
        errorMessage;
    } catch {
      console.error(
        "Cloudinary upload failed with status:",
        response.status
      );
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(
      "Cloudinary did not return a receipt URL."
    );
  }

  console.log(
    "Receipt uploaded successfully:",
    data.secure_url
  );

  return data.secure_url;
}

// ============================================================
// SUBMIT SAVINGS PAYMENT
// ============================================================

export async function submitSavingsPayment({
  organizationId,
  memberUid,
  memberFullName,
  amount,
  paymentDate,
  reference,
  file,
}) {
  if (!organizationId) {
    throw new Error(
      "Organization ID is required."
    );
  }

  if (!memberUid) {
    throw new Error(
      "Member ID is required."
    );
  }

  const numericAmount = Number(amount);

  if (
    !numericAmount ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Enter a valid savings amount."
    );
  }

  if (!file) {
    throw new Error(
      "Please upload your payment receipt."
    );
  }

  // ==========================================================
  // UPLOAD RECEIPT TO CLOUDINARY
  // ==========================================================

  const receiptUrl =
    await uploadReceiptToCloudinary(file);

  // ==========================================================
  // PAYMENT DATE
  // ==========================================================

  let firestorePaymentDate;

  if (paymentDate) {
    const date = new Date(paymentDate);

    if (Number.isNaN(date.getTime())) {
      throw new Error(
        "Invalid payment date."
      );
    }

    firestorePaymentDate =
      Timestamp.fromDate(date);
  } else {
    firestorePaymentDate =
      Timestamp.now();
  }

  // ==========================================================
  // CREATE SAVINGS TRANSACTION
  // ==========================================================

  const savingsRef = collection(
    db,
    "organizations",
    organizationId,
    "savings"
  );

  const savingsDoc = await addDoc(
    savingsRef,
    {
      organizationId,

      memberUid,

      memberFullName:
        memberFullName || "Member",

      amount: numericAmount,

      paymentDate:
        firestorePaymentDate,

      reference:
        reference?.trim() || null,

      receiptUrl,

      status: "Pending",

      createdAt:
        serverTimestamp(),

      approvedAt: null,
      approvedBy: null,
      approvedByName: null,

      rejectedAt: null,
      rejectedBy: null,
      rejectedByName: null,
    }
  );

  console.log(
    "Savings payment submitted:",
    `organizations/${organizationId}/savings/${savingsDoc.id}`
  );

  return savingsDoc.id;
}

// ============================================================
// MEMBER SAVINGS - REAL TIME LISTENER
// ============================================================

export function listenToMemberSavings({
  organizationId,
  memberUid,
  callback,
}) {
  if (
    !organizationId ||
    !memberUid
  ) {
    console.error(
      "listenToMemberSavings: organizationId and memberUid are required."
    );

    return () => {};
  }

  const savingsRef = collection(
    db,
    "organizations",
    organizationId,
    "savings"
  );

  const q = query(
    savingsRef,
    where(
      "memberUid",
      "==",
      memberUid
    )
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items =
        snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

      // Newest first
      items.sort((a, b) => {
        const aTime =
          getTimestampValue(
            a.createdAt
          );

        const bTime =
          getTimestampValue(
            b.createdAt
          );

        return bTime - aTime;
      });

      callback(items);
    },
    (error) => {
      console.error(
        "Error listening to member savings:",
        error
      );

      callback([]);
    }
  );
}

// ============================================================
// MEMBER APPROVED SAVINGS TOTAL
// ============================================================

export async function getMemberApprovedTotal({
  organizationId,
  memberUid,
}) {
  if (
    !organizationId ||
    !memberUid
  ) {
    return 0;
  }

  try {
    const savingsRef =
      collection(
        db,
        "organizations",
        organizationId,
        "savings"
      );

    const q = query(
      savingsRef,
      where(
        "memberUid",
        "==",
        memberUid
      ),
      where(
        "status",
        "==",
        "Approved"
      )
    );

    const snapshot =
      await getDocs(q);

    let total = 0;

    snapshot.forEach(
      (item) => {
        total += Number(
          item.data().amount || 0
        );
      }
    );

    return total;
  } catch (error) {
    console.error(
      "getMemberApprovedTotal error:",
      error
    );

    return 0;
  }
}

// ============================================================
// ORGANIZATION SAVINGS - REAL TIME LISTENER
// ============================================================

export function listenToOrganizationSavings({
  organizationId,
  callback,
}) {
  if (!organizationId) {
    console.error(
      "listenToOrganizationSavings: organizationId is required."
    );

    return () => {};
  }

  const savingsRef =
    collection(
      db,
      "organizations",
      organizationId,
      "savings"
    );

  return onSnapshot(
    savingsRef,
    (snapshot) => {
      const items =
        snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

      // Newest first
      items.sort((a, b) => {
        const aTime =
          getTimestampValue(
            a.createdAt
          );

        const bTime =
          getTimestampValue(
            b.createdAt
          );

        return bTime - aTime;
      });

      callback(items);
    },
    (error) => {
      console.error(
        "Error listening to organization savings:",
        error
      );

      callback([]);
    }
  );
}

// ============================================================
// APPROVE SAVINGS PAYMENT
// ============================================================

export async function approveSavings({
  organizationId,
  savingsId,
  approverUid,
}) {
  if (
    !organizationId ||
    !savingsId
  ) {
    throw new Error(
      "Organization ID and savings ID are required."
    );
  }

  if (!approverUid) {
    throw new Error(
      "Administrator ID is required."
    );
  }

  const transactionRef =
    doc(
      db,
      "organizations",
      organizationId,
      "savings",
      savingsId
    );

  return await runTransaction(
    db,
    async (transaction) => {
      // Get savings transaction
      const savingsSnapshot =
        await transaction.get(
          transactionRef
        );

      if (!savingsSnapshot.exists()) {
        throw new Error(
          "Savings transaction not found."
        );
      }

      const savingsData =
        savingsSnapshot.data();

      // Prevent double approval
      if (
        savingsData.status ===
        "Approved"
      ) {
        return {
          alreadyApproved: true,
        };
      }

      if (
        savingsData.status !==
        "Pending"
      ) {
        throw new Error(
          "Only pending savings payments can be approved."
        );
      }

      const memberUid =
        savingsData.memberUid;

      const amount =
        Number(
          savingsData.amount || 0
        );

      if (!memberUid) {
        throw new Error(
          "This savings transaction has no member ID."
        );
      }

      if (
        !amount ||
        amount <= 0
      ) {
        throw new Error(
          "This savings transaction has an invalid amount."
        );
      }

      // References
      const userRef =
        doc(
          db,
          "users",
          memberUid
        );

      const memberRef =
        doc(
          db,
          "organizations",
          organizationId,
          "members",
          memberUid
        );

      const approverRef =
        doc(
          db,
          "users",
          approverUid
        );

      // Read documents
      const userSnapshot =
        await transaction.get(
          userRef
        );

      const memberSnapshot =
        await transaction.get(
          memberRef
        );

      const approverSnapshot =
        await transaction.get(
          approverRef
        );

      if (!userSnapshot.exists()) {
        throw new Error(
          "Member user profile not found."
        );
      }

      if (
        !memberSnapshot.exists()
      ) {
        throw new Error(
          "Member record was not found in this organization."
        );
      }

      // Current balances
      const currentUserSavings =
        Number(
          userSnapshot.data()
            .savings || 0
        );

      const currentMemberSavings =
        Number(
          memberSnapshot.data()
            .savings || 0
        );

      const approverName =
        approverSnapshot.exists()
          ? approverSnapshot.data()
              .fullName ||
            "Administrator"
          : "Administrator";

      // Update transaction
      transaction.update(
        transactionRef,
        {
          status: "Approved",

          approvedAt:
            serverTimestamp(),

          approvedBy:
            approverUid,

          approvedByName:
            approverName,
        }
      );

      // Update user's savings
      transaction.update(
        userRef,
        {
          savings:
            currentUserSavings +
            amount,
        }
      );

      // Update organization member savings
      transaction.update(
        memberRef,
        {
          savings:
            currentMemberSavings +
            amount,
        }
      );

      console.log(
        "Savings approved:",
        savingsId,
        "Amount:",
        amount,
        "Member:",
        memberUid
      );

      return {
        alreadyApproved: false,
        approved: true,
        amount,
      };
    }
  );
}

// ============================================================
// REJECT SAVINGS PAYMENT
// ============================================================

export async function rejectSavings({
  organizationId,
  savingsId,
  approverUid,
}) {
  if (
    !organizationId ||
    !savingsId
  ) {
    throw new Error(
      "Organization ID and savings ID are required."
    );
  }

  if (!approverUid) {
    throw new Error(
      "Administrator ID is required."
    );
  }

  const transactionRef =
    doc(
      db,
      "organizations",
      organizationId,
      "savings",
      savingsId
    );

  return await runTransaction(
    db,
    async (transaction) => {
      const savingsSnapshot =
        await transaction.get(
          transactionRef
        );

      if (!savingsSnapshot.exists()) {
        throw new Error(
          "Savings transaction not found."
        );
      }

      const savingsData =
        savingsSnapshot.data();

      // Already finalized
      if (
        savingsData.status !==
        "Pending"
      ) {
        return {
          alreadyFinalized: true,
        };
      }

      const approverRef =
        doc(
          db,
          "users",
          approverUid
        );

      const approverSnapshot =
        await transaction.get(
          approverRef
        );

      const approverName =
        approverSnapshot.exists()
          ? approverSnapshot.data()
              .fullName ||
            "Administrator"
          : "Administrator";

      transaction.update(
        transactionRef,
        {
          status: "Rejected",

          rejectedAt:
            serverTimestamp(),

          rejectedBy:
            approverUid,

          rejectedByName:
            approverName,
        }
      );

      console.log(
        "Savings rejected:",
        savingsId
      );

      return {
        rejected: true,
      };
    }
  );
}

// ============================================================
// ORGANIZATION APPROVED TOTAL
// ============================================================

export async function getOrganizationApprovedTotal({
  organizationId,
}) {
  if (!organizationId) {
    return 0;
  }

  try {
    const savingsRef =
      collection(
        db,
        "organizations",
        organizationId,
        "savings"
      );

    const q = query(
      savingsRef,
      where(
        "status",
        "==",
        "Approved"
      )
    );

    const snapshot =
      await getDocs(q);

    let total = 0;

    snapshot.forEach(
      (item) => {
        total += Number(
          item.data().amount || 0
        );
      }
    );

    return total;
  } catch (error) {
    console.error(
      "getOrganizationApprovedTotal error:",
      error
    );

    return 0;
  }
}

// ============================================================
// HELPER - FIRESTORE TIMESTAMP SORTING
// ============================================================

function getTimestampValue(value) {
  if (!value) {
    return 0;
  }

  // Firestore Timestamp
  if (
    typeof value.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }

  // JavaScript Date
  if (value instanceof Date) {
    return value.getTime();
  }

  // Timestamp-like object
  if (value.seconds) {
    return (
      Number(value.seconds) *
      1000
    );
  }

  // String date
  const parsed =
    new Date(value).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}