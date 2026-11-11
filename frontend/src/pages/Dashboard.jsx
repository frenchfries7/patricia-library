import { useEffect, useMemo, useState } from "react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { fmtTime } from "../utils/format";
import "./Attendance.css";
import "./Dashboard.css";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12
    ? "Good Morning!"
    : h < 18
      ? "Good Afternoon!"
      : "Good Evening!";
};

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalAttendance: 0,
    totalTimeOut: 0,
    activeAttendance: 0,
  });
  const [records, setRecords] = useState([]);

  useEffect(() => {
    Promise.all([
      apiRequest(ENDPOINTS.attendanceSummary),
      apiRequest(ENDPOINTS.attendanceToday),
    ])
      .then(([s, t]) => {
        setSummary(s);
        setRecords(t.attendanceRecords || []);
      })
      .catch(console.error);
  }, []);

  const perService = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key =
        r.libraryService?.serviceName || r.libraryService?.name || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const max = perService[0]?.[1] || 1;

  return (
    <div className="dash">
      <section className="dash-hero">
        <div>
          <h2>{greeting()}</h2>
          <p>
            Welcome to Patricia Public Library
            <br />
            Read, Learn, and Grow Together.
          </p>
        </div>
        <div className="dash-stats">
          <div className="stat-card">
            <span>Today's Attendance</span>
            <strong>{summary.totalAttendance}</strong>
          </div>
          <div className="stat-card">
            <span>Currently Inside</span>
            <strong>{summary.activeAttendance}</strong>
          </div>
          <div className="stat-card">
            <span>Timed Out</span>
            <strong>{summary.totalTimeOut}</strong>
          </div>
        </div>
      </section>

      <div className="dash-grid">
        <section className="panel">
          <h3 className="panel-title">Today per Library Service</h3>
          <div className="panel-body">
            {perService.length === 0 && (
              <p className="muted">No attendance today.</p>
            )}
            {perService.map(([name, count]) => (
              <div key={name} className="bar-row">
                <span className="bar-label">{name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3 className="panel-title">Recent Check-Ins</h3>
          <div className="panel-body table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 8).map((r) => (
                  <tr key={r._id}>
                    <td>{fmtTime(r.timeIn)}</td>
                    <td>
                      {r.member?.firstName} {r.member?.lastName}
                    </td>
                    <td>
                      {r.libraryService?.serviceName ||
                        r.libraryService?.name ||
                        "N/A"}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty">
                      No attendance today{" "}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
