import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "./Attendance.css";
import "./Management.css";

const LIMIT = 15;

export default function Clients() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | { member? }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (q) {
        const res = await apiRequest(ENDPOINTS.membersSearch, {
          params: { q },
        });
        setMembers(res.data);
        setPages(1);
        setTotal(res.count);
      } else {
        const res = await apiRequest(ENDPOINTS.members, {
          params: { page, limit: LIMIT },
        });
        setMembers(res.data);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      if (err.status === 404) {
        setMembers([]);
        setPages(1);
        setTotal(0);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
  };

  const handleDelete = async (m) => {
    if (
      !window.confirm(
        `Delete ${m.firstName} ${m.lastName} (${m.libraryNumber})? Hindi na ito mababawi.`,
      )
    )
      return;
    try {
      await apiRequest(
        `${ENDPOINTS.membersDelete}/${encodeURIComponent(m.libraryNumber)}`,
        {
          method: "DELETE",
        },
      );
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const initials = (m) =>
    `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="page-wrap">
      <section className="panel">
        <h3 className="panel-title">Clients {total > 0 && `(${total})`}</h3>
        <div className="panel-body">
          <div className="toolbar">
            <form onSubmit={handleSearch}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search by name..."
              />
              <button className="btn btn-primary" type="submit">
                <Search size={16} /> Search
              </button>
              {q && (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setInput("");
                    setQ("");
                    setPage(1);
                  }}
                >
                  Clear
                </button>
              )}
            </form>
            <button className="btn btn-primary" onClick={() => setModal({})}>
              <Plus size={16} /> Add Client
            </button>
          </div>

          {error && <div className="feedback error">{error}</div>}
        </div>

        <div className="table-wrap" style={{ maxHeight: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Library Card No.</th>
                <th>Age</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && members.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    Walang nahanap na client.
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="name-cell">
                      {m.profilePicture ? (
                        <img className="avatar" src={m.profilePicture} alt="" />
                      ) : (
                        <div className="avatar">{initials(m)}</div>
                      )}
                      {m.lastName}, {m.firstName}
                    </div>
                  </td>
                  <td>{m.libraryNumber}</td>
                  <td>{m.age ?? "—"}</td>
                  <td>
                    <span className={`badge ${m.membershipStatus}`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => setModal({ member: m })}
                      >
                        <Pencil size={15} />
                      </button>
                      {user?.role === "admin" && (
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => handleDelete(m)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!q && (
          <div className="pager">
            <span>
              Page {page} of {pages}
            </span>
            <div>
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-ghost"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {modal && (
        <Modal
          title={modal.member ? "Edit Client" : "Add Client"}
          onClose={() => setModal(null)}
        >
          <MemberForm
            member={modal.member}
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

function MemberForm({ member, onDone, onCancel }) {
  const editing = Boolean(member);
  const [form, setForm] = useState({
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    age: member?.age || "",
    membershipStatus: member?.membershipStatus || "active",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setPhoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await apiRequest(
          `${ENDPOINTS.membersUpdate}/${encodeURIComponent(member.libraryNumber)}`,
          { method: "PUT", body: { ...form, age: Number(form.age) } },
        );
      } else {
        const fd = new FormData();
        fd.append("firstName", form.firstName);
        fd.append("lastName", form.lastName);
        fd.append("age", form.age);
        if (photo) fd.append("profilePicture", photo);
        await apiRequest(ENDPOINTS.membersCreate, { method: "POST", body: fd });
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
        <label>First Name</label>
        <input value={form.firstName} onChange={set("firstName")} required />
      </div>
      <div className="field">
        <label>Last Name</label>
        <input value={form.lastName} onChange={set("lastName")} required />
      </div>
      <div className="field">
        <label>Age</label>
        <input
          type="number"
          min="1"
          max="120"
          value={form.age}
          onChange={set("age")}
          required
        />
      </div>

      {editing && (
        <div className="field">
          <label>Membership Status</label>
          <select
            value={form.membershipStatus}
            onChange={set("membershipStatus")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {!editing && (
        <div className="field">
          <label>Photo (optional)</label>
          <div className="photo-row">
            {preview && (
              <img className="photo-preview" src={preview} alt="Preview" />
            )}
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhoto}
            />
          </div>
          <small>Sa phone/tablet, bubuksan nito ang camera.</small>
        </div>
      )}

      {!editing && <small> Automatic Library Number</small>}

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
