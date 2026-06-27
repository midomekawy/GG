import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import '../WorkspacesComponent/stylesofWS.css';
import '../HomeComponent/home.css';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTasks } from "../../context/TasksContext";
import { useSpaces } from "../../context/SpacesContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useState, useEffect, useRef } from "react";
import CreateNewTask from "../TaskComponent/CreateNewTask";
import { Bell, ChevronLeft, ChevronRight, Search } from "lucide-react";

const notesData = [
  {
    id: 1,
    type: 'text',
    title: 'New Product Idea Design',
    icon: '💡',
    content: 'Create a mobile app UI Kit that provide a basic notes functionality but with some improvement. There will be a choice to select what kind of notes that user needed, so the experience while taking notes can be unique based on the needs.'
  },
  {
    id: 2,
    type: 'image',
    title: 'New Product Idea Design',
    icon: '💡',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=600&q=80',
    content: 'Create a mobile app UI Kit that provide a basic notes functionality but with some improvement.'
  },
  {
    id: 3,
    type: 'list',
    title: 'Monthly Buy List',
    icon: '🛒',
    items: [
      { id: 1, text: 'Item 1', isSubItem: false },
      { id: 2, text: 'Sub item 1', isSubItem: true },
      { id: 3, text: 'Sub item 2', isSubItem: true },
      { id: 4, text: 'Item 2', isSubItem: false },
    ]
  }
];

const AVATAR_COLORS = ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981'];

const getAvatarColor = (index) => {
  if (index >= 0 && index < AVATAR_COLORS.length) return AVATAR_COLORS[index];
  return '#94a3b8';
};

const getAssignees = (task) => {
  if (task.assignedTo && Array.isArray(task.assignedTo)) {
    return task.assignedTo.map(a => typeof a === 'string' ? a : (a.email || a.name || '')).filter(Boolean);
  }
  if (task.assignees && Array.isArray(task.assignees)) {
    return task.assignees.map(a => typeof a === 'string' ? a : (a.email || a.name || '')).filter(Boolean);
  }
  if (task.assigneeEmail) return [task.assigneeEmail];
  if (task.assignee?.email) return [task.assignee.email];
  if (task.assignee?.name) return [task.assignee.name];
  return [];
};

