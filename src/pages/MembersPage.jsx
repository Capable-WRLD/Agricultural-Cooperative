import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/MembersPage.css";

import { auth, db } from "../firebase";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

function MembersPage() {
  const [search, setSearch] = useState("");

  // Temporary data
  const [organizationName, setOrganizationName] = useState("");
const [organizationCode, setOrganizationCode] = useState("");

  const [pendingRequests, setPendingRequests] = useState([]);
const [approvedMembers, setApprovedMembers] = useState([]);
const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
  loadOrganization();
  }, []);

const loadOrganization = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) return;

    const userData = userDoc.data();

    setOrganizationName(userData.organizationName || "");
    setOrganizationCode(userData.organizationCode || "");

    // Load members
    const membersRef = collection(
      db,
      "organizations",
      userData.organizationId,
      "members"
    );

    setMembersLoading(true);

    try {
      const snapshot = await getDocs(membersRef);

      const membersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setApprovedMembers(membersData);
    } catch (error) {
      console.error("Error loading approved members:", error);
    } finally {
      setMembersLoading(false);
    }
  } catch (error) {
    console.log(error);
  }
};

  const copyCode = () => {
    navigator.clipboard.writeText(organizationCode);
    alert("Cooperative Code Copied!");
  };

  return (
    <div className="container-fluid">
      <div className="row">

        <div className="col-md-2">
          <Sidebar />
        </div>

        <div className="col-md-10 members-page">

          {/* Header */}

          <div className="members-header">

            <div>

              <h2>👥 Members Management</h2>

              <p>
                Manage membership requests and approved cooperative members.
              </p>

            </div>

          </div>

          {/* Organization Card */}

          <div className="organization-card mt-4">

            <h3>{organizationName}</h3>

            <p className="mt-3">
              Cooperative Code
            </p>

            <h1 className="organization-code">
              {organizationCode}
            </h1>

            <button
              className="btn btn-success mt-3"
              onClick={copyCode}
            >
              📋 Copy Cooperative Code
            </button>

            <p className="mt-3 text-light">
              Share this code with farmers.
              They will use it to request to join your cooperative.
            </p>

          </div>

          {/* Statistics */}

          <div className="row mt-4">

            <div className="col-md-4">

              <div className="member-stat-card">

                <h6>Total Members</h6>

                <h2>{approvedMembers.length}</h2>

              </div>

            </div>

            <div className="col-md-4">

              <div className="member-stat-card">

                <h6>Pending Requests</h6>

                <h2>{pendingRequests.length}</h2>

              </div>

            </div>

            <div className="col-md-4">

              <div className="member-stat-card">

                <h6>Active Members</h6>

                <h2>{approvedMembers.length}</h2>

              </div>

            </div>

          </div>

          {/* Search */}

          <div className="members-search mt-4">

            <input
              className="form-control"
              placeholder="🔍 Search approved members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* Pending Requests */}

          <div className="members-table mt-5">

            <h4 className="mb-4">
              Pending Membership Requests
            </h4>

            {pendingRequests.length === 0 ? (

              <div className="empty-members">

                <div className="empty-icon">
                  ⏳
                </div>

                <h3>No Pending Requests</h3>

                <p>
                  Farmers that request to join your cooperative
                  will appear here.
                </p>

              </div>

            ) : (

              <table className="table align-middle">

                <thead>

                  <tr>

                    <th>Name</th>

                    <th>Phone</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {pendingRequests.map((member) => (

                    <tr key={member.id}>

                      <td className="member-name">{member.fullName}</td>

                      <td>{member.phone}</td>

                      <td>

                        <button className="btn btn-success me-2">
                          Approve
                        </button>

                        <button className="btn btn-danger">
                          Reject
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

          {/* Approved Members */}

          <div className="members-table mt-5">

            <h4 className="mb-4">
              Approved Members
            </h4>

            {approvedMembers.length === 0 ? (

              <div className="empty-members">

                <div className="empty-icon">
                  👨‍🌾
                </div>

                <h3>No Approved Members Yet</h3>

                <p>
                  Once you approve farmers,
                  they will appear here.
                </p>

              </div>

            ) : (

              <table className="table align-middle">

                <thead>

                  <tr>

                    <th>Member</th>

                    <th>Phone</th>

                    <th>Savings</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {approvedMembers.map((member) => (

                    <tr key={member.id}>
                      <td>{member.fullName}</td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>{member.status}</td>
                      <td>{member.role}</td>
                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default MembersPage;