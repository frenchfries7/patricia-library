import { useState } from "react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import "./Attendance.css";
import "./Management.css";

export default function Settings() {
  const { user } = useAuth();
  console.log("LOGGED IN USER:", user);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (form.newPassword.length < 8) {
      return setFeedback({
        type: "error",
        text: "Ang bagong password ay dapat 8 characters pataas.",
      });
    }
    if (form.newPassword !== form.confirm) {
      return setFeedback({
        type: "error",
        text: "Hindi magkapareho ang bagong password at confirmation.",
      });
    }

    setSaving(true);
    try {
      await apiRequest(ENDPOINTS.changePassword, {
        method: "PUT",
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      setFeedback({ type: "success", text: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap">
      <section className="panel">
        <h3 className="panel-title">My Account</h3>
        <div className="panel-body">
          <div className="profile-grid">
            <div>
              <span>Full Name</span>
              <strong>{user?.fullName}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong style={{ textTransform: "capitalize" }}>
                {user?.role}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Change Password</h3>
        <div className="panel-body">
          <form className="narrow" onSubmit={submit}>
            {feedback && (
              <div
                className={`feedback ${feedback.type}`}
                style={{ marginBottom: "1rem" }}
              >
                {feedback.text}
              </div>
            )}
            <div className="field">
              <label>Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={set("currentPassword")}
                required
              />
            </div>
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={set("newPassword")}
                required
              />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Password"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
