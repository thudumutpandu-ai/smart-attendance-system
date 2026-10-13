import React from "react";

export default function Home({ navigate }) {
  return (
    <div style={{ padding: "80px 25px", textAlign: "center" }}>
      <h1>Welcome to AttendAI</h1>
      <h2>Smart Face Recognition Attendance System</h2>

      <p>
        Manage student attendance with AI-powered face recognition.
        Fast, simple and easy to use.
      </p>

      <button onClick={() => navigate("register")}>
        Get Started
      </button>

      <button
        onClick={() => navigate("login")}
        style={{ marginLeft: 15 }}
      >
        Login
      </button>
    </div>
  );
}