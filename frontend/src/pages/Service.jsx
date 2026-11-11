import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "./Attendance.css";
import "./Management.css";

export default function Services() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | { service? }

  const load = useCallback(async () => {
    try {
      const data = await apiRequest(ENDPOINTS.services, {
        params: { all: "true" },
      });
      setServices(data.services || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (s) => {
    try {
      await apiRequest(`${ENDPOINTS.services}/${s._id}`, {
        method: "PUT",
        body: { isActive: !s.isActive },
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-wrap">
      <section className="panel">
        <h3 className="panel-title">Library Services</h3>
        <div className="panel-body">
          <div className="toolbar">
            <p className="muted" style={{ margin: 0 }}>
              Ang mga <strong>inactive</strong> na service ay hindi na lalabas
              sa Attendance.
            </p>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setModal({})}>
                <Plus size={16} /> Add Service
              </button>
            )}
          </div>

          {error && (
            <div className="feedback error" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <div className="svc-grid">
            {services.map((s) => (
              <div
                key={s._id}
                className={`svc-card ${s.isActive ? "" : "off"}`}
              >
                <div className="svc-head">
                  <h4>{s.name}</h4>
                  <span
                    className={`badge ${s.isActive ? "active" : "inactive"}`}
                  >
                    {s.isActive ? "active" : "inactive"}
                  </span>
                </div>

                {s.subServices?.length > 0 ? (
                  <div className="chips">
                    {s.subServices.map((sub) => (
                      <span key={sub} className="chip">
                        {sub}
                      </span>
                    ))}
                  </div>
                ) : (
                  <small className="muted" style={{ margin: 0 }}></small>
                )}

                {isAdmin && (
                  <div className="row-actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setModal({ service: s })}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => toggleActive(s)}
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {modal && (
        <Modal
          title={modal.service ? "Edit Service" : "Add Service"}
          onClose={() => setModal(null)}
        >
          <ServiceForm
            service={modal.service}
            onCancel={() => setModal(null)}
            onDone={() => {
              setModal(null);
              load();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function ServiceForm({ service, onDone, onCancel }) {
  const [name, setName] = useState(service?.name || "");
  const [subs, setSubs] = useState((service?.subServices || []).join("\n"));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const subServices = subs
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (service) {
        await apiRequest(`${ENDPOINTS.services}/${service._id}`, {
          method: "PUT",
          body: { name, subServices },
        });
      } else {
        await apiRequest(ENDPOINTS.services, {
          method: "POST",
          body: { name, subServices },
        });
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && (
        <div className="feedback error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="field">
        <label>Service Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Sub-services (optional)</label>
        <textarea
          rows="6"
          value={subs}
          onChange={(e) => setSubs(e.target.value)}
        />
        <small>Isang sub-service kada linya.</small>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
