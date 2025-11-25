import React, { useState, useEffect } from "react";
import {ChartBarIcon, NewspaperIcon, MagnifyingGlassIcon, PencilSquareIcon,ArrowRightOnRectangleIcon, UserCircleIcon,} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";

export default function AdminHome() {
  const [activePage, setActivePage] = useState("trends");
  const [query, setQuery] = useState("");
  const [rssItems, setRssItems] = useState([]);
  const [loadingRss, setLoadingRss] = useState(false);

  // Violation form state
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseYearSection, setCourseYearSection] = useState("");
  const [gender, setGender] = useState("");
  const [violationText, setViolationText] = useState("");
  const [violationDate, setViolationDate] = useState("");
  const [showViolationModal, setShowViolationModal] = useState(false);

  // Store violations fetched from backend
  const [violations, setViolations] = useState([]);

  // Sample chart data
  const chartData = [
    { month: "Jan", cases: 0 },
    { month: "Feb", cases: 0 },
    { month: "Mar", cases: 0 },
    { month: "Apr", cases: 0 },
    { month: "May", cases: 0 },
    { month: "Jun", cases: 0 },
  ];

  const menuItems = [
    { id: "trends", label: "View Trends", icon: ChartBarIcon },
    { id: "news", label: "News Management", icon: NewspaperIcon },
    { id: "search", label: "Search Student", icon: MagnifyingGlassIcon },
    { id: "violation", label: "Encode Violation", icon: PencilSquareIcon },
  ];

  // ------------------ Fetch News ------------------
  useEffect(() => {
    if (activePage === "news") fetchRss();
  }, [activePage]);

  async function fetchRss() {
    setLoadingRss(true);
    try {
      const res = await fetch("http://localhost:5000/api/news");
      const data = await res.json();
      if (data.status === "ok") setRssItems(data.articles);
      else setRssItems([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setRssItems([]);
    } finally {
      setLoadingRss(false);
    }
  }

  // ------------------ Fetch Violations ------------------
  useEffect(() => {
    fetchViolations();
  }, []);

  async function fetchViolations() {
    try {
      const res = await fetch("http://localhost:5000/violations");
      const data = await res.json();
      setViolations(data);
    } catch (err) {
      console.error("Error fetching violations:", err);
      setViolations([]);
    }
  }

  // ------------------ Logout ------------------
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
        }).then(() => (window.location.href = "/"));
      }
    });
  }

  // ------------------ Submit Violation ------------------
  async function handleSubmitViolation() {
    if (!studentName || !studentId || !courseYearSection || !gender || !violationText || !violationDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill out all fields before submitting.",
      });
      return;
    }

    const newViolation = {
      student_name: studentName,
      student_id: parseInt(studentId),
      course_year_section: courseYearSection,
      gender,
      violation_text: violationText,
      violation_date: violationDate,
    };

    try {
      const res = await fetch("http://localhost:5000/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newViolation),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Submitted",
          text: "Violation record submitted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        setShowViolationModal(false);
        setStudentName("");
        setStudentId("");
        setCourseYearSection("");
        setGender("");
        setViolationText("");
        setViolationDate("");
        fetchViolations(); // refresh list
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to submit violation." });
    }
  }

  // ------------------ Render ------------------
  return (
    <div className="w-screen h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1f2937] text-white flex flex-col py-6 shadow-xl border-r border-gray-800">
        <div className="flex items-center gap-3 px-4 mb-8">
          <img
            src="/cvsu-logo.png"
            alt="logo"
            className="w-11 h-11 rounded-md object-cover shadow-sm border border-gray-700"
          />
          <div>
            <h1 className="text-lg font-semibold">GUIDANCE OFFICE</h1>
            <p className="text-xs text-gray-300">CvSU — Admin</p>
          </div>
        </div>

        <nav className="px-3 flex-1">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all ${
                    activePage === item.id ? "bg-green-600 shadow-inner" : "hover:bg-gray-700/60"
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="px-4 mt-auto pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="w-full h-16 bg-[#1f2937] text-white shadow-md flex items-center justify-between px-6">
          <div></div>
          <UserCircleIcon className="w-10 h-10 text-gray-300" />
        </header>

        <section className="p-8 overflow-auto h-[calc(100vh-4rem)]">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            {activePage === "trends" && "Behavioral Trends"}
            {activePage === "news" && "News Management"}
            {activePage === "search" && "Search Students"}
            {activePage === "violation" && "Encode Violation (NLP)"}
          </h2>

          {/* Trends */}
          {activePage === "trends" && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Monthly Behavioral Case Trends
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-gray-500 text-sm mt-3">
                Waiting for database connection… (currently shows zero)
              </p>
            </div>
          )}

          {/* News */}
          {activePage === "news" && (
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
              {loadingRss && <p>Loading news…</p>}
              {!loadingRss && rssItems.length === 0 && <p>No news to show.</p>}
              {!loadingRss &&
                rssItems.map((item, idx) => (
                  <div key={idx} className="border-b pb-6 last:border-b-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-green-600 hover:underline"
                    >
                      {item.title || "No title"}
                    </a>
                    {item.source && (
                      <p className="text-sm text-gray-400 mt-1">Source: {item.source}</p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Search Students */}
          {activePage === "search" && (
            <div className="space-y-6">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search student by name or ID..."
                  className="w-full pl-4 pr-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Course/Year/Section</th>
                      <th className="py-3 px-4">Violation</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.filter(v =>
                      v.student_name.toLowerCase().includes(query.toLowerCase()) ||
                      v.student_id.toString().includes(query)
                    ).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500 ">
                          No results found. Type to search...
                        </td>
                      </tr>
                    ) : (
                      violations.filter(v =>
                        v.student_name.toLowerCase().includes(query.toLowerCase()) ||
                        v.student_id.toString().includes(query)
                      ).map((v, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-3 px-4">{v.student_id}</td>
                          <td className="py-3 px-4">{v.student_name}</td>
                          <td className="py-3 px-4">{v.gender}</td>
                          <td className="py-3 px-4">{v.course_year_section}</td>
                          <td className="py-3 px-4">{v.violation_text}</td>
                          <td className="py-3 px-4">{v.violation_date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Encode Violation */}
          {activePage === "violation" && (
            <div>
              <button
                onClick={() => setShowViolationModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Encode New Violation
              </button>
            </div>
          )}

          {showViolationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">
                <button
                  onClick={() => setShowViolationModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>

                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Encode Student Violation
                </h3>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student full name"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course/Year/Section
                  </label>
                  <input
                    type="text"
                    value={courseYearSection}
                    onChange={(e) => setCourseYearSection(e.target.value)}
                    placeholder="Enter Course/Year/Section"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Violation Description / Interview Text
                  </label>
                  <textarea
                    value={violationText}
                    onChange={(e) => setViolationText(e.target.value)}
                    placeholder="Write interview details or violation text…"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={5}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowViolationModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitViolation}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Violation
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
