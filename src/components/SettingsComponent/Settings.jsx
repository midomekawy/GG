import './settings.css';
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SettSidebar from "./SettSidebar";

const Settings = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="settings-full-page">
      <div className="settings-layout">
        <SettSidebar />
        <main className="settings-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Settings;