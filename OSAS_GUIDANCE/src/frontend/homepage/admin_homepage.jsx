import React, { useState, useEffect, useCallback } from "react";
import {
  ChartBarIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



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
  

  // auto-filled student info fetched from /student?query=
  const [studentInfo, setStudentInfo] = useState(null);
  const [autoFetchLoading, setAutoFetchLoading] = useState(false);

  // For Search → View modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Store violations fetched from backend
  const [violations, setViolations] = useState([]);

  

  // Sample chart data (you can later map real data)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  async function fetchRss() {
    setLoadingRss(true);
    try {
      const res = await fetch("http://localhost:5000/api/news");
      const data = await res.json();
      if (data.status === "ok") setRssItems(data.articles || []);
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
      setViolations(Array.isArray(data) ? data : []);
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
  if (
    !studentName ||
    !studentId ||
    !courseYearSection ||
    !gender ||
    !violationText ||
    !violationDate
  ) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill out all fields before submitting.",
    });
    return;
  }
// Convert YYYY-MM-DD → MM/DD/YY
if (!violationDate) {
  Swal.fire({
    icon: "warning",
    title: "Missing Date",
    text: "Please select a valid date.",
  });
  return;
}

const parts = violationDate.split("-");
if (parts.length !== 3) {
  Swal.fire({
    icon: "error",
    title: "Invalid Date",
    text: "Please enter date in YYYY-MM-DD format.",
  });
  return;
}

const formattedDate = `${parts[1]}/${parts[2]}/${parts[0].slice(2)}`; // "MM/DD/YY"

