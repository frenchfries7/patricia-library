import { useMemo } from "react";
import { fmtDateLong, fmtTime } from "../utils/format";
import "../styles/print.css";

export default function DailyPrintSheet({ records }) {
  const totals = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = r.libraryService?.name || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [records]);

  return (
    <div className="print-only print-sheet">
      <h1>Patricia Public Library</h1>
      <p className="print-sub">Daily Attendance — {fmtDateLong()}</p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Time In</th>
            <th>Library Card No.</th>
            <th>Client Name</th>
            <th>Service</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          {[...records].reverse().map((r, i) => (
            <tr key={r._id}>
              <td>{i + 1}</td>
              <td>{fmtTime(r.timeIn)}</td>
              <td>{r.member?.libraryNumber}</td>
              <td>
                {r.member?.firstName} {r.member?.lastName}
              </td>
              <td>
                {r.libraryService?.name}
                {r.activity ? ` — ${r.activity}` : ""}
              </td>
              <td>{fmtTime(r.timeOut)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Summary per Library Service</h3>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {totals.map(([name, count]) => (
            <tr key={name}>
              <td>{name}</td>
              <td className="num">{count}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Total Attendance Entries</strong>
            </td>
            <td className="num">
              <strong>{records.length}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
