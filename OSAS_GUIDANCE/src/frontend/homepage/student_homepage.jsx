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

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [violationHistory, setViolationHistory] = useState([]);

  const rawStudent = localStorage.getItem("student");
  let studentData = {};

  try {
    studentData = rawStudent ? JSON.parse(rawStudent) : {};
  } catch {
    studentData = {};
  }

  const studentNumber = studentData.student_number || null;
  const fallbackName = studentData.student_name || "Student";

  // ------------------ FETCH STUDENT RECORD ------------------
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

  // ------------------ FETCH SUMMARY ------------------
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

  // ------------------ FETCH FULL VISIT HISTORY ------------------
  async function openHistoryModal() {
    try {
      const res = await fetch(`http://localhost:5000/violations/history/${studentNumber}`);
      const data = await res.json();

      setViolationHistory(data || []);
      setHistoryModalOpen(true);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }

  // ------------------ LOGOUT ------------------
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
      {/* ------------------ SIDEBAR ------------------ */}
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
          <button
            onClick={() => setActivePage("Info")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all duration-150 ${
              activePage === "Info" ? "bg-green-600 shadow-inner" : "hover:bg-gray-700/60"
            }`}
          >
            <Squares2X2Icon className="w-5 h-5 text-white" />
            <span className="font-medium">Student Dashboard</span>
          </button>
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

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="flex-1 flex flex-col">
        <header className="w-full h-16 bg-[#1f2937] text-white shadow-md flex items-center justify-between px-6 border-b border-gray-700"></header>

        <section className="p-8 overflow-auto h-[calc(100vh-4rem)]">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            Welcome, {studentRecord?.student_name || fallbackName}
          </h2>

          {/* ------------------ DASHBOARD CARDS ------------------ */}
          <div className="grid grid-cols-4 gap-6">
            
            {/* CLICKABLE VISITS BOX */}
            <div
              className="p-6 bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition"
              onClick={openHistoryModal}
            >
              <h3 className="text-xl font-semibold text-gray-700">Visits</h3>
              <p className="text-3xl font-bold mt-2">{visits}</p>
              <p className="text-sm text-green-600 mt-1">(Click to view history)</p>
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

      {/* ------------------ VISIT HISTORY MODAL ------------------ */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="w-[550px] bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Visit History</h2>

            <div className="max-h-80 overflow-auto border rounded-lg p-3 bg-gray-50">
              {violationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No visit history found.</p>
              ) : (
                violationHistory.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg shadow mb-3 border border-gray-200"
                  >
                    <p className="font-semibold text-gray-800">{item.predicted_violation}</p>
                    <p className="text-sm text-gray-600">Section: {item.predicted_section}</p>
                    <p className="text-sm text-gray-600">
                      Date: {item.violation_date || "—"}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setHistoryModalOpen(false)}
              className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
