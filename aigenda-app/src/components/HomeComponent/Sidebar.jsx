import "./home.css";
import {Home, LayoutDashboard, Layers, Users, User, Link as LinkIcon, MessageSquare, Settings, LogOut} from 'lucide-react';
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import SidebarLogo from '../../assets/images/Sidebar-logo.png';

const DEFAULT_SIDEBAR_AVATAR = "https://picsum.photos/seed/user/40/40";

const Sidebar = ()=>{
    const { displayName, avatarUrl, clearUser } = useUser();
    const navigate = useNavigate();
    return(
        <div>
            <aside className="sidebar">
            <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%', 
    paddingTop: '20px', 
    paddingBottom: '15px' 
}}>
  <img 
    src={SidebarLogo} 
    alt="AI Genda Logo" 
    style={{ 
        width: '70px', 
        height: 'auto', 
        display: 'block' 
    }} 
  />
</div>

      <nav className="sidebar-nav">
       <NavLink to='/home' className={({isActive})=> isActive? "nav-item active":"nav-item"} >
          <Home/>
          <span>Home</span>
          {/* <div className="active-indicator"></div> */}
        </NavLink>
        <NavLink to='/mainworkspace' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <LayoutDashboard/>
          <span>Workspaces</span>
        </NavLink>
        <NavLink to='/analytics' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <Layers/>
          <span>Analytics</span>
        </NavLink>
        <NavLink to='/community' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <Users/>
          <span>Community</span>
        </NavLink >
        <NavLink to='/connect' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <LinkIcon/>
          <span>Connect</span>
        </NavLink>
        <NavLink to='/chatbot' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <MessageSquare/>
          <span>Chatbot</span>
        </NavLink>
        <NavLink to='/profile' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <User/>
          <span>Profile</span>
        </NavLink>
        <NavLink to='/settings' className={({isActive})=> isActive? "nav-item active":"nav-item"}>
          <Settings/>
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src={avatarUrl || DEFAULT_SIDEBAR_AVATAR} alt="" className="user-avatar"/>
          <div className="user-info">
            <span className="user-name">{displayName || "User"}</span>
            <span className="user-plan">Pro Plan</span>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={() => { clearUser(); navigate("/login"); }}>
         <LogOut/>
          <span>Log out</span>
        </button>
      </div>
    </aside>
        </div>
    )
};
export default Sidebar;