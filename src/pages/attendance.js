
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function todayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Attendance({ navigate }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading camera...");

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        setMessage("Loading face models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);

        if (cancelled) return;

        setMessage("Opening camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setReady(true);
        setMessage("Camera Ready! Look at the camera.");
      } catch (error) {
        if (!cancelled) {
          setMessage("Error: " + error.message);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  async function markAttendance() {
    if (!ready || loading) return;

    setLoading(true);
    setMessage("Scanning your face...");

    try {
      const students = JSON.parse(
        localStorage.getItem("attendai_students") || "[]"
      );

      const enrolledStudents = students.filter(
        s =>
          Array.isArray(s.faceDescriptor) &&
          s.faceDescriptor.length === 128
      );

      if (enrolledStudents.length === 0) {
        setMessage("No faces enrolled. Enroll student face first.");
        return;
      }

      const faces = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (faces.length !== 1) {
        setMessage("Please show exactly one face.");
        return;
      }

      const scannedFace = faces[0].descriptor;

      let matchedStudent = null;
      let smallestDistance = Infinity;

      enrolledStudents.forEach(student => {
        const distance = faceapi.euclideanDistance(
          scannedFace,
          new Float32Array(student.faceDescriptor)
        );

        if (distance < smallestDistance) {
          smallestDistance = distance;
          matchedStudent = student;
        }
      });

      if (!matchedStudent || smallestDistance >= 0.45) {
        setMessage("Face not recognized. Attendance not saved.");
        return;
      }

      const date = todayDate();

      const closedDates = JSON.parse(
        localStorage.getItem("attendai_closed_dates") || "[]"
      );

      if (closedDates.includes(date)) {
        setMessage("Today's attendance is already closed.");
        return;
      }

      const records = JSON.parse(
        localStorage.getItem("attendai_records") || "[]"
      );

      const alreadyPresent = records.some(
        record =>
          String(record.studentId) === String(matchedStudent.id) &&
          record.date === date &&
          record.status === "Present"
      );

      if (alreadyPresent) {
        setMessage(`${matchedStudent.name} is already Present today.`);
        return;
      }

      const newRecord = {
        id: Date.now().toString(),
        studentId: matchedStudent.id,
        name: matchedStudent.name,
        roll: matchedStudent.roll,
        date: date,
        time: new Date().toLocaleTimeString(),
        status: "Present"
      };

      localStorage.setItem(
        "attendai_records",
        JSON.stringify([...records, newRecord])
      );

      setMessage(`${matchedStudent.name} - Present marked successfully!`);
      alert(`${matchedStudent.name} marked Present!`);

    } catch (error) {
      setMessage("Attendance Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-card">
      <h1>Face Recognition Attendance</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "15px",
          background: "#020617"
        }}
      />

      <p>{message}</p>

      <button
        onClick={markAttendance}
        disabled={!ready || loading}
      >
        {loading ? "Scanning..." : "Mark Attendance"}
      </button>

      <button onClick={() => navigate("reports")}>
        View Reports
      </button>

      <button onClick={() => navigate("dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}
