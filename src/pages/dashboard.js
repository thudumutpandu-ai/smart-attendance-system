import React from "react";

export default function Dashboard({ student, navigate, onLogout }) {
  if (!student) {
    return (
      <div className="page-card">
        <h2>Please login first</h2>
        <button onClick={() => navigate("login")}>Login</button>
      </div>
    );
  }

  const records = JSON.parse(
    localStorage.getItem("attendai_records") || "[]"
  );

  const myRecords = records.filter(
    (r) => r.studentId === student.id
  );

  const today = new Date().toLocaleDateString("en-CA");

  const todayMarked = myRecords.some(
    (r) => r.date === today
  );

  return (
    <div className="dashboard">
      <h1>Welcome, {student.name} 👋</h1>
      <p>Roll Number: {student.roll}</p>

      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Total Attendance</h3>
          <h1>{myRecords.length}</h1>
        </div>

        <div className="stat-card">
          <h3>Today's Status</h3>
          <h2>{todayMarked ? "Present" : "Not Marked"}</h2>
        </div>

        <div className="stat-card">
          <h3>Face Enrollment</h3>
          <h2>{student.faceDescriptor ? "Enrolled" : "Pending"}</h2>
        </div>
      </div>

      <button onClick={() => navigate("attendance")}>
        Mark Attendance
      </button>
      <button onClick={() => navigate("students")}>
  + Add Students
</button>

      <button onClick={() => navigate("reports")}>
        View Reports
      </button>

      <button onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}