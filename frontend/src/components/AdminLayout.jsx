import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Calendar,
  Clock,
  User,
  ChevronDown,
} from "lucide-react";
import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // Add any auth clear logic here if needed
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand-container">
          <div className="brand-logo-wrapper">
            {/* Replace with your official logo asset */}
            <img
              src="/manila-city-library-logo.png"
              alt="Manila City Library Logo"
              className="brand-logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h1 className="brand-title">Patricia Public Library</h1>
          <p className="brand-tagline">Read • Learn • Grow</p>
        </div>

        <nav className="admin-navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <UserCheck size={20} />
            <span>Attendance</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FileText size={20} />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Users size={20} />
            <span>Clients</span>
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <BookOpen size={20} />
            <span>Library Services</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

          <button onClick={handleLogout} className="admin-nav-link logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Decorative Watermark background graphic */}
        <div className="sidebar-watermark">
          <BookOpen size={160} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-system-title">
            <h2>Patricia Public Library</h2>
            <p>Attendance Monitoring System</p>
          </div>

          <div className="header-meta">
            <div className="header-datetime">
              <Calendar size={16} />
              <span>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="datetime-divider">|</span>
              <Clock size={16} />
              <span>
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>

            <div className="admin-user-menu">
              <div className="user-avatar-badge">
                <User size={18} />
              </div>
              <span className="user-name">Admin</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* Page Views Rendered Here */}
        <main className="admin-main">
          <Outlet />
        </main>

        {/* Bottom Banner Footer */}
        <footer className="admin-footer">
          <div className="footer-left">
            Patricia Public Library <span>|</span> Your Library, Your Community
          </div>
          <div className="footer-right">“Read. Learn. Grow.”</div>
        </footer>
      </div>
    </div>
  );
}
