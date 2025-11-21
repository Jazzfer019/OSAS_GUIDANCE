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

  // Login Fields
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password Modal visibility
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Forgot Password Fields
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");

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

  // LOGIN FUNCTION
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
          navigate("/student_home");
        });
      } else if (res.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Invalid Credentials",
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
        text: "Unable to connect to server",
      });
    }
  };

  // SUBMIT FORGOT PASSWORD
  const handleForgotPassword = () => {
    if (!email || !newPass) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please complete the form",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Password Reset",
      text: "Your password has been updated",
      confirmButtonColor: "#22c55e",
    });

    setShowForgotModal(false);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex overflow-hidden">

      {/* ---------------- FORGOT PASSWORD MODAL ---------------- */}
      {showForgotModal && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-80 shadow-lg animate-fadein">

              {/* Warning Icon + Title */}
              <div className="flex items-center justify-center mb-4 space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-yellow-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a1.71 1.71 0 001.47 2.57h17.42A1.71 1.71 0 0022.18 18L13.71 3.86a1.71 1.71 0 00-2.97 0z"
                  />
                </svg>

                <h2 className="text-xl font-bold text-gray-700">
                  Reset Password
                </h2>
              </div>

              <label className="font-semibold text-gray-700">CVSU Email</label>
              <input
                type="email"
                placeholder="Enter your CVSU email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-green-500"
              />

              <label className="font-semibold text-gray-700">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-green-500"
              />

              <div className="flex justify-between mt-2">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  onClick={handleForgotPassword}
                >
                  Submit
                </button>
              </div>

            </div>
          </div>
        )}

      {/* -------------------------------------------------------- */}

      {/* LEFT SIDE */}
      <div className="w-full md:w-[55%] h-full flex flex-col items-center justify-center p-6 bg-white">

        <img src="/cvsu-logo.png" alt="CvSU Logo"
          className="w-24 md:w-32 h-24 md:h-32 mb-4" />

        <h2 className="text-base md:text-xl font-medium">Cavite State University Naic</h2>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Guidance Student Record</h1>

        <div className="w-full max-w-xs space-y-3 text-left">

          {/* Student Number */}
          <label className="font-medium text-gray-700">Student Number</label>
          <input
            type="number"
            placeholder="Enter your student number"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="border p-3 rounded-full w-full focus:ring-2 focus:ring-green-500"
          />

          {/* Password */}
          <label className="font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded-full w-full pr-10 focus:ring-2 focus:ring-green-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* ⭐ FORGOT PASSWORD BUTTON (OPEN MODAL) */}
          <p
            className="text-sm text-green-600 font-semibold cursor-pointer hover:underline text-right -mt-1"
            onClick={() => setShowForgotModal(true)}
          >
            Forgot Password?
          </p>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold"
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

