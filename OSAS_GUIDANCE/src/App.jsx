import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./frontend/landingpage";
import LandingPage2 from "./frontend/landingpage2"
import AdminLogin from "./frontend/adminlogin";
import AdminLogin2 from "./frontend/adminlogin2"; 
import StudentRegister from "./frontend/studentregister"; 
import StudentLogin from "./frontend/studentlogin"; 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

         {/*Student Landing Page */}
         <Route path="/student-auth" element={<LandingPage2 />} />
           <Route path="/student_register" element={<StudentRegister />} />
             <Route path="/student_login" element={<StudentLogin />} />

        {/* Admin Login Page */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login2" element={<AdminLogin2 />} />
      </Routes>
    </Router>
  );
}
