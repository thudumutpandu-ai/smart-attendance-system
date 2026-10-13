
import React, { useState } from "react";

function todayDate() {
  const d = new Date();
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export default function Reports({ navigate }) {
  const [date, setDate] = useState(todayDate());
  const [version, setVersion] = useState(0);

  const students = JSON.parse(
    localStorage.getItem("attendai_students") || "[]"
  );

  const records = JSON.parse(
    localStorage.getItem("attendai_records") || "[]"
  );

  const closedDates = JSON.parse(
    localStorage.getItem("attendai_closed_dates") || "[]"
  );

  const closed = closedDates.includes(date);

  const report = students.map(student => {
    const record = records.find(
      r =>
        String(r.studentId) === String(student.id) &&
        r.date === date &&
        r.status === "Present"
    );

    return {
      ...student,
      attendanceStatus: record
        ? "Present"
        : closed
        ? "Absent"
        : "Not Marked",
      attendanceTime: record?.time || "--"
    };
  });

  const present = report.filter(
    s => s.attendanceStatus === "Present"
  ).length;

  const absent = report.filter(
    s => s.attendanceStatus === "Absent"
  ).length;

  const notMarked = report.filter(
    s => s.attendanceStatus === "Not Marked"
  ).length;

  function closeAttendance() {
    if (date > todayDate()) {
      alert("Cannot close a future date.");
      return;
    }

    const confirmClose = window.confirm(
      "Close attendance? Unmarked students will become Absent."
    );

    if (!confirmClose) return;

    localStorage.setItem(
      "attendai_closed_dates",
      JSON.stringify([...new Set([...closedDates, date])])
    );

    setVersion(version + 1);
  }

  return (
    <div className="reports">
      <h1>Attendance Reports</h1>

      <label>Select Date: </label>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Total Students</h3>
          <h2>{students.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Present</h3>
          <h2>{present}</h2>
        </div>

        <div className="stat-card">
          <h3>Absent</h3>
          <h2>{absent}</h2>
        </div>

        <div className="stat-card">
          <h3>Not Marked</h3>
          <h2>{notMarked}</h2>
        </div>
      </div>

      <p>Attendance Session: {closed ? "Closed" : "Open"}</p>

      {!closed && (
        <button onClick={closeAttendance}>
          Close Attendance & Mark Absent
        </button>
      )}

      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table
          border="1"
          cellPadding="12"
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr>
              <th>S.No</th>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {report.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.roll}</td>
                <td>{date}</td>
                <td>{student.attendanceTime}</td>
                <td
                  style={{
                    fontWeight: "bold",
                    color:
                      student.attendanceStatus === "Present"
                        ? "#6ee7b7"
                        : student.attendanceStatus === "Absent"
                        ? "#fda4af"
                        : "#fbbf24"
                  }}
                >
                  {student.attendanceStatus}
                </td>
              </tr>
            ))}

            {report.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No students added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
