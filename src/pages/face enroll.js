
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceEnroll({ studentId, navigate }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading...");
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const students = JSON.parse(
      localStorage.getItem("attendai_students") || "[]"
    );

    const selected = students.find((s) => s.id === studentId);
    setStudent(selected || null);

    if (!selected) {
      setMessage("Student not found.");
      return;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        setReady(false);
        setMessage("Loading face recognition models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);

        if (cancelled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setReady(true);
        setMessage("Camera ready! Look directly at the camera.");
      } catch (error) {
        if (!cancelled) {
          setMessage("Camera/model error: " + error.message);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [studentId]);

  async function enrollFace() {
    if (!ready || busy || !student) return;

    try {
      setBusy(true);
      setMessage("Scanning face...");

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
        setMessage("Show exactly one face to the camera.");
        return;
      }

      const descriptor = Array.from(faces[0].descriptor);

      const students = JSON.parse(
        localStorage.getItem("attendai_students") || "[]"
      );

      const duplicate = students.some((s) => {
        if (s.id === studentId || !s.faceDescriptor) return false;

        const distance = faceapi.euclideanDistance(
          new Float32Array(descriptor),
          new Float32Array(s.faceDescriptor)
        );

        return distance < 0.45;
      });

      if (duplicate) {
        setMessage(
          "This face looks like another enrolled student. Enrollment rejected."
        );
        return;
      }

      const updated = students.map((s) =>
        s.id === studentId
          ? { ...s, faceDescriptor: descriptor }
          : s
      );

      localStorage.setItem(
        "attendai_students",
        JSON.stringify(updated)
      );

      setMessage("Face enrolled successfully!");
      alert("Face enrolled for " + student.name);

      navigate("students");
    } catch (error) {
      setMessage("Enrollment error: " + error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!student) {
    return (
      <div className="page-card">
        <h2>Student not found</h2>
        <button onClick={() => navigate("students")}>
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="page-card">
      <h2>Face Enrollment</h2>

      <p>Student: {student.name}</p>
      <p>Roll Number: {student.roll}</p>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "14px",
          background: "#020617"
        }}
      />

      <p>{message}</p>

       <button  
        onClick={enrollFace}
        disabled={!ready || busy}
      >
        {busy ? "Scanning..." : "Capture & Enroll Face"}
      </button> 

      <button onClick={() => navigate("students")}>
        Back
      </button>
    </div>
  );
}



  