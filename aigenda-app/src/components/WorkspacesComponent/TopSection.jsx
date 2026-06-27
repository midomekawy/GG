import {ChevronRight } from "lucide-react";
import '../HomeComponent/home.css';
import './workspace.css';
import { NavLink } from "react-router-dom";
const TopSection = ({ spaceName, spaceDescription })=>{
    return(
        <div>
        <section style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem"}}>
          <div style={{maxWidth: "40rem"}}>
            {/* <div style={{display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-soft)", fontSize: "0.875rem", marginBottom: "1rem"}}>
              <span>Design System Redesign</span>
              <ChevronRight style={{width: "1rem", height: "1rem"}}/>
              <span style={{color: "var(--text-main)", fontWeight: "500"}}>Tasks</span>
            </div> */}
            <div style={{display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem"}}>
              <h2 style={{fontSize: "2.25rem", fontWeight: "700"}}>{spaceName || "Untitled Space"}</h2>
              <span style={{background: "var(--primary-soft)", color: "var(--primary)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase"}}>Active</span>
            </div>
            <p style={{color: "var(--text-muted)", lineHeight: "1.6"}}>{spaceDescription || "No description available"}</p>
          </div>
          <div className="db-card" style={{textAlign: "center", minWidth: "180px", padding: "1.5rem"}}>
            <p style={{color: "var(--text-soft)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.5rem"}}>Total tasks Completed</p>
            <span style={{fontSize: "2.25rem", fontWeight: "700"}}>40</span>
          </div>
        </section>

        <nav className="tabs">
          <NavLink to='/spaceoverview' className={({isActive})=> isActive? "tab active":"tab"}>Tasks</NavLink>
          <NavLink to='/workspaceNotes' className={({isActive}) => isActive? "tab active":"tab"}>Notes</NavLink>
          <NavLink to='/workspaceAnalytics' className={({isActive})=> isActive? "tab active":"tab"}>Analytics</NavLink>
        </nav>
        </div>
    )
}
export default TopSection;