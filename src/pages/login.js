import React, { useState } from "react";

export default function Login({ navigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    const students = JSON.parse(
      localStorage.getItem("attendai_students") || "[]"
    );

    const student = students.find(
      (s) =>
        s.email.toLowerCase() === email.trim().toLowerCase() &&
        s.password === password
    );

    if (!student) {
      setError("Invalid email or password");
      return;
    }

    onLogin(student);
    navigate("dashboard");
  }

  return (
    <div className="page-card">
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "#ff8585" }}>{error}</p>}

      <p>
        New student?{" "}
        <button onClick={() => navigate("register")}>
          Register
        </button>
      </p>
    </div>
  );
}