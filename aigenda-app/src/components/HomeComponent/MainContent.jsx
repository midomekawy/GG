import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Loader2, Edit3, CheckCircle2, Clock, AlertCircle, Code, Megaphone, Users } from "lucide-react";
import { getWorkspaces, parseWorkspacesResponse, normalizeWorkspaceDto } from "../../services/api";
import { useUser } from "../../context/UserContext";
import chatbotIcon from '../../assets/images/chatbot-flowtingIcon.png';

const MainContent = ()=>{
    const navigate = useNavigate();
    const { displayName, name } = useUser();
    
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // TODO: Connect to actual API - Replace with real API calls when available
    const [tasksCount] = useState(5);
    const [notesCount] = useState(3);
    
    const userName = displayName || name || "User";
    
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setError("Please log in to view workspaces.");
            setLoading(false);
            return;
        }
        
        const fetchWorkspaces = async () => {
            try {
                setLoading(true);
                const response = await getWorkspaces();
                console.log("API Response:", response.data);
                const rawData = parseWorkspacesResponse(response);
                const normalizedData = rawData.map(normalizeWorkspaceDto).filter(Boolean);
                setWorkspaces(normalizedData);
            } catch (err) {
                if (err.response?.status === 401) {
                    alert("Authentication Error: 401 Unauthorized - Please check the userToken in localStorage");
                    setError("Session expired. Please log in again.");
                } else {
                    console.error("Error loading workspaces:", err);
                    setError("Failed to load workspaces.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchWorkspaces();
    }, []);
    
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 className="animate-spin" size={48} color="#7C3AED" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#DC2626' }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem' }}>
                    Retry
                </button>
            </div>
        );
    }

    const overviewProjects = [
        { name: "Product Design System", team: "DESIGN TEAM", icon: <Edit3 size={20} color="#7C3AED"/>, iconBg: "#EDE9FE", progress: 75, active: 12, dueSoon: 4, highPriority: 2, color: "#7C3AED" },
        { name: "Marketing Q4 Strategy", team: "MARKETING", icon: <Megaphone size={20} color="#10B981"/>, iconBg: "#D1FAE5", progress: 42, active: 8, dueSoon: 1, highPriority: 5, color: "#10B981" },
        { name: "Mobile App Backend", team: "ENGINEERING", icon: <Code size={20} color="#F97316"/>, iconBg: "#FFEDD5", progress: 92, active: 24, dueSoon: 0, highPriority: 1, color: "#F97316" },
        { name: "Hiring Pipeline 2024", team: "HUMAN RESOURCES", icon: <Users size={20} color="#3B82F6"/>, iconBg: "#DBEAFE", progress: 15, active: 5, dueSoon: 8, highPriority: 0, color: "#3B82F6" },
    ];

    const tasks = [
        { time: "01:00", title: "analysis", subtitle: "project analysis-design system", color: "#7C3AED" },
        { time: "10:00", title: "Platform Concept", subtitle: "Animation", color: "#F97316" },
        { time: "13:00", title: "interoretation", subtitle: "Animation", color: "#EAB308" },
        { time: "05:00", title: "hakoona", subtitle: "Animation", color: "#EF4444" },
        { time: "07:00", title: "wash cloth", subtitle: "Animation", color: "#10B981" },
        { time: "09:00", title: "semi temi", subtitle: "Animation", color: "#3B82F6" },
        { time: "04:00", title: "airpoy tyui", subtitle: "Animation", color: "#EC4899" },
    ];

    const notes = [
        { title: "project analysis", text: "A kiddo who uses Bootstrap and Laravel in web development. Currently playing around", bg: "#EEF2FF", textColor: "#4F46E5" },
        { title: "project analysis", text: "A kiddo who uses Bootstrap and Laravel in web development. Currently playing around", bg: "#FEF9C3", textColor: "#CA8A04" },
        { title: "project analysis", text: "A kiddo who uses Bootstrap and Laravel in web development. Currently playing around", bg: "#DCFCE7", textColor: "#16A34A" },
    ];
    
    return(
        <div>
            {/* Header with Bot Avatar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.25rem' }}>Hi {userName}!</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>welcome back, you have {tasksCount} tasks left for today!</p>
                </div>
{/* --- Chatbot Floating Icon Section --- */}
<Link to="/chatbot">
  <motion.div
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      border: '2px solid rgba(124, 58, 237, 0.2)',
      cursor: 'pointer'
    }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <img
      src={chatbotIcon}
      alt="Chatbot Icon"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </motion.div>
</Link>
            </div>

            {/* Workspaces Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Work spaces</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {workspaces.map((ws, idx) => (
                        <div 
                            key={ws.id} 
                            onClick={() => navigate(`/workspace/${ws.id}`)}
                            style={{ 
                                background: 'white', 
                                borderRadius: '1rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                border: '1px solid #F3F4F6',
                                minHeight: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>{ws.name}</span>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx % 2 === 0 ? '#E5E7EB' : '#10B981' }}></div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: 'auto' }}>Edited {idx === 0 ? '1 month ago' : idx === 1 ? '1 hour ago' : idx === 2 ? 'just now' : 'a moment ago'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two Column Layout: Overview + Tasks */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', marginBottom: '2rem' }}>
                {/* Overview Column */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Overveiw</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {overviewProjects.map((project, idx) => (
                            <div key={idx} style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: project.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {project.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{project.name}</span>
                                        <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: project.iconBg, color: project.color, borderRadius: '0.25rem', fontWeight: 500 }}>{project.team}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={12} color="#10B981"/> {project.active} Active</span>
                                        {project.dueSoon > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B' }}><Clock size={12}/> {project.dueSoon} Due Soon</span>}
                                        {project.highPriority > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#EF4444' }}><AlertCircle size={12}/> {project.highPriority} High Priority</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Progress</div>
                                        <div style={{ width: '80px', height: '4px', background: '#E5E7EB', borderRadius: '2px' }}>
                                            <div style={{ width: `${project.progress}%`, height: '100%', background: project.color, borderRadius: '2px' }}></div>
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: '#9CA3AF', marginTop: '0.125rem', textAlign: 'right' }}>{project.progress}%</div>
                                    </div>
                                    <button style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.375rem', color: '#6B7280', cursor: 'pointer' }}>View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks Column */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Tasks</h3>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {tasks.map((task, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', borderBottom: idx < tasks.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', minWidth: '40px' }}>{task.time}</span>
                                <div style={{ width: '3px', height: '24px', background: task.color, borderRadius: '2px' }}></div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.125rem' }}>{task.title}</p>
                                    <p style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>{task.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Notes */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Recent notes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {notes.map((note, idx) => (
                        <div key={idx} style={{ background: note.bg, borderRadius: '1rem', padding: '1.5rem', minHeight: '120px' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: note.textColor, marginBottom: '0.5rem' }}>{note.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: note.textColor, opacity: 0.8, lineHeight: 1.6 }}>{note.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainContent;