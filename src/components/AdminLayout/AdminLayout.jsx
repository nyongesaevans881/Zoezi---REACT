import { useNavigate, useLocation } from "react-router-dom"
import { LuGraduationCap, LuUsers } from "react-icons/lu";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { useState, useEffect } from "react"
import "./AdminLayout.css"
import { FaRegCreditCard } from "react-icons/fa";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AdminAuthModal from "../../components/Admin/AdminAuthModal";

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasCheckedInitialAuth, setHasCheckedInitialAuth] = useState(false)
  
  const { isAuthenticated, isChecking, login, logout, checkAuth } = useAdminAuth()

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <MdOutlineDashboard /> },
    { label: "Applications", path: "/admin/applications", icon: <IoDocumentAttachOutline /> },
    { label: "Admissions", path: "/admin/admissions", icon: <FaRegPenToSquare /> },
    { label: "Update Fee", path: "/admin/update-fee", icon: <MdAttachMoney /> },
    { label: "Students", path: "/admin/students", icon: <LuUsers /> },
    { label: "Details", path: "/admin/details", icon: <FiSearch /> },
    { label: "Alumni", path: "/admin/alumni", icon: <LuGraduationCap /> },
    { label: "Subscriptions", path: "/admin/subscriptions", icon: <FaRegCreditCard /> },
  ]

  const isActive = (path) => location.pathname === path

  // Check authentication on mount
  useEffect(() => {
    const initialCheck = async () => {
      await checkAuth();
      setHasCheckedInitialAuth(true);
    };
    
    initialCheck();
  }, [checkAuth]);

  // Show modal only after initial check and if not authenticated
  useEffect(() => {
    if (hasCheckedInitialAuth && !isChecking && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [hasCheckedInitialAuth, isAuthenticated, isChecking]);

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, showAuthModal]);

  const handleLogin = async (password) => {
    return await login(password);
  };

  const handleModalClose = () => {
    // Only navigate away if still not authenticated
    if (!isAuthenticated) {
      navigate('/');
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    // Show modal again after logout
    setShowAuthModal(true);
  }

  // Show loading while checking initial authentication
  if (!hasCheckedInitialAuth || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={handleModalClose}
        onAuthenticate={handleLogin}
        isChecking={isChecking}
      />

      {isAuthenticated && (
        <div className="admin-container">
          {/* Sidebar */}
          <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div className="sidebar-header">
              <h2 className="sidebar-title">NZI ADMIN</h2>
              <button 
                className="toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? "←" : "→"}
              </button>
            </div>

            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              <button className="logout-btn" onClick={handleLogout}>
                {sidebarOpen ? "🚪 Logout" : "🚪"}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-content">
            <div className="admin-header">
              <h1>NZI Administration Panel</h1>
              <div className="admin-user">
                <span>Admin User</span>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  ● Authenticated
                </div>
              </div>
            </div>
            <div className="admin-body">
              {children}
            </div>
          </main>
        </div>
      )}
    </>
  );
}