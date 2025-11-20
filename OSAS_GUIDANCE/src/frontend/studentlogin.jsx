import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

export default function StudentLogin() {
  const words = ["TRUTH", "EXCELLENCE", "SERVICE", "EQUALITY"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Input states
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");

  // Fade-in effect for words
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 500);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Handle login
  const handleLogin = async () => {
    if (!studentNumber || !password) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please enter both student number and password",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_number: studentNumber,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: data.message,
          confirmButtonColor: "#22c55e",
        }).then(() => {
          navigate("/student_home"); // redirect to student dashboard/home
        });
      } else if (res.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Incorrect student number or password",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Something went wrong",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Could not connect to backend",
      });
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex overflow-hidden">
      {/* LEFT SIDE */}
      <div className="w-full md:w-[55%] h-full flex flex-col items-center justify-center p-6 md:p-8 text-center bg-white">
        <img
          src="/cvsu-logo.png"
          alt="School Logo"
          className="w-24 md:w-32 h-24 md:h-32 mb-4 md:mb-6"
        />
        <h2 className="text-base md:text-xl font-medium">Cavite State University Naic</h2>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Guidance Student Record</h1>

        {/* Student Icon + Title */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-800 -mt-1">Login Student Account</p>
        </div>

        {/* Student Form */}
        <div className="w-full max-w-xs space-y-3 text-left">
          <label className="text-gray-700 font-medium">Student Number</label>
          <input
            type="number"
            placeholder="Enter your student number"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="border p-3 rounded-full w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <label className="text-gray-700 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded-full w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold mt-1"
          >
            Login
          </button>

          <p className="text-center text-gray-600 mt-2">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/student_register")}
              className="text-green-600 font-semibold cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:block w-[100%] h-full relative">
        <img
          src="./cvsu-background.png"
          alt="Campus"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 p-10 text-white flex flex-col justify-between">
          <p className="text-2xl leading-relaxed font-semibold text-justify tracking-wide drop-shadow-lg max-w-3xl mx-auto mt-70 animate-fadein">
            Cavite State University - Naic (CvSU) is required by law to process
            your personal information and sensitive personal information in order
            to safeguard academic freedom, uphold your right to quality education,
            and protect your right to data privacy in conformity with Republic Act
            No. 10173.
          </p>

          <div
            className={`absolute bottom-10 right-10 text-5xl font-bold tracking-widest drop-shadow-md uppercase transition-all duration-1000 ease-in-out`}
            style={{
              opacity: fade ? 0.5 : 0,
              transform: fade ? "translateX(0)" : "translateX(20px)",
            }}
          >
            {words[index]}
          </div>
        </div>
      </div>
    </div>
  );
}