const SpaceOverview = () => {
  const { tasks, updateTask, fetchTasks, isLoading } = useTasks();
  const { spaces, activeSpaceId } = useSpaces();
  const { activeWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [addUserState, setAddUserState] = useState({ taskId: null, value: '' });

  // Fetch tasks when component mounts or when space changes
  useEffect(() => {
    if (activeWorkspaceId && activeSpaceId) {
      fetchTasks(activeWorkspaceId, activeSpaceId, { PageNumber: 1, PageSize: 20 });
    }
  }, [activeWorkspaceId, activeSpaceId, fetchTasks]);

  // Get current space from context (handle both string and number comparisons)
  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "No Space Selected";
  const spaceDescription = currentSpace?.description || "No description available for this space.";

  // Helper function to map status to progress display
  const getProgressDisplay = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'done' || statusLower === 'completed') {
      return { status: 'COMPLETED', color: '#10b981', icon: '✓' };
    } else if (statusLower === 'on-progress' || statusLower === 'in-progress') {
      return { status: 'ONGOING', color: '#8b5cf6', icon: '🔄' };
    } else {
      return { status: 'TO DO', color: '#0f172a', icon: '○' };
    }
  };

  // Helper function to map priority to urgency display
  const getUrgencyDisplay = (priority) => {
    if (priority === 2) return { level: 'Critical', color: '#ef4444' };
    if (priority === 1) return { level: 'Moderate', color: '#f59e0b' };
    return { level: 'Low', color: '#10b981' };
  };

  // Filter tasks by active space first, then show top 4 for preview
  const spaceTasks = tasks.filter(task => {
    // The API might be returning workspaceId in spaceId field
    // Try multiple possible property names to handle API response variations
    const taskSpaceId = task.spaceId || task.SpaceId || task.spaceGUID || task.SpaceGuid || task.spaceGuid;
    // Type-safe comparison - convert both to String
    return String(taskSpaceId) === String(activeSpaceId);
  });
  const displayTasks = spaceTasks.slice(0, 4);
  const completedTasksCount = spaceTasks.filter(task => {
    const status = typeof task.status === 'string' ? task.status.toLowerCase() : '';
    return status === 'done' || status === 'completed' || task.isCompleted === true;
  }).length;
  return (
    <div className="app-container">
      <SidebarofWorkspace />
      <div className="main-content" style={{ marginLeft: '180px' }}>
<header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
  
  {/* Search */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button className="control-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><ChevronLeft size={20}/></button>
      <button className="control-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><ChevronRight size={20}/></button>
    </div>

    <div className="search-bar" style={{ position: 'relative', width: '280px' }}>
      <Search style={{position:'absolute', top:'7px', left:'10px', zIndex:'3', color:'#94a3b8'}} size={20}/>
      <input 
        type="text" 
        placeholder="Search..." 
        className="search-input" 
      
        style={{width: '100%', padding: '8px 50px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
      />
    </div>
  </div>

  {/* notification-btn and Focus Mode btn*/}
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <button className="notification-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}>
      <Bell size={20}/>
    </button>
    <button
      type="button"
      onClick={() => {}}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
    >
      Start Focus Mode
    </button>
  </div>
</header>
        <div className="page-container">
          <div>
            <section style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem"}}>
              <div style={{maxWidth: "40rem"}}>
                <div style={{display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem"}}>
                  <h2 style={{fontSize: "2.25rem", fontWeight: "700"}}>{spaceName || "Untitled Space"}</h2>
                  <span style={{background: "var(--primary-soft)", color: "var(--primary)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase"}}>Active</span>
                </div>
                <p style={{color: "var(--text-muted)", lineHeight: "1.6"}}>{spaceDescription || "No description available"}</p>
              </div>
              <div className="db-card" style={{textAlign: "center", minWidth: "180px", padding: "1.5rem"}}>
                <p style={{color: "var(--text-soft)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.5rem"}}>Completed Tasks</p>
                <span style={{fontSize: "2.25rem", fontWeight: "700"}}>{completedTasksCount}</span>
              </div>
            </section>
            <nav className="tabs">
              <NavLink to='/spaceoverview' className={({isActive})=> isActive? "tab active":"tab"}>Tasks</NavLink>
              <NavLink to='/workspaceNotes' className={({isActive}) => isActive? "tab active":"tab"}>Notes</NavLink>
              <NavLink to='/workspaceAnalytics' className={({isActive})=> isActive? "tab active":"tab"}>Analytics</NavLink>
            </nav>
          </div>
          <div className="tasks-notes-wrapper" style={{ overflow: 'visible' }}>

            {/* LEFT COLUMN: TASKS */}
            <div className="section-card" style={{ overflow: 'visible' }}>

              {/* Controls Header */}
              <div className="tasks-header-controls">
                <div className="view-toggle">
                  <button className="toggle-btn active">
                    <span>≡</span> List
                  </button>
                  <button className="toggle-btn" onClick={() => navigate('/workspaceTasks')}>
                    <span>◫</span> Board
                  </button>
                </div>
                <button className="add-btn" onClick={() => setOpenCreateTask(true)}>+</button>
              </div>

              {/* Task Table */}
              <table className="task-table" style={{ overflow: 'visible' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Progress</th>
                    <th>Urgency</th>
                    <th>Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#8c9196' }}>
                        Loading tasks...
                      </td>
                    </tr>
                  ) : displayTasks && displayTasks.length > 0 ? (
                    displayTasks.map((task, index) => {
                      const progress = getProgressDisplay(task.status);
                      const urgency = getUrgencyDisplay(task.priority);
                      const isCompleted = task.status?.toLowerCase() === 'done' || task.status?.toLowerCase() === 'completed';

                      return (
                        <tr
                          key={task.id || `task-${index}`}
                          onDoubleClick={() => navigate(`/workspace/${activeWorkspaceId}/space/${activeSpaceId}/task/${task.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Feature Column with Checkbox */}
                          <td>
                            <div className="task-feature-cell">
                              <div className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}>
                                {isCompleted && <span className="check-icon">✓</span>}
                              </div>
                              <span>{task.title}</span>
                            </div>
                          </td>

                          {/* Progress Column - read-only label */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: progress.color, fontWeight: 600, fontSize: '13px' }}>
                              <span>{progress.icon}</span>
                              <span>{progress.status}</span>
                            </div>
                          </td>

                          {/* Urgency Column - read-only label */}
                          <td>
                            <div style={{ color: urgency.color, fontWeight: 600, fontSize: '13px' }}>
                              {urgency.level}
                            </div>
                          </td>

                          {/* Assigned To Column */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {(() => {
                                const assignees = getAssignees(task);
                                return (
                                  <>
                                    {assignees.length > 0 ? (
                                      assignees.map((email, index) => (
                                        <div
                                          key={index}
                                          title={email}
                                          style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: getAvatarColor(index),
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            border: '2px solid #ffffff',
                                            marginLeft: index > 0 ? '-8px' : '0',
                                            zIndex: assignees.length - index,
                                            cursor: 'default'
                                          }}
                                        >
                                          {email ? email.charAt(0).toUpperCase() : '?'}
                                        </div>
                                      ))
                                    ) : (
                                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>Unassigned</span>
                                    )}
                                    <button
                                      type="button"
                                      title="Add User"
                                      onClick={() => setAddUserState({ taskId: task.id, value: '' })}
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e2e8f0',
                                        color: '#64748b',
                                        border: '2px solid #ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '-8px',
                                        zIndex: assignees.length + 1,
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        padding: 0
                                      }}
                                    >
                                      +
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                            {addUserState.taskId === task.id && (
                              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                <input
                                  type="email"
                                  autoFocus
                                  placeholder="Enter email..."
                                  value={addUserState.value}
                                  onChange={(e) => setAddUserState(prev => ({ ...prev, value: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newUser = addUserState.value.trim();
                                      if (newUser) {
                                        const currentAssignees = getAssignees(task);
                                        updateTask(activeWorkspaceId, activeSpaceId, task.id, { assignedTo: [...currentAssignees, newUser] });
                                      }
                                      setAddUserState({ taskId: null, value: '' });
                                    }
                                    if (e.key === 'Escape') {
                                      setAddUserState({ taskId: null, value: '' });
                                    }
                                  }}
                                  style={{ flex: 1, padding: '4px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUser = addUserState.value.trim();
                                    if (newUser) {
                                      const currentAssignees = getAssignees(task);
                                      updateTask(activeWorkspaceId, activeSpaceId, task.id, { assignedTo: [...currentAssignees, newUser] });
                                    }
                                    setAddUserState({ taskId: null, value: '' });
                                  }}
                                  style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: 'none', backgroundColor: '#8b5cf6', color: '#ffffff', cursor: 'pointer' }}
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAddUserState({ taskId: null, value: '' })}
                                  style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#8c9196' }}>
                        No tasks found. Create your first task to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Footer Link */}
              <Link to={'/workspaceTasks'}>
                <button className="view-all-tasks-btn">view all tasks</button>
              </Link>
            </div>

            {/* RIGHT COLUMN: RECENT NOTES */}
            <div className="notes-container" >
              <div className="section-header-flex">
                <h2 className="notes-header">Recent notes</h2>
                <a href="#all-notes" className="notes-link">view all</a>
              </div>

              <div className="notes-list">
                {notesData.map((note) => (
                  <div key={note.id} className="note-card">

                    <div className="note-title-wrap">
                      <span className="note-icon">{note.icon}</span>
                      <h3 className="note-title">{note.title}</h3>
                    </div>

                    {/* Conditional Rendering based on Note Type */}
                    {note.type === 'text' && (
                      <p className="note-text">{note.content}</p>
                    )}

                    {note.type === 'image' && (
                      <>
                        <img src={note.image} alt="Note Attachment" className="note-image" />
                        <p className="note-text">{note.content}</p>
                      </>
                    )}

                    {note.type === 'list' && (
                      <div className="note-checklist">
                        {note.items.map((item) => (
                          <div key={item.id} className={`checklist-item ${item.isSubItem ? 'sub-item' : ''}`}>
                            <input type="checkbox" />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Create Task Modal */}
        <CreateNewTask
          openCreateTask={openCreateTask}
          setOpenCreateTask={setOpenCreateTask}
        />

      </div>
    </div>
  );
};
export default SpaceOverview;