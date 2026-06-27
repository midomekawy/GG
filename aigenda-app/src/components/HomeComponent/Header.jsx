import { Bell, ChevronLeft, ChevronRight, Search } from "lucide-react";

const Header = ()=>{
    return(
        <>
      <header className="header">
        <div className="header-left">
          <div className="nav-controls">
            <button className="control-btn"><ChevronLeft/></button>
            <button className="control-btn"><ChevronRight/></button>
          </div>
          <div className="search-bar">
            <Search style={{position:'absolute',top:'7px',left:'10px',zIndex:'3'}} size={20}/>
            <input type="text" placeholder="Search..." className="search-input" style={{position:'relative'}}/>
          </div>
        </div>
        <div className="header-right">
          <button className="notification-btn">
            <Bell/>
            <span className="notification-dot"></span>
          </button>
        </div>
      </header>
        </>
    )
}
export default Header;