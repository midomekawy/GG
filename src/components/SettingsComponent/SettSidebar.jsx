import { ArrowLeft, Bell, HelpCircle, Home, Info, Link as LinkIcon, LogOut, RefreshCcw, Shield, UserPlus, Users } from "lucide-react";
import './settings.css';
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const SettSidebar = () => {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        // Clear authentication tokens/local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleQuickAccess = (path) => {
        if (path === 'home') navigate('/home');
        if (path === 'help') navigate('/');
        if (path === 'switch') navigate('/');
    };

    return (
        <aside className="settings-sidebar">
            <div className="settings-header">
                <button
                    className="back-btn"
                    onClick={handleBackClick}
                    title="Back to Home"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="settings-title">Settings</h2>
            </div>
            <nav className="settings-nav">
                <NavLink to='' end className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><Bell size={20} /></span>
                    <span>Notifications</span>
                </NavLink>
                <NavLink to='security' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><Shield size={20} /></span>
                    <span>Security</span>
                </NavLink>
                <NavLink to='integrations' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><LinkIcon size={20} /></span>
                    <span>Integrations</span>
                </NavLink>
                <NavLink to='help' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><HelpCircle size={20} /></span>
                    <span>Help</span>
                </NavLink>
                <NavLink to='updates' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><RefreshCcw size={20} /></span>
                    <span>Update System</span>
                </NavLink>
                <NavLink to='invite' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><UserPlus size={20} /></span>
                    <span>Invite a friend</span>
                </NavLink>
                <NavLink to='about' className={({ isActive }) => isActive ? "settings-nav-item active" : "settings-nav-item"}>
                    <span className="icon"><Info size={20} /></span>
                    <span>About</span>
                </NavLink>
            </nav>
            <div className="settings-logout">
                <button className="settings-logout-btn" onClick={() => setIsLogoutModalOpen(true)}>
                    <LogOut size={20} />
                    <span>Log out</span>
                </button>
            </div>

            {/* Logout Modal */}
            {isLogoutModalOpen && (
                <div className="logout-modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-modal-header">
                            <h3>Logout</h3>
                        </div>
                        <div className="logout-modal-content">
                            <p className="logout-question">Are you sure you want to log out?</p>
                            <p className="logout-message">You can log back in at any time.</p>
                            
                            <div className="logout-buttons">
                                <button className="logout-cancel-btn" onClick={() => setIsLogoutModalOpen(false)}>
                                    Cancel
                                </button>
                                <button className="logout-confirm-btn" onClick={handleLogout}>
                                    Log Out
                                </button>
                            </div>
                        </div>
                        
                        {/* Quick Access Icons */}
                        <div className="quick-access">
                            <button className="quick-access-item" onClick={() => handleQuickAccess('home')}>
                                <Home size={20} />
                                <span>Home</span>
                            </button>
                            <button className="quick-access-item" onClick={() => handleQuickAccess('help')}>
                                <HelpCircle size={20} />
                                <span>Help</span>
                            </button>
                            <button className="quick-access-item" onClick={() => handleQuickAccess('switch')}>
                                <Users size={20} />
                                <span>Switch</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default SettSidebar;