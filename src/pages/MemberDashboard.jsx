import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function MemberDashboard() {
  const [loading, setLoading] = useState(true);

  const [member, setMember] = useState({
    fullName: "",
    organizationName: "",
    organizationCode: "",
    email: "",
    phone: "",
    savings: 0,
    loanBalance: 0,
  });

  useEffect(() => {
    loadMemberDashboard();
  }, []);

  const loadMemberDashboard = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const userData = userSnap.data();

      setMember({
        fullName: userData.fullName || "Member",
        organizationName:
          userData.organizationName || "No Organization",
        organizationCode:
          userData.organizationCode || "",
        email: userData.email || "",
        phone: userData.phone || "",
        savings: userData.savings || 0,
        loanBalance: userData.loanBalance || 0,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">

        <div className="col-md-2">
          <Sidebar />
        </div>

        <div className="col-md-10 page-container">

          <h2 className="mb-4">
            🌾 {member.organizationName}
          </h2>

          <div className="glass-card p-4 mb-4">

            <h3>
              Welcome, {member.fullName}
            </h3>

            <p className="mt-2">
              Cooperative Code:
              <strong> {member.organizationCode}</strong>
            </p>

            <p>Email: {member.email}</p>

            <p>Phone: {member.phone}</p>

          </div>

          <div className="row">

            <div className="col-md-6">

              <div className="glass-card p-4">

                <h5>💰 Total Savings</h5>

                <h2 className="text-success mt-3">
                  ₦{Number(member.savings).toLocaleString()}
                </h2>

              </div>

            </div>

            <div className="col-md-6">

              <div className="glass-card p-4">

                <h5>🏦 Loan Balance</h5>

                <h2 className="text-warning mt-3">
                  ₦{Number(member.loanBalance).toLocaleString()}
                </h2>

              </div>

            </div>

          </div>

          <div className="glass-card p-4 mt-4">

            <h4>Member Activities</h4>

            <p>
              • View Savings
            </p>

            <p>
              • Apply for Loans
            </p>

            <p>
              • View Loan History
            </p>

            <p>
              • Update Profile
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MemberDashboard;