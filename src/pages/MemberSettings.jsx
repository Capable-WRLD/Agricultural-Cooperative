import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "../styles/MemberSettings.css";

function MemberSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", phone: "", email: "" });

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            fullName: data.fullName || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        { fullName: profile.fullName.trim(), phone: profile.phone.trim() },
        { merge: true }
      );
      toast.success("Profile updated.");
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="member-settings-page">
        <Sidebar />
        <div className="member-settings-loading">
          <div className="spinner-border text-success" role="status"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-settings-page">
      <Sidebar />

      <main className="member-settings-content">
        <div className="member-settings-card glass-card">
          <h2>Account Settings</h2>

          <div className="form-group">
            <label>Full name</label>
            <input
              className="form-control"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              className="form-control"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={profile.email} disabled />
          </div>

          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => window.location.replace('/member')}>Cancel</button>
            <button className="btn btn-success" onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MemberSettings;
