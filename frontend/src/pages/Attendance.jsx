import { useEffect, useState, useCallback } from "react";
import {
  Search,
  IdCard,
  UserRound,
  LogOut as OutIcon,
  Printer,
} from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { fmtTime } from "../utils/format";
import DailyPrintSheet from "../components/DailyPrintSheet";
import "./Attendance.css";

export default function Attendance() {
  const [mode, setMode] = useState("card"); // "card" | "name"
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [member, setMember] = useState(null);

  const [services, setServices] = useState([]);
  const [picked, setPicked] = useState({}); // { [serviceId]: subService }

  const [records, setRecords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadToday = useCallback(async () => {
    try {
      const data = await apiRequest(ENDPOINTS.attendanceToday);
      setRecords(data.attendanceRecords || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadToday();
    apiRequest(ENDPOINTS.services)
      .then((d) => setServices(d.services || []))
      .catch(console.error);
  }, [loadToday]);

  const resetForm = () => {
    setQuery("");
    setMatches([]);
    setMember(null);
    setPicked({});
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setFeedback(null);
    setMatches([]);
    setMember(null);
    setPicked({});
    setBusy(true);

    try {
      if (mode === "card") {
        const res = await apiRequest(
          `${ENDPOINTS.members}/${encodeURIComponent(q.toUpperCase())}`,
        );
        setMember(res.data);
      } else {
        const res = await apiRequest(ENDPOINTS.membersSearch, {
          params: { q },
        });
        if (res.data.length === 1) setMember(res.data[0]);
        else setMatches(res.data);
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const toggleService = (service) => {
    setPicked((prev) => {
      const next = { ...prev };
      if (service._id in next) delete next[service._id];
      else next[service._id] = "";
      return next;
    });
  };

  const setSub = (serviceId, sub) =>
    setPicked((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] === sub ? "" : sub,
    }));

  const handleTimeIn = async () => {
    const ids = Object.keys(picked);
    if (!member || ids.length === 0) return;

    setBusy(true);
    setFeedback(null);

    const results = await Promise.allSettled(
      ids.map((id) =>
        apiRequest(ENDPOINTS.timeIn, {
          method: "POST",
          body: {
            memberId: member._id,
            libraryServiceId: id,
            activity: picked[id],
          },
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    const okCount = results.length - failed.length;

    if (failed.length === 0) {
      setFeedback({
        type: "success",
        text: `${member.firstName} ${member.lastName} — time-in recorded (${okCount} service${okCount > 1 ? "s" : ""}).`,
      });
      resetForm();
    } else {
      setFeedback({
        type: "error",
        text: failed.map((f) => f.reason.message).join(" "),
      });
    }

    await loadToday();
    setBusy(false);
  };

  const handleTimeOut = async (attendanceId) => {
    try {
      await apiRequest(ENDPOINTS.timeOut, {
        method: "POST",
        body: { attendanceId },
      });
      loadToday();
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  return (
    <div className="att-page">
      <div className="no-print att-content">
        {/* STEP 1: hanapin ang client */}
        <section className="panel">
          <h3 className="panel-title">1. Find Client</h3>
          <div className="panel-body">
            <div className="mode-toggle">
              <button
                className={mode === "card" ? "on" : ""}
                onClick={() => setMode("card")}
              >
                <IdCard size={16} /> Library Card Number
              </button>
              <button
                className={mode === "name" ? "on" : ""}
                onClick={() => setMode("name")}
              >
                <UserRound size={16} /> Name
              </button>
            </div>

            <form className="checkin-form" onSubmit={handleSearch}>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "card" ? "e.g. LIB-2026-001" : "e.g. Juan Dela Cruz"
                }
              />
              <button type="submit" disabled={busy}>
                <Search size={16} /> Search
              </button>
            </form>

            {feedback && (
              <div className={`feedback ${feedback.type}`}>{feedback.text}</div>
            )}

            {matches.length > 0 && (
              <ul className="match-list">
                {matches.map((m) => (
                  <li key={m._id}>
                    <span>
                      {m.firstName} {m.lastName}{" "}
                      <small>{m.libraryNumber}</small>
                    </span>
                    <button
                      onClick={() => {
                        setMember(m);
                        setMatches([]);
                      }}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {member && (
              <div className="member-card">
                <strong>
                  {member.firstName} {member.lastName}
                </strong>
                <span>{member.libraryNumber}</span>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: services + time in */}
        {member && (
          <section className="panel">
            <h3 className="panel-title">2. Select Service(s) & Time In</h3>
            <div className="panel-body">
              <div className="service-grid">
                {services.map((s) => (
                  <button
                    key={s._id}
                    className={`service-card ${s._id in picked ? "on" : ""}`}
                    onClick={() => toggleService(s)}
                  >
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>

              {services
                .filter((s) => s._id in picked && s.subServices?.length > 0)
                .map((s) => (
                  <div key={s._id} className="sub-block">
                    <p>{s.name}:</p>
                    <div className="sub-services">
                      {s.subServices.map((sub) => (
                        <button
                          key={sub}
                          className={picked[s._id] === sub ? "on" : ""}
                          onClick={() => setSub(s._id, sub)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              <button
                className="timein-btn"
                disabled={busy || Object.keys(picked).length === 0}
                onClick={handleTimeIn}
              >
                Time In
              </button>
            </div>
          </section>
        )}

        {/* Today's attendance */}
        <section className="panel">
          <h3 className="panel-title att-title-row">
            <span>Today's Attendance ({records.length})</span>
            <button className="print-btn" onClick={() => window.print()}>
              <Printer size={16} /> Print Today's Attendance
            </button>
          </h3>
          <div className="panel-body table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time In</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Time Out</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty">
                      Wala pang attendance ngayon.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{fmtTime(r.timeIn)}</td>
                    <td>
                      {r.member?.firstName} {r.member?.lastName}
                      <small className="muted">
                        {" "}
                        {r.member?.libraryNumber}
                      </small>
                    </td>
                    <td>
                      {r.libraryService?.name}
                      {r.activity ? ` · ${r.activity}` : ""}
                    </td>
                    <td>
                      {r.timeOut ? (
                        fmtTime(r.timeOut)
                      ) : (
                        <button
                          className="out-btn"
                          onClick={() => handleTimeOut(r._id)}
                        >
                          <OutIcon size={14} /> Time Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DailyPrintSheet records={records} />
    </div>
  );
}
