import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage2() {
  const words = ["TRUTH", "EXCELLENCE", "SERVICE", "EQUALITY"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

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

        <div className="mt-8 flex flex-col items-center space-y-4 w-full max-w-xs">
          <p className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">
            Welcome, STUDENT
          </p>
            <button
            onClick={() => navigate("/student_register")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg md:text-xl py-3 mt-5 rounded-full shadow-md"
          >
            CREATE STUDENT ACCOUNT
          </button>
        
          <button
            onClick={() => navigate("/student_login")}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg md:text-xl py-3 rounded-full shadow-md"
          >
            LOGIN STUDENT ACCOUNT
          </button>
        </div>
      </div>
    

      {/* RIGHT SIDE - only visible on desktop */}
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
