import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import '../WorkspacesComponent/stylesofWS.css';
import '../HomeComponent/home.css';
import { NavLink, useNavigate } from "react-router-dom";
import { useTasks } from "../../context/TasksContext";
import { useSpaces } from "../../context/SpacesContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useState, useEffect, useRef } from "react";
import CreateNewTask from "../TaskComponent/CreateNewTask";
import { Bell, ChevronLeft, ChevronRight, Search } from "lucide-react";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import ViewColumnRoundedIcon from "@mui/icons-material/ViewColumnRounded";

import DrawingPreview from "../NoteComponent/DrawingPreview";

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
  const { spaces, activeSpaceId, getSpaceNotes, fetchSpaceNotes, notesLoading } = useSpaces();
  const { activeWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [addUserState, setAddUserState] = useState({ taskId: null, value: '' });
  const [taskView, setTaskView] = useState("list");
  const [openFocusMode, setOpenFocusMode] = useState(false);

  // Fetch tasks and notes when component mounts or when space changes
  useEffect(() => {
    if (activeWorkspaceId && activeSpaceId) {
      fetchTasks(activeWorkspaceId, activeSpaceId, { PageNumber: 1, PageSize: 20 });
      fetchSpaceNotes(activeWorkspaceId, activeSpaceId);
    }
  }, [activeWorkspaceId, activeSpaceId, fetchTasks, fetchSpaceNotes]);

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

  // Get real notes for the active space and show top 3 recent notes
  const spaceNotes = getSpaceNotes(activeSpaceId);
  const recentNotes = spaceNotes
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 3);

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

  const groupedTasks = {
    done: spaceTasks.filter((task) => {
      const status = typeof task.status === 'string' ? task.status.toLowerCase() : '';
      return status === 'done' || status === 'completed';
    }),
    progress: spaceTasks.filter((task) => {
      const status = typeof task.status === 'string' ? task.status.toLowerCase() : '';
      return status === 'on-progress' || status === 'in-progress';
    }),
    todo: spaceTasks.filter((task) => {
      const status = typeof task.status === 'string' ? task.status.toLowerCase() : '';
      return status !== 'done' && status !== 'completed' && status !== 'on-progress' && status !== 'in-progress';
    }),
  };

  const boardColumns = [
    {
      key: "done",
      title: "Done",
      dot: "#22c55e",
      border: "#22c55e",
      background: "rgba(34, 197, 94, 0.03)",
      icon: "✓",
      items: groupedTasks.done,
    },
    {
      key: "progress",
      title: "On progress",
      dot: "#f97316",
      border: "#f97316",
      background: "rgba(249, 115, 22, 0.03)",
      icon: "◔",
      items: groupedTasks.progress,
    },
    {
      key: "todo",
      title: "To do",
      dot: "#ef4444",
      border: "#ef4444",
      background: "rgba(239, 68, 68, 0.03)",
      icon: "○",
      items: groupedTasks.todo,
    },
  ];

  function renderTaskCard(task, columnKey) {
    const progress = getProgressDisplay(task.status);
    const urgency = getUrgencyDisplay(task.priority);
    const assignees = getAssignees(task);
    const isCompleted = task.status?.toLowerCase() === 'done' || task.status?.toLowerCase() === 'completed';

    const progressPercent = columnKey === "done" ? 100 : columnKey === "progress" ? 62 : 18;
    const progressLabel = columnKey === "done" ? "Done" : columnKey === "progress" ? "Ongoing" : "Pending";

    return (
      <div
        key={task.id}
        className="task-card"
        style={{
          borderRadius: "16px",
          padding: "14px",
          border: "1px solid #eef2f7",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
          cursor: "pointer",
        }}
        onClick={() => navigate(`/workspace/${activeWorkspaceId}/space/${activeSpaceId}/task/${task.id}`)}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 700,
              color: columnKey === "done" ? "#16a34a" : columnKey === "progress" ? "#f97316" : "#ef4444",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {columnKey === "done" ? "Completed" : columnKey === "progress" ? "Ongoing" : "To do"}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>⋯</span>
        </div>

        <h4 style={{ margin: "8px 0 6px", fontSize: "14px", lineHeight: 1.35, color: "#0f172a" }}>
          {task.title}
        </h4>

        {task.description ? (
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.45, color: "#64748b" }}>
            {task.description}
          </p>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: urgency.color === "#ef4444" ? "#fee2e2" : urgency.color === "#f59e0b" ? "#fef3c7" : "#dcfce7",
              color: urgency.color,
              fontWeight: 700,
            }}
          >
            {urgency.level}
          </span>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{progressLabel}</span>
        </div>

        <div style={{ marginTop: "10px" }}>
          <div style={{ height: "4px", background: "#eef2ff", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                borderRadius: "999px",
                background: columnKey === "done" ? "#22c55e" : columnKey === "progress" ? "#6366f1" : "#f97316",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "-8px" }}>
              {assignees.length > 0 ? (
                assignees.slice(0, 2).map((email, index) => (
                  <div
                    key={index}
                    title={email}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: getAvatarColor(index),
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: "2px solid #fff",
                      marginLeft: index > 0 ? "-8px" : 0,
                    }}
                  >
                    {email ? email.charAt(0).toUpperCase() : "?"}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Unassigned</span>
              )}
            </div>
            {task.dueDate ? (
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>

        {isCompleted ? null : (
          <div style={{ marginTop: "10px", color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>
            {progress.icon} {progress.status}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="app-container">
      <SidebarofWorkspace />
      <div
        className="main-content"
        style={{ marginLeft: 'var(--workspace-sidebar-width, 256px)' }}
      >
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
      onClick={() => navigate('/focussetup')}
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
          {taskView === "list" ? (
            <div className="tasks-notes-wrapper" style={{ overflow: 'visible' }}>

            {/* LEFT COLUMN: TASKS */}
            <div className="section-card" style={{ overflow: 'visible' }}>

              {/* Controls Header */}
              <div className="tasks-header-controls">
                <div className="view-toggle">
                  <button type="button" className="toggle-btn active" onClick={() => setTaskView("list")}>
                    <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} /> List
                  </button>
                  <button type="button" className="toggle-btn" onClick={() => setTaskView("board")}>
                    <ViewColumnRoundedIcon sx={{ fontSize: 18 }} /> Board
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
              <button
                type="button"
                className="view-all-tasks-btn"
                onClick={() => setTaskView("board")}
              >
                view all tasks
              </button>
            </div>

            {/* RIGHT COLUMN: RECENT NOTES */}
            <div className="notes-container" >
              <div className="section-header-flex">
                <h2 className="notes-header">Recent notes</h2>
                <NavLink to='/workspaceNotes' className="notes-link">view all</NavLink>
              </div>

              <div className="notes-list">
                {notesLoading ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px', padding: '1rem 0' }}>Loading notes…</p>
                ) : recentNotes.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px', padding: '1rem 0' }}>No notes yet.</p>
                ) : (
                  recentNotes.map((note) => (
                    <div key={note.id} className="note-card">

                      <div className="note-title-wrap">
                        <span className="note-icon">{note.type === 'voice' ? '🔊' : note.type === 'draw' ? '✏️' : note.type === 'image' ? '🖼️' : '📝'}</span>
                        <h3 className="note-title">{note.title || 'Untitled note'}</h3>
                      </div>

                      {/* Conditional Rendering based on Note Type */}
                      {(note.type === 'text' || !note.type) && (
                        <p className="note-text">{note.content || 'No content'}</p>
                      )}

                      {note.type === 'image' && (
                        <>
                          <img src={note.imageUrl} alt="Note Attachment" className="note-image" />
                          <p className="note-text">{note.content || ''}</p>
                        </>
                      )}

                      {note.type === 'voice' && (
                        <audio controls src={note.audioUrl} style={{ width: '100%', marginBottom: '8px' }}>
                          Your browser does not support the audio element.
                        </audio>
                      )}

                      {note.type === 'draw' && (
                        <div style={{ marginBottom: '8px' }}>
                          <DrawingPreview drawingData={note.drawingData} />
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
          ) : (
            <div style={{ paddingBottom: "24px" }}>
              <div className="tasks-header-controls" style={{ marginTop: "6px" }}>
                <div className="view-toggle">
                  <button type="button" className="toggle-btn" onClick={() => setTaskView("list")}>
                    <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} /> List
                  </button>
                  <button type="button" className="toggle-btn active" onClick={() => setTaskView("board")}>
                    <ViewColumnRoundedIcon sx={{ fontSize: 18 }} /> Board
                  </button>
                </div>
                <button className="add-btn" onClick={() => setOpenCreateTask(true)}>+</button>
              </div>

              <div
                className="kanban-board"
                style={{
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "18px",
                  marginTop: "18px",
                  alignItems: "start",
                }}
              >
                {boardColumns.map((column) => (
                  <div
                    key={column.key}
                    className="kanban-column"
                    style={{
                      border: `1px solid ${column.border}`,
                      borderRadius: "28px",
                      background: "#fff",
                      padding: "16px",
                      minHeight: "78vh",
                      boxShadow: "0 14px 30px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <div className="column-header" style={{ padding: 0, marginBottom: "14px" }}>
                      <div className="column-dot" style={{ background: column.dot }} />
                      <h3 className="column-title" style={{ margin: 0 }}>{column.title}</h3>
                      <span className="column-count">{column.items.length}</span>
                    </div>

                    <div
                      className={`column-content column-${column.key === "progress" ? "progress" : column.key}`}
                      style={{
                        minHeight: "auto",
                        border: "none",
                        background: column.background,
                        borderRadius: "22px",
                        padding: "14px",
                        gap: "14px",
                      }}
                    >
                      {column.items.length > 0 ? (
                        column.items.map((task) => renderTaskCard(task, column.key))
                      ) : (
                        <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                          No tasks here yet.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => setTaskView("list")}
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    color: "#475569",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back to list
                </button>
              </div>
            </div>
          )}
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