import Header from "../HomeComponent/Header";
import '../HomeComponent/home.css';
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import TopSection from "../WorkspacesComponent/TopSection";
import '../WorkspacesComponent/workspace.css';
import AvtImg from '../../assets/images/avatar1.jpg';
import AvtImg2 from '../../assets/images/avatar2.jpg';
import { useSpaces } from "../../context/SpacesContext";
// --- MOCK DATA ---
const teamData = [
  { id: 1, name: 'Alex R.', tasks: 48, maxTasks: 60, color: '#8b5cf6', avatar: AvtImg },
  { id: 2, name: 'Sarah K.', tasks: 32, maxTasks: 60, color: '#c4b5fd', avatar: AvtImg2 },
  { id: 3, name: 'Jason M.', tasks: 54, maxTasks: 60, color: '#a78bfa', avatar: AvtImg},
  { id: 4, name: 'Elena W.', tasks: 26, maxTasks: 60, color: '#c4b5fd', avatar: AvtImg2 },
  { id: 5, name: 'Marcus T.', tasks: 39, maxTasks: 60, color: '#a78bfa', avatar: AvtImg },
  { id: 6, name: 'Lily C.', tasks: 31, maxTasks: 60, color: '#c4b5fd', avatar: AvtImg2 },
];
const priorities = [
  { label: 'High Priority', percent: 45, color: '#8b5cf6' },
  { label: 'Medium', percent: 35, color: '#c4b5fd' },
  { label: 'Low', percent: 20, color: '#e2e8f0' },
];
const Card = ({ children, className = '' }) => (
  <div className={`dashboard-card ${className}`}>
    {children}
  </div>
);
const SpaceAnalytics = ()=>{
  const { spaces, activeSpaceId } = useSpaces();

  // Get current space from context
  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "No Space Selected";
  const spaceDescription = currentSpace?.description || "No description available for this space.";

    return(
        <div className="app-container">
            <SidebarofWorkspace/>
             <main className="main-content" style={{marginLeft:'180px'}}>
             <Header/>   
             <div className="page-container">
                <TopSection spaceName={`${spaceName}`} spaceDescription={spaceDescription} />


            <div className="dashboard-container">
                
                {/* 1. TASK COMPLETION TREND (Top Left) */}
                <Card className="trend-card">
                    <div className="card-header">
                    <div>
                        <h2 className="card-title">Task Completion Trend</h2>
                        <p className="card-subtitle">Total 1,284 tasks completed this month</p>
                    </div>
                    <div className="legend-group">
                        <span className="legend-item">
                        <div className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></div> Completed
                        </span>
                        <span className="legend-item">
                        <div className="legend-dot" style={{ backgroundColor: '#cbd5e1' }}></div> Planned
                        </span>
                    </div>
                    </div>
                    
                    {/* Mocking the empty chart area */}
                    <div className="chart-placeholder">
                    <div className="chart-x-axis">
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                    </div>
                    </div>
                </Card>

                {/* 2. PRIORITY DISTRIBUTION (Top Right) */}
                <Card>
                    <h2 className="card-title priority-title">Priority Distribution</h2>
                    
                    <div className="priority-content">
                    {/* CSS Donut Chart */}
                    <div className="donut-chart">
                        <div className="donut-inner">
                        <span className="donut-value">156</span>
                        <span className="donut-label">Tasks</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="priority-list">
                        {priorities.map((item, index) => (
                        <div key={index} className="priority-list-item">
                            <span className="priority-list-label">
                            {/* Color is dynamic, so we keep it inline */}
                            <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                            {item.label}
                            </span>
                            <span className="priority-list-percent">{item.percent}%</span>
                        </div>
                        ))}
                    </div>
                    </div>
                </Card>

                {/* 3. TEAM PRODUCTIVITY (Bottom Full Width) */}
                <Card className="productivity-card">
                    <div className="card-header productivity-header-wrapper">
                    <div>
                        <h2 className="card-title">Team Productivity</h2>
                        <p className="card-subtitle">Tasks completed per member this cycle</p>
                    </div>
                    <a href="#" className="leaderboard-link">
                        View Full Leaderboard
                    </a>
                    </div>

                    <div className="bars-container">
                    {teamData.map((member) => (
                        <div key={member.id} className="member-column">
                        
                        {/* Vertical Bar Container */}
                        <div className="bar-track">
                            <div 
                            className="bar-fill" 
                            style={{
                                height: `${(member.tasks / member.maxTasks) * 100}%`,
                                backgroundColor: member.color,
                            }} 
                            />
                        </div>

                        {/* User Info */}
                        <div className="member-info">
                            <img src={member.avatar} alt={member.name} className="member-avatar" />
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                                <span className="member-name">{member.name}</span>
                                <span className="member-tasks">{member.tasks} tasks</span>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </Card>
                
                </div>


             </div>
            </main>
        </div>
    )
}
export default SpaceAnalytics;