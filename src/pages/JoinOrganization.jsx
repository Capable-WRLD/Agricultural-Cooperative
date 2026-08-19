import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  findOrganizationByCode,
  joinOrganization,
} from "../services/organizationService";

import "../styles/JoinOrganization.css";
import { toast } from "react-toastify";

function JoinOrganization() {

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [organizationCode, setOrganizationCode] = useState("");
  const [organization, setOrganization] = useState(null);

  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);

  // Search Organization
  const searchOrganization = async () => {

    if (!organizationCode.trim()) {
      toast.error("Please enter Organization Code");
      return;
    }

    try {

      setSearching(true);

      const result = await findOrganizationByCode(
        organizationCode.toUpperCase()
      );

      if (!result) {

        toast.error("Organization not found.");

        setOrganization(null);

      } else {

        setOrganization(result);

        toast.success("Organization Found!");

      }

    } catch (error) {

      console.log(error);

      toast.error("Error searching organization.");

    } finally {

      setSearching(false);

    }

  };

  // Join Organization
  const handleJoin = async () => {

    try {

      setJoining(true);

      const user = auth.currentUser;

      if (!user) {
        toast.error("Please login first.");
        return;
      }

      await joinOrganization(organization, user);

      await refreshUser();

      toast.success("Successfully joined organization!");

      navigate("/member");

    } catch (error) {

      console.log(error);

      toast.error(error.message);

    } finally {

      setJoining(false);

    }

  };

  return (

    <div className="join-page">

      <div className="join-container">

        <div className="join-left">

          <span className="join-badge">
            🌾 AgroCoop
          </span>

          <h1>Join a Cooperative</h1>

          <p>
            Enter the cooperative code given by your administrator.
          </p>

          <div className="search-box">

            <input
              type="text"
              placeholder="Organization Code"
              value={organizationCode}
              onChange={(e)=>
                setOrganizationCode(
                  e.target.value.toUpperCase()
                )
              }
            />

            <button
              onClick={searchOrganization}
              disabled={searching}
            >

              {searching
                ? "Searching..."
                : "Search"}

            </button>

          </div>

          {organization && (

            <div className="organization-card">

              <h3>
                {organization.organizationName}
              </h3>

              <p>

                <strong>Code:</strong>

                {" "}

                {organization.organizationCode}

              </p>

              <p>

                <strong>Type:</strong>

                {" "}

                {organization.organizationType}

              </p>

              <p>

                <strong>State:</strong>

                {" "}

                {organization.state}

              </p>

              <p>

                <strong>LGA:</strong>

                {" "}

                {organization.lga}

              </p>

              <button
                className="join-btn"
                onClick={handleJoin}
                disabled={joining}
              >

                {joining
                  ? "Joining..."
                  : "Join Organization"}

              </button>

            </div>

          )}

        </div>

        <div className="join-right">

          <div className="join-illustration">

            🌾👨‍🌾

            <h2>
              Become a Member
            </h2>

            <p>

              Join your cooperative and start saving,
              applying for loans and managing your finances.

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default JoinOrganization;
