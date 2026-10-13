import React, { useState } from "react";

export default function Students({ navigate, onEnroll }) {
  const [students, setStudents] = useState(() =>
    JSON.parse(localStorage.getItem("attendai_students") || "[]")
  );

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [message, setMessage] = useState("");

  function addStudent(e) {
    e.preventDefault();

    const studentName = name.trim();
    const rollNumber = roll.trim();

    if (!studentName || !rollNumber) {
      setMessage("Please enter student name and roll number.");
      return;
    }

    if (students.some((s) => s.roll === rollNumber)) {
      setMessage("This roll number already exists.");
      return;
    }

    const newStudent = {
      id: crypto.randomUUID(),
      name: studentName,
      roll: rollNumber,
      faceDescriptor: null,
    };

    const updated = [...students, newStudent];

    localStorage.setItem(
      "attendai_students",
      JSON.stringify(updated)
    );

    setStudents(updated);
    setName("");
    setRoll("");
    setMessage("Student added successfully!");
  }

  return (
    <div className="dashboard">
      <h1>Student Management</h1>
      <p>Add and manage students.</p>

      <div className="page-card">
        <h2>Add New Student</h2>

        <form onSubmit={addStudent}>
          <input
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Roll Number"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            required
          />

          <button type="submit">Add Student</button>
        </form>

        <p>{message}</p>
      </div>

      <h2>Student List</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Face Enrollment</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.roll}</td>
                <td>
                    
  <button onClick={() => onEnroll(student.id)}>
    {student.faceDescriptor ? "Re-Enroll Face" : "Enroll Face"}
  </button>

                  {student.faceDescriptor
                    ? "Enrolled"
                    : "Not Enrolled"}
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td colSpan="4">No students added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={() => navigate("dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}