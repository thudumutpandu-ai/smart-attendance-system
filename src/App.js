
import React, { useState } from "react";
import "./App.css";


import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Attendance from "./pages/attendance";
import Reports from "./pages/reports";
import FaceEnroll from "./pages/face enroll";
import Students from "./pages/student";




export default function App() {
  const [page, setPage] = useState("home");
  const [student, setStudent] = useState(null);
  const [enrollStudentId, setEnrollStudentId] = useState(null);

  function navigate(nextPage) {
    setPage(nextPage);
    window.scrollTo(0, 0);
  }

  function openFaceEnroll(studentId) {
    setEnrollStudentId(studentId);
    navigate("faceEnroll");
  }

  function logout() {
    setStudent(null);
    navigate("login");
  }

  return (
    <div className="app">
      <header className="navbar">
        <h2 onClick={() => navigate("home")}>
          ✦ AttendAI
        </h2>

        <nav>
          <button onClick={() => navigate("home")}>
            Home
          </button>

          {student ? (
            <>
              <button onClick={() => navigate("dashboard")}>
                Dashboard
              </button>

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("login")}>
                Login
              </button>

              <button onClick={() => navigate("register")}>
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {page === "home" && (
          <Home navigate={navigate} />
        )}

        {page === "login" && (
          <Login
            navigate={navigate}
            onLogin={setStudent}
          />
        )}

        {page === "register" && (
          <Register navigate={navigate} />
        )}

        {page === "dashboard" && (
          <Dashboard
            student={student}
            navigate={navigate}
            onLogout={logout}
          />
        )}

        {page === "students" && (
          <Students
            navigate={navigate}
            onEnroll={openFaceEnroll}
          />
        )}

        {page === "faceEnroll" && (
          <FaceEnroll
            studentId={enrollStudentId}
            navigate={navigate}
          />
        )}

        {page === "attendance" && (
          <Attendance
            student={student}
            navigate={navigate}
          />
        )}

        {page === "reports" && (
          <Reports
            student={student}
            navigate={navigate}
          />
        )}
      </main>
    </div>
  );
}
