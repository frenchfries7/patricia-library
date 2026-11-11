import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { apiRequest } from "../services/apiClient";
import { toInputDate } from "../utils/format";
import "./Attendance.css";
import "../styles/print.css";

export default function Reports() {
  const [from, setFrom] = useState(toInputDate());
  const [to, setTo] = useState(toInputDate());
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setError("");
    try {
      const data = await apiRequest(ENDPOINTS.attendanceReport, {
        params: { from, to },
      });
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err.message);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // I-group per service: { name, subtotal, rows: [{activity, count}] }
  const grouped = useMemo(() => {
    if (!report) return [];
    const map = {};
    report.breakdown.forEach((r) => {
      map[r.serviceName] ??= { name: r.serviceName, subtotal: 0, rows: [] };
      map[r.serviceName].subtotal += r.count;
      if (r.activity) map[r.serviceName].rows.push(r);
    });
    return Object.values(map);
  }, [report]);

  const rangeLabel = from === to ? from : `${from} to ${to}`;

  const table = (
    <table>
      <thead>
        <tr>
          <th>Library Service</th>
          <th className="num">Total</th>
        </tr>
      </thead>
      <tbody>
        {grouped.map((g) => (
          <FragmentRows key={g.name} group={g} />
        ))}
        {report && (
          <tr>
            <td>
              <strong>Grand Total</strong>
            </td>
            <td className="num">
              <strong>{report.total}</strong>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="att-page">
      <div className="no-print att-content">
        <section className="panel">
          <h3 className="panel-title att-title-row">
            <span>Attendance per Library Service</span>
            <button
              className="print-btn"
              onClick={() => window.print()}
              disabled={!report}
            >
              <Printer size={16} /> Print Report
            </button>
          </h3>
          <div className="panel-body">
            <div className="checkin-form">
              <label>
                From{" "}
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                To{" "}
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <button onClick={generate}>Generate</button>
            </div>
            {error && <div className="feedback error">{error}</div>}
          </div>
          <div className="panel-body table-wrap">{report && table}</div>
        </section>
      </div>

      {/* Print version */}
      {report && (
        <div className="print-only print-sheet">
          <h1>Patricia Public Library</h1>
          <p className="print-sub">
            Attendance per Library Service — {rangeLabel}
          </p>
          {table}
        </div>
      )}
    </div>
  );
}

function FragmentRows({ group }) {
  return (
    <>
      <tr>
        <td>
          <strong>{group.name}</strong>
        </td>
        <td className="num">
          <strong>{group.subtotal}</strong>
        </td>
      </tr>
      {group.rows.map((r) => (
        <tr key={r.activity}>
          <td style={{ paddingLeft: "2rem" }}>• {r.activity}</td>
          <td className="num">{r.count}</td>
        </tr>
      ))}
    </>
  );
}
