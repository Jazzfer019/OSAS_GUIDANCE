import React, { useState, useEffect } from "react";
import { Squares2X2Icon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

export default function StudentHome() {
  const [activePage, setActivePage] = useState("Info");
  const [studentRecord, setStudentRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const [violation, setViolation] = useState("—");
  const [section, setSection] = useState("—");
  const [lastVisit, setLastVisit] = useState("—");
  const [visits, setVisits] = useState(0);

  const rawStudent = localStorage.getItem("student");
  let studentData = {};

  try {
    studentData = rawStudent ? JSON.parse(rawStudent) : {};
  } catch {
    studentData = {};
  }

  const studentNumber = studentData.student_number || null;
  const fallbackName = studentData.student_name || "Student";
  
  useEffect(() => {
    if (!studentNumber) {
      setLoading(false);
      return;
    }
    if (activePage !== "Info") return;

    setLoading(true);

    fetch(`http://localhost:5000/students/by-number/${studentNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentRecord(data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setLoading(false);
      });
  }, [activePage, studentNumber]);

  useEffect(() => {
    if (!studentNumber) return;

    async function fetchSummary() {
      try {
        const res = await fetch(`http://localhost:5000/violations/summary/${studentNumber}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        setViolation(data.predicted_violation ?? "—");
        setSection(data.predicted_section ?? "—");
        setLastVisit(data.violation_date ?? "—");
        setVisits(data.visits ?? 0);

      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    }

    fetchSummary();
  }, [studentNumber]);

  function handleLogout() {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Logged out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        }).then(() => {
          localStorage.removeItem("student");
          window.location.href = "/";
        });
      }
    });
  }

  return (
    <div className="w-screen h-screen flex bg-gray-100 overflow-hidden">
      <aside className="w-64 bg-[#1f2937] text-white flex flex-col py-6 shadow-xl border-r border-gray-800">
        
        <div className="flex items-center gap-3 px-4 mb-8">
          <img
            src="/cvsu-logo.png"
            alt="logo"
            className="w-11 h-11 rounded-md object-cover shadow-sm border border-gray-700"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-wide">GUIDANCE OFFICE</h1>
            <p className="text-xs text-gray-300">CvSU — Student</p>
          </div>
        </div>

        <nav className="px-3 flex-1">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActivePage("Info")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all duration-150 ${
                activePage === "Info" ? "bg-green-600 shadow-inner" : "hover:bg-gray-700/60"
              }`}
            >
              <Squares2X2Icon className="w-5 h-5 text-white" />
              <span className="font-medium">Student Dashboard</span>
            </button>
          </div>
        </nav>

        <div className="px-4 mt-auto pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-150"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="w-full h-16 bg-[#1f2937] text-white shadow-md flex items-center justify-between px-6 border-b border-gray-700">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-400 shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                <path d="M4.5 20.25a8.25 8.25 0 0115 0v.75H4.5v-.75z" />
              </svg>
            </div>
          </div>
        </header>

        <section className="p-8 overflow-auto h-[calc(100vh-4rem)]">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            Welcome, {studentRecord?.student_name || fallbackName}
          </h2>

          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-700">Visits</h3>
              <p className="text-3xl font-bold mt-2">{visits}</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-700">Last Visit</h3>
              <p className="text-3xl font-bold mt-2">{lastVisit}</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-700">Violation</h3>
              <p className="text-3xl font-bold mt-2">{violation}</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-700">Section</h3>
              <p className="text-3xl font-bold mt-2">{section}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
