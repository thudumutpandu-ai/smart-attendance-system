import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function Register({ navigate }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    password: "",
  });

  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (step !== 2) return;

    let cancelled = false;

    async function setupCamera() {
      try {
        setReady(false);
        setMessage("Loading face recognition models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        if (cancelled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
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
        setMessage("Camera ready. Look straight at the camera.");
      } catch (error) {
        if (!cancelled) {
          setMessage("Camera/model error: " + error.message);
        }
      }
    }

    setupCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [step]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function nextStep(e) {
    e.preventDefault();

    const students = JSON.parse(
      localStorage.getItem("attendai_students") || "[]"
    );

    if (
      students.some(
        (s) =>
          s.email.toLowerCase() === form.email.trim().toLowerCase() ||
          s.roll === form.roll.trim()
      )
    ) {
      setMessage("Email or roll number already registered.");
      return;
    }

    setStep(2);
  }

  async function enrollFace() {
    if (!ready || !videoRef.current) return;

    try {
      setMessage("Scanning face...");

      const faces = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (faces.length !== 1) {
        setMessage("Please show exactly one face to the camera.");
        return;
      }

      const students = JSON.parse(
        localStorage.getItem("attendai_students") || "[]"
      );

      const descriptor = Array.from(faces[0].descriptor);

      const alreadyEnrolled = students.some((s) => {
        if (!s.faceDescriptor) return false;

        return (
          faceapi.euclideanDistance(
            descriptor,
            new Float32Array(s.faceDescriptor)
          ) < 0.45
        );
      });

      if (alreadyEnrolled) {
        setMessage("This face is already enrolled.");
        return;
      }

      const newStudent = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        roll: form.roll.trim(),
        email: form.email.trim(),
        password: form.password,
        faceDescriptor: descriptor,
      };

      localStorage.setItem(
        "attendai_students",
        JSON.stringify([...students, newStudent])
      );

      alert("Face enrollment successful!");
      navigate("login");
    } catch (error) {
      setMessage("Enrollment failed: " + error.message);
    }
  }

  return (
    <div className="page-card">
      <h2>Student Registration</h2>

      {step === 1 ? (
        <form onSubmit={nextStep}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="roll"
            placeholder="Roll Number"
            value={form.roll}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Next: Enroll Face</button>
        </form>
      ) : (
        <div>
          <h3>Enroll Your Face</h3>

          <p>
            Student: {form.name} ({form.roll})
          </p>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 12,
            }}
          />

          <p>{message}</p>

          <button disabled={!ready} onClick={enrollFace}>
            Capture & Enroll Face
          </button>

          <button onClick={() => setStep(1)}>
            Back
          </button>
        </div>
      )}

      {step === 1 && <p>{message}</p>}
    </div>
  );
}