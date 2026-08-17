import { db } from "../firebase";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// Duplicate of receipt upload used in savingsService (kept local to avoid refactor)
const CLOUDINARY_CLOUD_NAME = "nzxjwhpe";
const CLOUDINARY_UPLOAD_PRESET = "agrocoop_receipts";

async function uploadReceiptToCloudinary(file) {
  if (!file) throw new Error("Please upload your payment receipt.");

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid receipt format. Please upload JPG, PNG, or PDF.");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Receipt file must not be larger than 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Receipt upload failed.";
    try {
      const data = await response.json();
      message = data?.error?.message || message;
    } catch {
      // The upload response did not contain a JSON error body.
    }
    throw new Error(message);
  }

  const data = await response.json();

  if (!data.secure_url) throw new Error("Cloudinary did not return a receipt URL.");

  return data.secure_url;
}

export async function submitRepayment({
  organizationId,
  loanId,
  memberUid,
  memberFullName,
  amount,
  paymentDate,
  reference,
  file,
}) {
  if (!organizationId) throw new Error("Organization ID is required.");
  if (!memberUid) throw new Error("Member ID is required.");
  if (!loanId) throw new Error("Loan ID is required.");

  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    throw new Error("Enter a valid repayment amount.");
  }

  const loanRef = doc(db, "organizations", organizationId, "loans", loanId);
  const loanSnap = await getDoc(loanRef);

  if (!loanSnap.exists()) throw new Error("Selected loan was not found.");

  const loan = loanSnap.data();

  if (
    loan.organizationId !== organizationId ||
    loan.userId !== memberUid ||
    loan.status !== "Approved"
  ) {
    throw new Error("You can only repay your own active loan.");
  }

  if (numericAmount > Number(loan.remainingBalance || 0)) {
    throw new Error("Repayment amount exceeds the outstanding balance.");
  }

  if (!file) throw new Error("Please upload your repayment receipt.");

  const receiptUrl = await uploadReceiptToCloudinary(file);

  let firestorePaymentDate;

  if (paymentDate) {
    const d = new Date(paymentDate);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid payment date.");
    firestorePaymentDate = Timestamp.fromDate(d);
  } else {
    firestorePaymentDate = Timestamp.now();
  }

  const repaymentsRef = collection(
    db,
    "organizations",
    organizationId,
    "repayments"
  );

  const docRef = await addDoc(repaymentsRef, {
    organizationId,
    loanId,
    memberUid,
    memberFullName: memberFullName || "Member",
    amount: numericAmount,
    paymentDate: firestorePaymentDate,
    reference: reference?.trim() || null,
    receiptUrl: receiptUrl || null,
    status: "Pending",
    createdAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
    approvedByName: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectedByName: null,
  });

  return docRef.id;
}

export function listenToOrganizationRepayments({ organizationId, callback }) {
  if (!organizationId) return () => {};

  const ref = collection(db, "organizations", organizationId, "repayments");

  return onSnapshot(
    ref,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
      callback(items);
    },
    (err) => {
      console.error("Error listening to repayments:", err);
      callback([]);
    }
  );
}

export function listenToMemberRepayments({ organizationId, memberUid, callback }) {
  if (!organizationId || !memberUid) return () => {};

  const ref = collection(db, "organizations", organizationId, "repayments");

  const q = query(ref, where("memberUid", "==", memberUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
      callback(items);
    },
    (err) => {
      console.error("Error listening to member repayments:", err);
      callback([]);
    }
  );
}

export function listenToMemberLoans({ organizationId, memberUid, callback }) {
  if (!organizationId || !memberUid) return () => {};

  const ref = collection(db, "organizations", organizationId, "loans");

  const q = query(ref, where("userId", "==", memberUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
      callback(items);
    },
    (err) => {
      console.error("Error listening to member loans:", err);
      callback([]);
    }
  );
}

export async function approveRepayment({ organizationId, repaymentId, approverUid }) {
  if (!organizationId || !repaymentId) throw new Error("Organization ID and repayment ID are required.");
  if (!approverUid) throw new Error("Approver UID is required.");

  const repaymentRef = doc(db, "organizations", organizationId, "repayments", repaymentId);

  return await runTransaction(db, async (transaction) => {
    const repaymentSnap = await transaction.get(repaymentRef);
    if (!repaymentSnap.exists()) throw new Error("Repayment not found.");

    const repayment = repaymentSnap.data();

    if (repayment.status === "Approved") return { alreadyApproved: true };
    if (repayment.status !== "Pending") throw new Error("Only pending repayments can be approved.");

    const loanRef = doc(db, "organizations", organizationId, "loans", repayment.loanId);
    const loanSnap = await transaction.get(loanRef);

    if (!loanSnap.exists()) throw new Error("Associated loan not found.");

    const loan = loanSnap.data();

    if (
      repayment.organizationId !== organizationId ||
      loan.organizationId !== organizationId ||
      repayment.memberUid !== loan.userId ||
      loan.status !== "Approved"
    ) {
      throw new Error("Repayment does not match an active loan in this organization.");
    }

    const remaining = Number(loan.remainingBalance || 0);
    const amount = Number(repayment.amount || 0);

    if (!amount || amount <= 0) throw new Error("Invalid repayment amount.");

    if (amount > remaining) throw new Error("Repayment amount exceeds outstanding balance.");

    const approverRef = doc(db, "users", approverUid);
    const approverSnap = await transaction.get(approverRef);

    const approverName = approverSnap.exists() ? approverSnap.data().fullName || "Administrator" : "Administrator";

    const borrowerUserRef = doc(db, "users", loan.userId);
    const borrowerMemberRef = doc(db, "organizations", organizationId, "members", loan.userId);
    const [borrowerUserSnap, borrowerMemberSnap] = await Promise.all([
      transaction.get(borrowerUserRef),
      transaction.get(borrowerMemberRef),
    ]);

    if (!borrowerUserSnap.exists() || !borrowerMemberSnap.exists()) {
      throw new Error("Borrower financial profile was not found.");
    }

    // Update repayment record
    transaction.update(repaymentRef, {
      status: "Approved",
      approvedAt: serverTimestamp(),
      approvedBy: approverUid,
      approvedByName: approverName,
    });

    // Update loan balances
    const newAmountRepaid = Number(loan.amountRepaid || 0) + amount;
    const newRemaining = Math.max(0, remaining - amount);

    const loanUpdates = {
      amountRepaid: newAmountRepaid,
      remainingBalance: newRemaining,
    };

    if (newRemaining === 0) {
      loanUpdates.status = "Paid";
      loanUpdates.paidAt = serverTimestamp();
    }

    transaction.update(loanRef, loanUpdates);

    // Compatibility fields are kept in sync, while the loan document remains
    // the authoritative source for balances displayed by the application.
    transaction.update(borrowerUserRef, {
      loanBalance: Math.max(0, Number(borrowerUserSnap.data().loanBalance || 0) - amount),
    });
    transaction.update(borrowerMemberRef, {
      loanBalance: Math.max(0, Number(borrowerMemberSnap.data().loanBalance || 0) - amount),
    });

    return { approved: true };
  });
}

export async function rejectRepayment({ organizationId, repaymentId, approverUid }) {
  if (!organizationId || !repaymentId) throw new Error("Organization ID and repayment ID are required.");
  if (!approverUid) throw new Error("Approver UID is required.");

  const repaymentRef = doc(db, "organizations", organizationId, "repayments", repaymentId);

  return await runTransaction(db, async (transaction) => {
    const repaymentSnap = await transaction.get(repaymentRef);
    if (!repaymentSnap.exists()) throw new Error("Repayment not found.");

    const repayment = repaymentSnap.data();

    if (repayment.status !== "Pending") return { alreadyFinalized: true };

    const approverRef = doc(db, "users", approverUid);
    const approverSnap = await transaction.get(approverRef);

    const approverName = approverSnap.exists() ? approverSnap.data().fullName || "Administrator" : "Administrator";

    transaction.update(repaymentRef, {
      status: "Rejected",
      rejectedAt: serverTimestamp(),
      rejectedBy: approverUid,
      rejectedByName: approverName,
    });

    return { rejected: true };
  });
}

export async function getLoanRepayments({ organizationId, loanId }) {
  if (!organizationId || !loanId) return [];

  const ref = collection(db, "organizations", organizationId, "repayments");
  const q = query(ref, where("loanId", "==", loanId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
