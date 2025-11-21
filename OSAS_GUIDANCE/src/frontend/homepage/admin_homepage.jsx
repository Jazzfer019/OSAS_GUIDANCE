import React, { useState } from "react";
import {DocumentTextIcon, ChatBubbleBottomCenterTextIcon, NewspaperIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon,} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

export default function AdminHome() {
  const [activePage, setActivePage] = useState("records");
  const [query, setQuery] = useState("");

  const menuItems = [
    { id: "records", label: "Records", icon: DocumentTextIcon },
    { id: "news", label: "News", icon: NewspaperIcon },
    { id: "chat", label: "Chat", icon: ChatBubbleBottomCenterTextIcon },
    { id: "pdf", label: "PDF", icon: DocumentTextIcon },
  ];

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
    reverseButtons: false,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Logged out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/";
      });
    }
  });
}


  return (
    <div className="w-screen h-screen flex bg-gray-100 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#1f2937] text-white flex flex-col py-6 shadow-xl border-r border-gray-800">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 px-4 mb-8">
          <img
            src="/cvsu-logo.png"
            alt="logo"
            className="w-11 h-11 rounded-md object-cover shadow-sm border border-gray-700"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-wide">GUIDANCE OFFICE</h1>
            <p className="text-xs text-gray-300">CvSU — Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 flex-1">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all duration-150
                    ${activePage === item.id ? "bg-green-600 shadow-inner" : "hover:bg-gray-700/60"}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
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

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="w-full h-16 bg-[#1f2937] text-white shadow-md flex items-center justify-between px-6 sticky top-0 z-20 border-b border-gray-700">

              {/* LEFT side — empty or you can add breadcrumb later */}
              <div></div>

              {/* RIGHT side — Search + Avatar */}
              <div className="flex items-center gap-4">

                {/* Search (white) */}
                <div className="relative w-80">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search files, records, students..."
                    className="w-full pl-11 pr-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-full shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Avatar */}
                <div
                  role="img"
                  aria-label="admin avatar"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-400 shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 0115 0v.75H4.5v-.75z" />
                  </svg>
                </div>

              </div>
            </header>

        {/* Content area */}
        <section className="p-8 overflow-auto h-[calc(100vh-4rem)]">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-700">
              {activePage === "records" && "Student Records"}
              {activePage === "news" && "Latest News"}
              {activePage === "chat" && "Chat Support"}
              {activePage === "pdf" && "PDF Files"}
            </h2>
          </div>
        </section>
      </main>
    </div>
  );
}
