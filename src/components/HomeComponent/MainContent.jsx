import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit3, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getWorkspaces, parseWorkspacesResponse, normalizeWorkspaceDto } from "../../services/api";
import { useUser } from "../../context/UserContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";
import { useTasks } from "../../context/TasksContext";
import chatbotIcon from '../../assets/images/chatbot-flowtingIcon.png';

const SPACE_COLORS = ["#7C3AED", "#10B981", "#F97316", "#3B82F6", "#EC4899", "#EAB308"];
const SPACE_BG = ["#EDE9FE", "#D1FAE5", "#FFEDD5", "#DBEAFE", "#FCE7F3", "#FEF9C3"];
const TASK_COLORS = ["#7C3AED", "#F97316", "#EAB308", "#EF4444", "#10B981", "#3B82F6", "#EC4899"];
const NOTE_THEMES = [
    { bg: "#EEF2FF", textColor: "#4F46E5" },
    { bg: "#FEF9C3", textColor: "#CA8A04" },
    { bg: "#DCFCE7", textColor: "#16A34A" },
];

const formatTaskTime = (dateStr) => {
    if (dateStr) {
        const d = new Date(dateStr);
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
    }
    return "--";
};

const isDone = (status) => {
    const s = typeof status === 'string' ? status.toLowerCase() : '';
    return s === 'done' || s === 'completed';
};

const isHighPriority = (priority) => {
    const p = typeof priority === 'string' ? priority.toLowerCase() : priority;
    return p === 'critical' || p === 'high' || p === 2;
};

const MainContent = ()=>{
    const navigate = useNavigate();
    const { displayName, name } = useUser();
    const { activeWorkspaceId, setActiveWorkspace } = useWorkspace();
    const { spaces, notes, selectSpace, fetchSpaceNotes } = useSpaces();
    const { tasks, fetchTasks } = useTasks();
    
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
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

    // Load tasks + notes for the active workspace's spaces so the overview is populated
    useEffect(() => {
        if (!activeWorkspaceId || !Array.isArray(spaces) || spaces.length === 0) return;
        spaces.forEach((space) => {
            fetchTasks(activeWorkspaceId, space.id, { PageNumber: 1, PageSize: 50 });
            fetchSpaceNotes(activeWorkspaceId, space.id);
        });
    }, [activeWorkspaceId, spaces, fetchTasks, fetchSpaceNotes]);
    
    if (loading) {
        return (
            <div className="aigenda-loader">
                <div className="aigenda-loader__ring"></div>
                <span className="aigenda-loader__label">Loading your workspace...</span>
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

    // Real spaces with progress computed from their tasks
    const overviewSpaces = (spaces || []).map((space, idx) => {
        const spaceTasks = (tasks || []).filter(t => String(t.spaceId) === String(space.id));
        const total = spaceTasks.length;
        const done = spaceTasks.filter(t => isDone(t.status)).length;
        const active = total - done;
        const highPriority = spaceTasks.filter(t => isHighPriority(t.priority)).length;
        const dueSoon = spaceTasks.filter(t => {
            if (!t.dueDate || isDone(t.status)) return false;
            const diff = new Date(t.dueDate).getTime() - Date.now();
            return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
        }).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return {
            id: space.id,
            name: space.name,
            team: (space.name || 'SPACE').toUpperCase().slice(0, 16),
            iconBg: SPACE_BG[idx % SPACE_BG.length],
            color: SPACE_COLORS[idx % SPACE_COLORS.length],
            progress, active, dueSoon, highPriority,
        };
    });

    // Nearest upcoming tasks (sorted by due date)
    const upcomingTasks = [...(tasks || [])]
        .filter(t => !isDone(t.status))
        .sort((a, b) => {
            const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return da - db;
        })
        .slice(0, 7)
        .map((t, idx) => {
            const space = (spaces || []).find(s => String(s.id) === String(t.spaceId || t.SpaceId));
            return {
                id: t.id || t.Id || t._id,
                spaceId: t.spaceId || t.SpaceId || t.spaceGUID || t.SpaceGuid,
                workspaceId: t.workspaceId || t.WorkspaceId,
                time: formatTaskTime(t.dueDate || t.DueDate),
                title: t.title || t.Title || t.name || 'Untitled task',
                subtitle: space?.name || t.description || '',
                color: TASK_COLORS[idx % TASK_COLORS.length],
            };
        });

    // Recent notes (sorted by most recently updated)
    const recentNotes = [...(notes || [])]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 3)
        .map((n, idx) => ({
            id: n.id,
            spaceId: n.spaceId,
            title: n.title || 'Untitled note',
            text: n.content || n.text || 'No content',
            ...NOTE_THEMES[idx % NOTE_THEMES.length],
        }));
    
    return(
        <div>
            {/* Header with Bot Avatar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.25rem' }}>Hi {userName}!</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>welcome back, you have {upcomingTasks.length} tasks left for today!</p>
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
                    {workspaces.length === 0 && (
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No workspaces yet.</p>
                    )}
                    {workspaces.map((ws, idx) => (
                        <div 
                            key={ws.id} 
                            onClick={() => { setActiveWorkspace(ws); navigate('/workspaceoverview'); }}
                            style={{ 
                                background: 'white', 
                                borderRadius: '1rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                border: String(activeWorkspaceId) === String(ws.id) ? '1px solid #7C3AED' : '1px solid #F3F4F6',
                                minHeight: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>{ws.name}</span>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: String(activeWorkspaceId) === String(ws.id) ? '#10B981' : '#E5E7EB' }}></div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: 'auto' }}>{ws.taskCount || 0} tasks · {ws.memberCount || 0} members</p>
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
                        {overviewSpaces.length === 0 && (
                            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                {activeWorkspaceId ? 'No spaces in this workspace yet.' : 'Select a workspace to see its spaces.'}
                            </div>
                        )}
                        {overviewSpaces.map((project, idx) => (
                            <div key={project.id || idx} style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: project.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit3 size={20} color={project.color}/>
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
                                    <button onClick={() => { selectSpace(project.id); navigate('/spaceoverview'); }} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.375rem', color: '#6B7280', cursor: 'pointer' }}>View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks Column */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Tasks</h3>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {upcomingTasks.length === 0 && (
                            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', padding: '0.5rem' }}>No upcoming tasks.</p>
                        )}
                        {upcomingTasks.map((task, idx) => (
                            <div
                                key={task.id || idx}
                                onClick={() => {
                                    const wsId = task.workspaceId || activeWorkspaceId;
                                    const spId = task.spaceId;
                                    const tId = task.id;
                                    if (wsId && spId && tId) {
                                        navigate(`/workspace/${wsId}/space/${spId}/task/${tId}`);
                                    } else if (tId) {
                                        navigate(`/workspacetaskspecific`);
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', borderBottom: idx < upcomingTasks.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                            >
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
                    {recentNotes.length === 0 && (
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No notes yet.</p>
                    )}
                    {recentNotes.map((note, idx) => (
                        <div key={note.id || idx} style={{ background: note.bg, borderRadius: '1rem', padding: '1.5rem', minHeight: '120px' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: note.textColor, marginBottom: '0.5rem' }}>{note.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: note.textColor, opacity: 0.8, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainContent;