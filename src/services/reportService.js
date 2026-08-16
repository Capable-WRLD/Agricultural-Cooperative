import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

// ============================================================
// GET ORGANIZATION REPORT DATA
// ============================================================

export async function getOrganizationReport(organizationId) {
  if (!organizationId) {
    throw new Error("Organization ID is required.");
  }

  // ----------------------------------------------------------
  // REFERENCES
  // ----------------------------------------------------------

  const membersRef = collection(
    db,
    "organizations",
    organizationId,
    "members"
  );

  const loansRef = collection(
    db,
    "organizations",
    organizationId,
    "loans"
  );

  const inventoryRef = collection(
    db,
    "organizations",
    organizationId,
    "inventory"
  );

  // ----------------------------------------------------------
  // LOAD DATA
  // ----------------------------------------------------------

  const [
    membersSnapshot,
    loansSnapshot,
    inventorySnapshot,
  ] = await Promise.all([
    getDocs(membersRef),
    getDocs(loansRef),
    getDocs(inventoryRef),
  ]);

  // ----------------------------------------------------------
  // MEMBERS
  // ----------------------------------------------------------

  const members = membersSnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // ----------------------------------------------------------
  // LOANS
  // ----------------------------------------------------------

  const loans = loansSnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // ----------------------------------------------------------
  // INVENTORY
  // ----------------------------------------------------------

  const inventory = inventorySnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // ----------------------------------------------------------
  // MEMBER SAVINGS
  // ----------------------------------------------------------

  const totalSavings = members.reduce(
    (total, member) => {
      return (
        total +
        Number(
          member.savings ||
          member.totalSavings ||
          member.balance ||
          0
        )
      );
    },
    0
  );

  // ----------------------------------------------------------
  // LOAN CALCULATIONS
  // ----------------------------------------------------------

  const totalLoans = loans.reduce(
    (total, loan) => {
      return (
        total +
        Number(loan.amount || 0)
      );
    },
    0
  );

  const approvedLoans = loans.filter(
    (loan) => loan.status === "Approved"
  );

  const pendingLoans = loans.filter(
    (loan) => loan.status === "Pending"
  );

  const rejectedLoans = loans.filter(
    (loan) => loan.status === "Rejected"
  );

  const approvedLoanAmount =
    approvedLoans.reduce(
      (total, loan) =>
        total + Number(loan.amount || 0),
      0
    );

  // ----------------------------------------------------------
  // INVENTORY CALCULATIONS
  // ----------------------------------------------------------

  const inventoryValue = inventory.reduce(
    (total, item) => {
      const quantity = Number(
        item.quantity || 0
      );

      const unitPrice = Number(
        item.unitPrice || 0
      );

      return total + quantity * unitPrice;
    },
    0
  );

  const lowStockItems = inventory.filter(
    (item) =>
      Number(item.quantity || 0) <=
      Number(item.minimumStock || 0)
  );

  // ----------------------------------------------------------
  // RETURN REPORT
  // ----------------------------------------------------------

  return {
    members,
    loans,
    inventory,

    summary: {
      totalMembers: members.length,

      totalSavings,

      totalLoans,

      approvedLoans: approvedLoans.length,

      approvedLoanAmount,

      pendingLoans: pendingLoans.length,

      rejectedLoans: rejectedLoans.length,

      inventoryItems: inventory.length,

      inventoryValue,

      lowStockItems: lowStockItems.length,
    },
  };
}