const newViolation = {
  student_name: studentName,
  student_id: parseInt(studentId, 10),
  course_year_section: courseYearSection,
  gender,
  violation_text: violationText,
  violation_date: formattedDate,
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
      // reset
      setStudentName("");
      setStudentId("");
      setCourseYearSection("");
      setGender("");
      setViolationText("");
      setViolationDate("");
      setStudentInfo(null);
      await fetchViolations(); // refresh list
    } else {
      Swal.fire({ icon: "error", title: "Error", text: data?.message || "Submission failed." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Failed to submit violation." });
  }
}


  // ------------------ View Student Info (opens modal) ------------------
  function viewStudentInfo(student) {

    setSelectedStudent(student);
    setShowStudentModal(true);
  }


  useEffect(() => {
    // Only attempt fetch if user typed something relevant
    const q = (studentId || studentName || "").toString().trim();
    if (!q) {
      setStudentInfo(null);
      return;
    }

    // don't attempt for very short input
    if (q.length < 2) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setAutoFetchLoading(true);
      try {
        // Prefer searching by student id if studentId is provided and numeric
        const queryParam = encodeURIComponent(q);
        const res = await fetch(`http://localhost:5000/student?query=${queryParam}`);
        if (!res.ok) {
          setStudentInfo(null);
          setAutoFetchLoading(false);
          return;
        }
        const data = await res.json(); // expected: { student_id, student_name, gender, course_year_section } or null
        if (!isCancelled) {
          if (data && Object.keys(data).length > 0) {
            setStudentInfo(data);
            // auto-fill the form fields with returned student data (but don't overwrite violation text/date)
            setStudentName((prev) => (prev && prev !== "" ? prev : data.student_name || ""));
            setStudentId((prev) => (prev && prev !== "" ? prev : String(data.student_id || "")));
            setGender((prev) => (prev && prev !== "" ? prev : data.gender || ""));
            setCourseYearSection((prev) =>
              prev && prev !== "" ? prev : data.course_year_section || ""
            );
          } else {
            setStudentInfo(null);
          }
        }
      } catch (err) {
        console.error("Auto-fetch student error:", err);
        if (!isCancelled) setStudentInfo(null);
      } finally {
        if (!isCancelled) setAutoFetchLoading(false);
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [studentId, studentName]);

  // ------------------ Derived: group violations by student id for quick lookups ------------------
  const violationsByStudent = React.useMemo(() => {
    const map = {};
    for (const v of violations) {
      const id = v.student_id ?? "unknown";
      if (!map[id]) map[id] = [];
      map[id].push(v);
    }
    return map;
  }, [violations]);

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
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const filtered = violations.filter((v) => {
              if (!query) return true;
              const q = query.toLowerCase();
              return (
                (v.student_name || "").toLowerCase().includes(q) ||
                String(v.student_id || "").includes(q) ||
                (v.violation_text || "").toLowerCase().includes(q)
              );
            });

            if (filtered.length === 0) {
              return (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No results found. Type to search...
                  </td>
                </tr>
              );
            }

            const formatDate = (dateStr) => {
              if (!dateStr) return "";
              const date = new Date(dateStr);
              const mm = String(date.getMonth() + 1).padStart(2, "0");
              const dd = String(date.getDate()).padStart(2, "0");
              const yy = String(date.getFullYear()).slice(-2);
              return `${mm}/${dd}/${yy}`;
            };

            return filtered.map((v, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-3 px-4">{v.student_id}</td>
                <td className="py-3 px-4">{v.student_name}</td>
                <td className="py-3 px-4">{v.gender}</td>
                <td className="py-3 px-4">{v.course_year_section}</td>
                <td className="py-3 px-4">
                  <div className="max-w-xl truncate">{v.violation_text}</div>
                </td>
                <td className="py-3 px-4">{formatDate(v.violation_date)}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewStudentInfo(v)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ));
          })()}
        </tbody>
      </table>
    </div>
  </div>
)}


        {/* Encode Violation Section */}
        {activePage === "violation" && (
          <div className="space-y-0">
            {/* Button to open modal */}
            <div className="mb-6">
              <button
                onClick={() => setShowViolationModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Encode New Violation
              </button>
            </div>
          {/* Violation Modal */}
            {showViolationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Full-screen solid black overlay */}
                <div className="absolute inset-0 bg-black opacity-70"></div>

                              {/* Modal content */}
                <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
                  <button
                    onClick={() => {
                      setShowViolationModal(false);
                      setStudentInfo(null);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Encode Student Violation
                  </h3>
                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter student full name"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                          <input
                            type="number"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Enter student ID"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course/Year/Section</label>
                          <input
                            type="text"
                            value={courseYearSection}
                            onChange={(e) => setCourseYearSection(e.target.value)}
                            placeholder="Enter Course/Year/Section"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
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
                      </div>

                      {/* Auto-fetch indicator */}
                      {autoFetchLoading && (
                        <p className="text-sm text-gray-500 mb-3">Looking up student record…</p>
                      )}
                      {studentInfo && (
                        <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded">
                          <p className="text-sm text-green-800">
                            Found student: <strong>{studentInfo.student_name}</strong> (ID: {studentInfo.student_id})
                          </p>
                          <p className="text-sm text-green-700">Gender: {studentInfo.gender}</p>
                          <p className="text-sm text-green-700">CYS: {studentInfo.course_year_section}</p>
                        </div>
                      )}

                      {/* Violation Text */}
                      <div className="mb-4">
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

                      {/* Date (auto-filled to current date) */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                       <input
                          type="date"
                          value={violationDate}
                           className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          onChange={(e) => setViolationDate(e.target.value)}
                        />

                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowViolationModal(false);
                            setStudentInfo(null);
                          }}
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

                {/* Violation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {violations.length === 0 ? (
                    <p className="text-gray-500 col-span-full">No violation records yet.</p>
                  ) : (
                    violations.map((v, idx) => {
  // Format violation date to MM/DD/YY
  const date = new Date(v.violation_date);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const formattedDate = `${mm}/${dd}/${yy}`;

  return (
    <div
      key={idx}
      className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => viewStudentInfo(v)}
    >
      <p className="font-semibold text-gray-700 text-lg mb-2">
        {v.student_name} (ID: {v.student_id})
      </p>
      <p className="text-gray-600 mb-1">Gender: {v.gender}</p>
      <p className="text-gray-600 mb-1">CYS: {v.course_year_section}</p>
      <p className="text-gray-600 mb-2">Violation: {v.violation_text}</p>
      <p className="text-sm text-gray-400">Date: {formattedDate}</p>
    </div>
  );
})
                  )}
                </div>
              </div>
            )}

          {/* Student Info Modal (from Search -> View) */}
          {showStudentModal && selectedStudent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 relative">
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    setSelectedStudent(null);
                  }}
                  className="absolute top-4 right-4 text-gray-600 hover:text-black"
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-700 mb-4">Student Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium">{selectedStudent.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedStudent.student_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{selectedStudent.gender}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Course/Year/Section</p>
                    <p className="font-medium">{selectedStudent.course_year_section}</p>
                  </div>
                </div>

                <hr className="my-4" />

                <h3 className="text-lg font-semibold mb-2">All Violations for this Student</h3>

                <div className="space-y-3 max-h-64 overflow-auto pr-2">
                  {violationsByStudent[selectedStudent.student_id] &&
                  violationsByStudent[selectedStudent.student_id].length > 0 ? (
                    violationsByStudent[selectedStudent.student_id]
                      .slice()
                      .reverse()
                      .map((v, idx) => (
                        <div key={idx} className="p-3 border rounded">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{v.violation_date}</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="whitespace-pre-wrap text-gray-700">
                                {v.violation_text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500">No violations recorded for this student.</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowStudentModal(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
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
