import React, { useState, useEffect, useCallback } from "react";
import {ChartBarIcon,NewspaperIcon,MagnifyingGlassIcon,PencilSquareIcon,ArrowRightOnRectangleIcon,UserGroupIcon,UserCircleIcon,DocumentPlusIcon, XMarkIcon, EyeIcon, TrashIcon} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";

export default function AdminHome() {
  const [activePage, setActivePage] = useState("trends");
  const [query, setQuery] = useState("");
  const [rssItems, setRssItems] = useState([]);
  const [loadingRss, setLoadingRss] = useState(false);
  // Upload File State
const [currentGoodMoral, setCurrentGoodMoral] = useState(null);
const [currentRules, setCurrentRules] = useState(null);

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
  //dropdown
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  //filtered
   const [filterCategory, setFilterCategory] = useState("all"); // all, name, id, course, date, violation 

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest("header")) {
      setShowAccountDropdown(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);
  

  // Sample chart data (you can later map real data)
  const chartData = [
    { month: "Jan", cases: 0 },
    { month: "Feb", cases: 0 },
    { month: "Mar", cases: 0 },
    { month: "Apr", cases: 0 },
    { month: "May", cases: 0 },
    { month: "Jun", cases: 0 },
  ];

  //email
const [profilePicPreview, setProfilePicPreview] = useState(null);
const [user, setUser] = useState({ name: "", email: "", profile_pic:"" });

// Upload file to backend and return display info
const uploadFile = async (file, fileType) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    // Upload file to backend
    const res = await fetch("http://localhost:5000/file/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Server returned error:", res.status, text);
      throw new Error(`Upload failed: ${res.status}`);
    }

    const data = await res.json();

    // Prepare the file for display (immediate UI feedback)
    const displayFile = {
      id: data.file_id,
      name: file.name,
      fileType: fileType,
      stored: data.stored,
      original: data.original,
      url: `http://localhost:5000/file/download/${data.stored}`, // Backend URL for download
    };

    console.log("UPLOAD SUCCESS:", displayFile);

    // Show SweetAlert2 success toast
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "File uploaded successfully!",
      showConfirmButton: false,
      timer: 2000,
      toast: true,
      timerProgressBar: true,
    });

    // Optionally refresh the file list after upload
    await listFiles();

    return displayFile;
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert(`File upload failed: ${err.message}`);
    return null;
  }
};

// Function to list all uploaded files
const listFiles = async () => {
  try {
    const res = await fetch("http://localhost:5000/file/list");
    if (!res.ok) {
      const text = await res.text();
      console.error("Error fetching file list:", res.status, text);
      return;
    }

    const data = await res.json();
    if (data.status !== "success") {
      console.error("Backend error:", data.message);
      return;
    }

    const files = data.files;
    displayFiles(files); // Display the files in the UI
  } catch (err) {
    console.error("Error fetching file list:", err);
  }
};

// Function to display the files
const displayFiles = (files) => {
  const fileListContainer = document.getElementById("file-list");
  if (!fileListContainer) return;

  fileListContainer.innerHTML = ""; // Clear the current list

  files.forEach((file) => {
    const fileElement = document.createElement("div");
    fileElement.classList.add("file-item");
    fileElement.innerHTML = `
      <p><strong>${file.original}</strong> (${file.size_bytes} bytes)</p>
      <a href="${file.path || file.url}" download>Download</a>
    `;
    fileListContainer.appendChild(fileElement);
  });
};

useEffect(() => {
  const fetchSavedFiles = async () => {
    try {
      const res = await fetch("http://localhost:5000/file/list");
      if (!res.ok) return;

      const data = await res.json();
      if (data.status !== "success") return;

      // Assign previously uploaded files to state
      const goodMoralFile = data.files.find(f => f.file_type === "good_moral");
      const rulesFile = data.files.find(f => f.file_type === "rules");

      if (goodMoralFile) {
        setCurrentGoodMoral({
          name: goodMoralFile.original,
          url: `http://localhost:5000/file/download/${goodMoralFile.stored}`,
        });
      }

      if (rulesFile) {
        setCurrentRules({
          name: rulesFile.original,
          url: `http://localhost:5000/file/download/${rulesFile.stored}`,
        });
      }
    } catch (err) {
      console.error("Error fetching saved files:", err);
    }
  };

  fetchSavedFiles();
}, []);

//fetch user
useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:5000/admin/me?id=1"); 
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();

        // Adjust the profile_pic URL to include /admin if needed
        const profilePicUrl = data.profile_pic.includes("/admin/uploads/")
          ? data.profile_pic
          : data.profile_pic.replace("/uploads/", "/admin/uploads/");

        setUser({
          id: data.id,
          name: data.name || "Admin",
          email: data.email || "",
          profile_pic: profilePicUrl,
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;


//delete
async function handleDeleteViolation(v) {
  // Confirmation modal (center)
  Swal.fire({
    title: "Delete Violation",
    text: `Are you sure you want to delete the violation for ${v.student_name}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#16a34a",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/violations/${v.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // Show success toast in top-right
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Violation deleted successfully",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });

          // Remove from state immediately
          setViolations((prev) => prev.filter((vi) => vi.id !== v.id));
        } else {
          const data = await res.json();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data?.message || "Delete failed",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete violation",
        });
      }
    }
  });
}


//handle file
const handlePreviewFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf" || ["jpg","jpeg","png"].includes(ext)) {
      setPreviewFile(file); // opens modal below
    } else if (ext === "doc" || ext === "docx") {
      Swal.fire({
        icon: "info",
        title: "Preview not available",
        text: "DOC/DOCX files cannot be previewed. You can download them instead.",
        confirmButtonText: "Download",
      }).then(() => {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const closePreview = () => setPreviewFile(null);
  const [previewFile, setPreviewFile] = useState(null);

  const menuItems = [
    { id: "trends", label: "View Trends", icon: ChartBarIcon },
    { id: "records", label: "Students Record", icon: UserGroupIcon},
    { id: "search", label: "Students Violation", icon: MagnifyingGlassIcon },
    { id: "violation", label: "Encode Violation", icon: PencilSquareIcon },
    { id: "uploadFileFormat", label: "Upload File Format", icon: DocumentPlusIcon }, // updated icon
    { id: "news", label: "News Management", icon: NewspaperIcon },
    
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
      // ✅ Top-right toast
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Violation submitted successfully",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      setShowViolationModal(false);
      // reset fields
      setStudentName("");
      setStudentId("");
      setCourseYearSection("");
      setGender("");
      setViolationText("");
      setViolationDate("");
      setStudentInfo(null);

      await fetchViolations(); // refresh list
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data?.message || "Submission failed.",
      });
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
  const q = (studentId || studentName || "").toString().trim();
  if (!q || q.length < 2) {
    setStudentInfo(null);
    return;
  }

  let isCancelled = false;
  const timer = setTimeout(async () => {
    setAutoFetchLoading(true);
    try {
      const queryParam = encodeURIComponent(q);
      const res = await fetch(`http://localhost:5000/students/student?query=${queryParam}`);
      const data = await res.json(); // always JSON

      if (!isCancelled) {
        // Only fill if student found
        if (data.student) {
          setStudentInfo(data.student);
          setStudentName(prev => prev || data.student.student_name || "");
          setStudentId(prev => prev || String(data.student.student_id || ""));
        } else {
          setStudentInfo(null); // silent if not found
        }
      }
    } catch (err) {
      console.error("Auto-fetch student error:", err);
      if (!isCancelled) setStudentInfo(null); // silent on error
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

// ===================== STATE =====================
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(false);

// Modal state
const [showModal, setShowModal] = useState(false);

// Form state/
const [studentNumber, setStudentNumber] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [course, setCourse] = useState("");
const [enrollmentInfo, setEnrollmentInfo] = useState("");

// Modals for viewing, editing, deleting
const [viewStudent, setViewStudent] = useState(null);
const [editStudent, setEditStudent] = useState(null);
const [deleteStudent, setDeleteStudent] = useState(null);

// ===================== ADD STUDENT =====================
const handleAddStudent = () => {
  if (!studentName || !studentNumber || !email) {
    alert("Please fill all required fields");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    const newStudent = {
      id: students.length + 1, // or use uuid()
      student_name: studentName,
      student_number: studentNumber,
      email,
      phone,
      course,
      enrollment_info: enrollmentInfo,
    };

    setStudents([...students, newStudent]);

    // Clear form and close modal
    setStudentName("");
    setStudentNumber("");
    setEmail("");
    setPhone("");
    setCourse("");
    setEnrollmentInfo("");
    setShowModal(false);
    setLoading(false);
  }, 300);
};


// ===================== DELETE STUDENT =====================
const handleDeleteStudent = (student) => {
  setDeleteStudent(student);
};

const handleConfirmDelete = async () => {
  if (!deleteStudent) return;

  try {
    // DELETE request sa backend
    const res = await fetch(`http://localhost:5000/students/${deleteStudent.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete student");

    // Update front-end state
    setStudents((prev) =>
      prev.filter((s) => Number(s.id) !== Number(deleteStudent.id))
    );

    setDeleteStudent(null);

    // SweetAlert2 toast success
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Student deleted successfully",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to delete student!",
    });
  }
};

// ===================== VIEW STUDENT =====================
const handleViewStudent = (student) => {
  setViewStudent(student);
};


const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/students/all"); // adjust URL
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      Swal.fire("Error", "Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === "records") {
      fetchStudents();
    }
  }, [activePage]);

  
  // STATES

const [filteredStudents, setFilteredStudents] = useState([]);

// Recalculate filtered students when query or filter changes
useEffect(() => {
  const q = query.trim().toLowerCase();

  const result = students.filter((s) => {
    const name = (s.student_name || "").toLowerCase();
    const id = String(s.student_number || "");
    const course = (s.course || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const phone = String(s.phone || "");

    switch (filterCategory) {
      case "name": return name.includes(q);
      case "id": return id.includes(q);
      case "course": return course.includes(q);
      case "email": return email.includes(q);
      case "phone": return phone.includes(q);
      case "all":
      default:
        return (
          name.includes(q) ||
          id.includes(q) ||
          course.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
    }
  });

  setFilteredStudents(result);
}, [query, filterCategory, students]);


// Recalculate filtered students when query or filter changes
useEffect(() => {
  const q = query.trim().toLowerCase();

  const result = students.filter((s) => {
    const name = (s.student_name || "").toLowerCase();
    const id = String(s.student_number || "");
    const course = (s.course || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const phone = String(s.phone || "");

    switch (filterCategory) {
      case "name": return name.includes(q);
      case "id": return id.includes(q);
      case "course": return course.includes(q);
      case "email": return email.includes(q);
      case "phone": return phone.includes(q);
      case "all":
      default:
        return (
          name.includes(q) ||
          id.includes(q) ||
          course.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
    }
  });

  setFilteredStudents(result);
}, [query, filterCategory, students]);

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
 
     <main className="flex-1 flex flex-col">
     {/* Updated Header with Account Dropdown */}
      <header className="w-full h-16 bg-[#1f2937] text-white shadow-md flex items-center justify-between px-6 relative">
        <div></div>

      {/* USER ICON (TOP RIGHT) */}
  <div className="relative">

  {user.profile_pic && user.profile_pic !== "default.png" ? (
    <img
      src={
        typeof user.profile_pic === "string"
          ? user.profile_pic
          : URL.createObjectURL(user.profile_pic)
        }
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover cursor-pointer"
      onClick={() => setShowAccountDropdown((prev) => !prev)}
      onError={(e) => {
        e.target.src = ""; // clear broken image
        setUser((prev) => ({ ...prev, profile_pic: null })); // fallback to icon
      }}
    />
  ) : (
    <UserCircleIcon
      className="w-10 h-10 text-gray-300 cursor-pointer"
      onClick={() => setShowAccountDropdown((prev) => !prev)}
    />
  )}

  {/* DROPDOWN */}
  {showAccountDropdown && (
    <div
      id="account-dropdown"
      className="absolute right-0 mt-2 w-64 bg-[#1f2937] text-white rounded-xl shadow-lg overflow-hidden z-50"
    >
      <div className="p-4 flex flex-col items-center space-y-2">

        {/* DROPDOWN PROFILE PREVIEW */}
        <div className="relative">
          {profilePicPreview ||
          (user.profile_pic && user.profile_pic !== "default.png") ? (
            <img
              src={
                profilePicPreview ||
                (typeof user.profile_pic === "string"
                  ? user.profile_pic
                  : URL.createObjectURL(user.profile_pic))
              }
              alt="Profile"
              className="rounded-full w-16 h-16 object-cover"
              onError={(e) => {
                e.target.src = "";
                setUser((prev) => ({ ...prev, profile_pic: null }));
              }}
            />
          ) : (
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
          )}

          {/* UPLOAD BUTTON */}
          <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 border-2 border-white">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                setProfilePicPreview(URL.createObjectURL(file));

                const formData = new FormData();
                formData.append("profile_pic", file);
                formData.append("id", user.id);

                try {
                  const res = await fetch(
                    "http://localhost:5000/admin/upload_profile",
                    { method: "POST", body: formData }
                  );

                  const data = await res.json();
                  if (res.ok) {
                    setUser((prev) => ({
                      ...prev,
                      profile_pic: data.profile_pic,
                    }));
                  }
                } catch (err) {
                  console.error("Upload error:", err);
                }
              }}
            />
            <span className="text-white text-sm font-bold">+</span>
          </label>
        </div>
            {/* Email */}
            <p className="font-bold">Hi, Admin!</p>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
          </div>
                )}
          </div>
        </header>
        <section className="p-8 overflow-auto h-[calc(100vh-4rem)]">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            {activePage === "trends" && "Behavioral Trends"}
            {activePage === "records" && "Students Records"}
            {activePage === "search" && "Students Violation"}
            {activePage === "violation" && "Encode Violation (NLP)"}
            {activePage === "uploadFileFormat" && "Upload File Format"}
            {activePage === "news" && "News Management"}
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

                {/* Search Input + Category */}
                <div className="flex items-center space-x-2 max-w-xl">
                  {/* Search Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
                    />
                  </svg>

                  {/* Search Input */}
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search student..."
                    className="w-full pl-2 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  {/* Category Dropdown */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All</option>
                    <option value="name">Name</option>
                    <option value="id">ID</option>
                    <option value="course">Course</option>
                    <option value="violation">Violation</option>
                    <option value="date">Date</option>
                  </select>
                </div>

                {/* TABLE */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="w-full text-left">

                    {/* TABLE HEADERS */}
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        {(filterCategory === "all" || filterCategory === "id") && <th className="py-3 px-4">Student Number</th>}
                        {(filterCategory === "all" || filterCategory === "name") && <th className="py-3 px-4">Student Name</th>}
                        {(filterCategory === "all") && <th className="py-3 px-4">Gender</th>}
                        {(filterCategory === "all" || filterCategory === "course") && <th className="py-3 px-4">Course/Year/Section</th>}
                        {(filterCategory === "all" || filterCategory === "violation") && <th className="py-3 px-20">Description</th>}
                        {(filterCategory === "all") && <th className="py-3 px-4">Section</th>}
                        {(filterCategory === "all") && <th className="py-3 px-4">Violation</th>}
                        {(filterCategory === "all" || filterCategory === "date") && <th className="py-3 px-4">Date</th>}
                        <th className="py-3 px-10">Actions</th>
                      </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                      {(() => {
                        const filtered = violations.filter((v) => {
                          const q = (query || "").toLowerCase();
                          if (!q) return true;

                          const studentName = (v.student_name || "").toLowerCase();
                          const studentId = String(v.student_number || "");
                          const course = (v.course_year_section || "").toLowerCase();
                          const violationText = (v.violation_text || "").toLowerCase();
                          const dateStr = v.violation_date
                            ? new Date(v.violation_date).toLocaleDateString("en-US")
                            : "";

                          switch (filterCategory) {
                            case "name":
                              return studentName.includes(q);
                            case "id":
                              return studentId.includes(q);
                            case "course":
                              return course.includes(q);
                            case "violation":
                              return violationText.includes(q);
                            case "date":
                              return dateStr.includes(q);
                            case "all":
                            default:
                              return (
                                studentName.includes(q) ||
                                studentId.includes(q) ||
                                course.includes(q) ||
                                violationText.includes(q) ||
                                dateStr.includes(q)
                              );
                          }
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="9" className="text-center py-6 text-gray-500">
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
                            {(filterCategory === "all" || filterCategory === "id") && <td className="py-3 px-4">{v.student_id}</td>}
                            {(filterCategory === "all" || filterCategory === "name") && <td className="py-3 px-4">{v.student_name}</td>}
                            {(filterCategory === "all") && <td className="py-3 px-4">{v.gender}</td>}
                            {(filterCategory === "all" || filterCategory === "course") && <td className="py-3 px-4">{v.course_year_section}</td>}
                            {(filterCategory === "all" || filterCategory === "violation") && (
                              <td className="py-3 px-20 max-w-xs">
                                <span className="block truncate">
                                  {(v.violation_text || "").length > 15
                                    ? (v.violation_text || "").slice(0, 15) + "..."
                                    : v.violation_text || ""}
                                </span>
                              </td>
                            )}
                            {(filterCategory === "all") && <td className="py-3 px-4"></td>}
                            {(filterCategory === "all") && <td className="py-3 px-4"></td>}
                            {(filterCategory === "all" || filterCategory === "date") && <td className="py-3 px-1">{formatDate(v.violation_date)}</td>}

                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewStudentInfo(v)}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteViolation(v)}
                                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                  Delete
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
                          <input
                            type="number"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Enter student number"
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

                      {/* Violation Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                         Interview Text
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
                      {v.student_name} (Number: {v.student_id})</p>
                    <p className="text-gray-600 mb-1">Gender: {v.gender}</p>
                    <p className="text-gray-600 mb-1">CYS: {v.course_year_section}</p>

                    {/* DESCRIPTION (truncated to prevent overflow) */}
                    <p className="text-gray-600 mb-1 truncate max-w-full" title={v.violation_text}>
                     Admin Note: {v.violation_text}
                    </p>

                    {/* SECTION */}
                    <p className="text-gray-600 mb-1">Section: {v.section || "—"}</p>

                    {/* VIOLATION */}
                    <p className="text-gray-600 mb-2">Violation: {v.violation || "—"}</p>

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
                        
                        {/* CLOSE BUTTON */}
                        <button
                          onClick={() => {
                            setShowStudentModal(false);
                            setSelectedStudent(null);
                          }}
                          className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                          ✕
                        </button>

                        {/* TITLE */}
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Student Information</h2>

                        {/* BASIC STUDENT INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Student No.</p>
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

                        {/* 🔥 FULL DESCRIPTION FIELD */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Admin Note</p>
                          <textarea
                            readOnly
                            rows={3}
                            className="w-full border border-gray-300 rounded p-2"
                            value={selectedStudent.violation_text  || ""}
                          />
                        </div>

                        {/* 🔥 SECTION FIELD */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Section</p>
                          <input
                            readOnly
                            className="w-full border border-gray-300 rounded p-2"
                            value={selectedStudent.student  || "—"}
                          />
                        </div>

                        {/* 🔥 VIOLATION FIELD */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Violation</p>
                          <input
                            readOnly
                            className="w-full border border-gray-300 rounded p-2"
                            value={selectedStudent.student || "—"}
                          />
                        </div>

                        {/* 🔥 DATE OF VIOLATION (NEW) */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Date of Violation</p>
                          <input
                            readOnly
                            className="w-full border border-gray-300 rounded p-2"
                            value={
                              selectedStudent.violation_date
                                ? new Date(selectedStudent.violation_date).toLocaleDateString()
                                : "—"
                            }
                          />
                        </div>

                        {/* CLOSE BUTTON */}
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

                 {/* ===== Upload File Section ===== */}
                  {activePage === "uploadFileFormat" && (
                    <div className="flex flex-col items-center space-y-6">

                      {/* SIDE-BY-SIDE WRAPPER */}
                      <div className="w-full flex justify-center gap-6">

                        {/* Good Moral Certificate */}
                        <div className="bg-white shadow rounded-lg p-6 w-[500px] flex flex-col gap-4">
                          <h3 className="text-lg font-semibold text-center">Good Moral Certificate</h3>

                          {currentGoodMoral ? (
                            <div className="flex flex-col gap-4 w-full">
                              <div className="flex flex-col gap-2 border p-2 rounded">

                                <div className="flex items-center gap-3">
                                  {(() => {
                                    const ext = currentGoodMoral.name?.split(".").pop().toLowerCase();
                                    switch (ext) {
                                      case "pdf": return <span className="text-red-600 text-5xl">📄</span>;
                                      case "doc":
                                      case "docx": return <span className="text-blue-600 text-5xl">📝</span>;
                                      case "jpg":
                                      case "jpeg":
                                      case "png": return <span className="text-green-600 text-5xl">🖼️</span>;
                                      default: return <span className="text-gray-600 text-5xl">📁</span>;
                                    }
                                  })()}
                                  {/* ONLY FILENAME IS CLICKABLE */}
                                  <span
                                    className="truncate font-medium cursor-pointer hover:underline"
                                    onClick={() => setPreviewFile(currentGoodMoral)}
                                  >
                                    {currentGoodMoral.name || "Uploaded File"}
                                  </span>
                                </div>

                                {/* Small Scrollable Preview */}
                                <div className="mt-2 border rounded-lg h-64 overflow-auto flex items-center justify-center p-2 w-full">
                                  {currentGoodMoral.name.endsWith(".pdf") ? (
                                    <embed
                                      src={currentGoodMoral.url}
                                      type="application/pdf"
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <img
                                      src={currentGoodMoral.url}
                                      className="w-full h-auto object-contain"
                                    />
                                  )}
                                </div>

                              </div>

                              {/* Change File Button */}
                              <label
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors cursor-pointer self-start mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Change File
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setCurrentGoodMoral({ name: file.name, file });

                                    const uploaded = await uploadFile(file, "good_moral");
                                    if (uploaded?.url) {
                                      setCurrentGoodMoral((prev) => ({
                                        ...prev,
                                        url: uploaded.url,
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-green-500 transition-colors text-center">
                              <span className="text-6xl mb-2">📁</span>
                              <span className="text-gray-500 mb-2">Click here to upload</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;

                                  setCurrentGoodMoral({ name: file.name, file });

                                  const uploaded = await uploadFile(file, "good_moral");
                                  if (uploaded?.url) {
                                    setCurrentGoodMoral((prev) => ({
                                      ...prev,
                                      url: uploaded.url,
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-400">Allowed: PDF, DOC, DOCX, JPG, PNG</span>
                            </label>
                          )}
                        </div>

                        {/* CVSU Rules and Regulations */}
                        <div className="bg-white shadow rounded-lg p-6 w-[500px] flex flex-col gap-4">
                          <h3 className="text-lg font-semibold text-center">CVSU Rules and Regulations</h3>

                          {currentRules ? (
                            <div className="flex flex-col gap-4 w-full">
                              <div className="flex flex-col gap-2 border p-2 rounded">

                                <div className="flex items-center gap-3">
                                  {(() => {
                                    const ext = currentRules.name?.split(".").pop().toLowerCase();
                                    switch (ext) {
                                      case "pdf": return <span className="text-red-600 text-5xl">📄</span>;
                                      case "doc":
                                      case "docx": return <span className="text-blue-600 text-5xl">📝</span>;
                                      case "jpg":
                                      case "jpeg":
                                      case "png": return <span className="text-green-600 text-5xl">🖼️</span>;
                                      default: return <span className="text-gray-600 text-5xl">📁</span>;
                                    }
                                  })()}
                                  {/* ONLY FILENAME IS CLICKABLE */}
                                  <span
                                    className="truncate font-medium cursor-pointer hover:underline"
                                    onClick={() => setPreviewFile(currentRules)}
                                  >
                                    {currentRules.name}
                                  </span>
                                </div>

                                {/* Small Scrollable Preview */}
                                <div className="mt-2 border rounded-lg h-64 overflow-auto flex items-center justify-center p-2 w-full">
                                  {currentRules.name.endsWith(".pdf") ? (
                                    <embed
                                      src={currentRules.url}
                                      type="application/pdf"
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <img
                                      src={currentRules.url}
                                      className="w-full h-auto object-contain"
                                    />
                                  )}
                                </div>

                              </div>

                              {/* Change File Button */}
                              <label
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors cursor-pointer self-start mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Change File
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setCurrentRules({ name: file.name, file });

                                    const uploaded = await uploadFile(file, "rules");
                                    if (uploaded?.url) {
                                      setCurrentRules((prev) => ({
                                        ...prev,
                                        url: uploaded.url,
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors text-center">
                              <span className="text-6xl mb-2">📁</span>
                              <span className="text-gray-500 mb-2">Click here to upload</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;

                                  setCurrentRules({ name: file.name, file });

                                  const uploaded = await uploadFile(file, "rules");
                                  if (uploaded?.url) {
                                    setCurrentRules((prev) => ({
                                      ...prev,
                                      url: uploaded.url,
                                    }));
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-400">Allowed: PDF, DOC, DOCX, JPG, PNG</span>
                            </label>
                          )}
                        </div>

                      </div>

                      {/* ===== Fullscreen Modal ===== */}
                      {previewFile && (
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                          <div className="relative w-full max-w-5xl max-h-[90vh] rounded shadow-lg bg-white/90 flex flex-col">

                            {/* Close Button */}
                            <button
                              onClick={() => setPreviewFile(null)}
                              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg transition-colors z-10"
                            >
                              ✕
                            </button>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                              {previewFile.name.endsWith(".pdf") ? (
                                <embed
                                  src={previewFile.url}
                                  type="application/pdf"
                                  className="w-full min-h-[500px] md:min-h-[600px]"
                                />
                              ) : (
                                <img
                                  src={previewFile.url}
                                  className="max-w-full max-h-[80vh] object-contain"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                {/* ================= Student Records ================= */}
                {activePage === "records" && (
                  <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                    <h3 className="text-xl font-semibold text-gray-700">Student Records</h3>

                    {/* Search Input + Category */}
                    <div className="flex items-center space-x-2 max-w-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
                        />
                      </svg>

                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search student..."
                        className="w-full pl-2 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />

                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All</option>
                        <option value="name">Name</option>
                        <option value="id">ID</option>
                        <option value="course">Course</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto border rounded">
                      <table className="min-w-full text-left">
                        <thead className="bg-gray-200 text-gray-700">
                          <tr>
                            {(filterCategory === "all" || filterCategory === "id") && <th className="px-4 py-2">ID</th>}
                            {(filterCategory === "all" || filterCategory === "name") && <th className="px-4 py-2">Student Name</th>}
                            {(filterCategory === "all" || filterCategory === "id") && <th className="px-4 py-2">Student Number</th>}
                            {(filterCategory === "all" || filterCategory === "email") && <th className="px-4 py-2">Email</th>}
                            {(filterCategory === "all" || filterCategory === "phone") && <th className="px-4 py-2">Phone Number</th>}
                            {(filterCategory === "all" || filterCategory === "course") && <th className="px-4 py-2">Course</th>}
                            <th className="px-4 py-2">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-6 text-gray-500">
                                No students found.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s.id} className="border-b last:border-b-0">
                                {(filterCategory === "all" || filterCategory === "id") && <td className="py-3 px-4">{s.id}</td>}
                                {(filterCategory === "all" || filterCategory === "name") && <td className="py-3 px-4">{s.student_name}</td>}
                                {(filterCategory === "all" || filterCategory === "id") && <td className="py-3 px-4">{s.student_number}</td>}
                                {(filterCategory === "all" || filterCategory === "email") && <td className="py-3 px-4">{s.email}</td>}
                                {(filterCategory === "all" || filterCategory === "phone") && <td className="py-3 px-4">{s.phone}</td>}
                                {(filterCategory === "all" || filterCategory === "course") && <td className="py-3 px-4">{s.course}</td>}
                                <td className="py-3 px-4 flex gap-2">
                                  <button
                                    onClick={() => setViewStudent(s)}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <EyeIcon className="w-4 h-4" /> View
                                  </button>
                                  <button
                                    onClick={() => setDeleteStudent(s)}
                                    className="text-red-600 hover:underline flex items-center gap-1"
                                  >
                                    <TrashIcon className="w-4 h-4" /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* View Modal */}
                    {viewStudent && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-black opacity-70"
                          onClick={() => handleViewStudent(null)}
                        ></div>
                        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 z-10">
                          <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                            onClick={() => handleViewStudent(null)}
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                          <h3 className="text-lg font-semibold mb-4">Student Details</h3>
                          <p><strong>Name:</strong> {viewStudent.student_name}</p>
                          <p><strong>Number:</strong> {viewStudent.student_number}</p>
                          <p><strong>Email:</strong> {viewStudent.email}</p>
                          <p><strong>Phone:</strong> {viewStudent.phone}</p>
                          <p><strong>Course:</strong> {viewStudent.course}</p>
                        </div>
                      </div>
                    )}

                    {/* Delete Modal */}
                    {deleteStudent && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-black opacity-70"
                          onClick={() => handleDeleteStudent(null)}
                        ></div>
                        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-10">
                          <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                            onClick={() => handleDeleteStudent(null)}
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                          <p>
                            Are you sure you want to delete <strong>{deleteStudent.id}</strong>?
                          </p>
                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                              onClick={() => handleDeleteStudent(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              onClick={handleConfirmDelete}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

            </section>
              </main>
            </div>
          );
         }
