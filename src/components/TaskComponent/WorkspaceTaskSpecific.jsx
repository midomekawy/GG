import { CalendarDays, ChevronRightIcon, Flag, Folder, Image, Maximize, Pencil, Plus, Share2, Trash2, User2 } from "lucide-react";
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace"
import '../WorkspacesComponent/stylesofWS.css';
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import UpdateTask from './UpdateTask';
import DeleteTask from "./DeleteTask";
import { useTasks } from "../../context/TasksContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";

const AVATAR_COLORS = ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981'];

const getAvatarColor = (index) => {
    if (index >= 0 && index < AVATAR_COLORS.length) return AVATAR_COLORS[index];
    return AVATAR_COLORS[index % AVATAR_COLORS.length] || '#94a3b8';
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

const WorkspaceTaskSpecific = ()=>{
    const { taskId, workspaceId, spaceId } = useParams();
    const { getTaskById, updateTask, fetchTasks, isLoading, error, assignTask, unassignTask, updateTaskStatus } = useTasks();
    const { activeWorkspaceId } = useWorkspace();
    const { activeSpaceId, spaces } = useSpaces();

    const task = getTaskById(taskId);

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const isDeletingRef = useRef(false);
    const [subtasks, setSubtasks] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [addUserValue, setAddUserValue] = useState('');

    const resolvedWorkspaceId = parseInt(workspaceId || activeWorkspaceId, 10) || null;
    const resolvedSpaceId = spaceId || activeSpaceId;

    useEffect(() => {
        if (task) {
            const normalizedSubtasks = Array.isArray(task.subtasks)
                ? task.subtasks.map(s => typeof s === 'string' ? { title: s, completed: false } : { ...s, completed: s.completed || false })
                : [];
            setSubtasks(normalizedSubtasks);
            setAttachments(Array.isArray(task.attachments) ? task.attachments : []);
        }
    }, [task]);

    useEffect(() => {
        if (!task && resolvedWorkspaceId && resolvedSpaceId && !isDeletingRef.current) {
            fetchTasks(resolvedWorkspaceId, resolvedSpaceId);
        }
    }, [task, resolvedWorkspaceId, resolvedSpaceId, fetchTasks]);

    if (isLoading || (!task && !error)) {
        return (
            <div className="app-container">
                <SidebarofWorkspace />
                <div className="main-content" style={{ marginLeft: '130px', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
                    <div className="task-details-wrapper">
                        <p style={{ color: '#64748b' }}>Loading task...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !task) {
        return (
            <div className="app-container">
                <SidebarofWorkspace />
                <div className="main-content" style={{ marginLeft: '130px', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
                    <div className="task-details-wrapper">
                        <p style={{ color: '#ef4444' }}>Error loading task: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="app-container">
                <SidebarofWorkspace />
                <div className="main-content" style={{ marginLeft: '130px', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
                    <div className="task-details-wrapper">
                        <p style={{ color: '#64748b' }}>Task not found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const toggleSubtask = (index) => {
        setSubtasks(prev => {
            const next = [...prev];
            next[index] = { ...next[index], completed: !next[index].completed };
            return next;
        });
    };

    const handleAttachmentUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newAttachments = files.map(file => ({
            name: file.name,
            file,
            url: URL.createObjectURL(file)
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const completionPercentage = subtasks.length > 0
        ? Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)
        : 0;

    const statusLabel = typeof task.status === 'string' ? task.status.replace(/-/g, ' ').toUpperCase() : 'TO DO';
    const statusColor = task.status === 'done' ? '#10b981' : task.status === 'on-progress' ? '#8b5cf6' : '#64748b';
    const priorityLabel = typeof task.priority === 'string' ? task.priority : 'Low';
    const priorityColor = priorityLabel === 'Critical' ? '#ef4444' : priorityLabel === 'Moderate' ? '#f59e0b' : '#10b981';
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';
    const spaceName = spaces?.find(s => String(s.id) === String(resolvedSpaceId))?.name || 'Space';

    return(
        <div className="app-container">
            <SidebarofWorkspace/>
          <div className="main-content" style={{ marginLeft: '130px', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
              <div className="task-details-wrapper">
      {/* HEADER ROW */}
      <div className="task-top-header">
        <div className="breadcrumbs">
          <span>{spaceName}</span>
          <span><ChevronRightIcon/></span>
          <span>Tasks</span>
          <span><ChevronRightIcon/></span>
          <span className="active">{task.title}</span>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={handleShare}>
            <span aria-hidden="true"><Share2 size={16}/></span> Share
          </button>
          <button className="btn" onClick={() => setIsUpdateOpen(true)}>
            <span aria-hidden="true"><Pencil size={16}/></span> Edit
          </button>
          <button className="btn btn-delete" onClick={() => setIsDeleteOpen(true)}>
            <span aria-hidden="true"><Trash2 size={16}/></span> Delete
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="task-content-grid">
        
        {/* LEFT COLUMN: TASK CONTENT */}
        <div className="task-main-col">
          
          {/* Header Info */}
          <div className="task-header-info">
            <div className="task-status-row">
              <div className="status-badge">
                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                {statusLabel}
              </div>
              <select
                value={task.status || 'todo'}
                onChange={(e) => updateTaskStatus(resolvedWorkspaceId, resolvedSpaceId, task.id, e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="todo">To Do</option>
                <option value="on-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <span className="task-id">#{task.id}</span>
            </div>
            <h1 className="task-title" onDoubleClick={() => setIsUpdateOpen(true)} style={{ cursor: 'pointer' }}>{task.title}</h1>
          </div>

          {/* Description */}
          <div className="task-description">
            <h3 className="section-label">DESCRIPTION</h3>
            <p>{task.description || 'No description provided.'}</p>
          </div>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="task-subtasks">
              <div className="subtasks-header">
                <h3 className="section-label" style={{ marginBottom: 0 }}>SUBTASKS</h3>
                <span className="subtasks-progress-text">{completionPercentage}% Complete</span>
              </div>

              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
              </div>

              <div className="subtasks-list">
                {subtasks.map((subtask, index) => {
                  const isCompleted = subtask.completed || false;
                  return (
                    <div className="subtask-item" key={index}>
                      <div className="subtask-left">
                        <input
                          type="checkbox"
                          className={`subtask-checkbox ${isCompleted ? 'checked' : ''}`}
                          checked={isCompleted}
                          onChange={() => toggleSubtask(index)}
                        />
                        <span className={`subtask-text ${isCompleted ? 'completed' : ''}`}>{subtask.title || subtask.text || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="add-subtask-btn" onClick={()=>setIsUpdateOpen(true)}>
                <span><Plus size={16}/></span> Add Subtask
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR METADATA */}
        <div className="task-sidebar-card">
          
          {/* Metadata Grid */}
          <div>
            <h3 className="section-label">METADATA</h3>
            <div className="metadata-list">
              <div className="metadata-row">
                <span className="metadata-label"><span className="metadata-icon"><User2 size={16}/></span> Assignee</span>
                <div className="metadata-value" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
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
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: getAvatarColor(index),
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
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
                          onClick={() => setAddUserOpen(true)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            color: '#64748b',
                            border: '2px solid #ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: assignees.length > 0 ? '-8px' : '0',
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
                  {addUserOpen && (
                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <input
                        type="email"
                        autoFocus
                        placeholder="Enter email..."
                        value={addUserValue}
                        onChange={(e) => setAddUserValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newUser = addUserValue.trim();
                            if (newUser) {
                              assignTask(resolvedWorkspaceId, resolvedSpaceId, task.id, newUser);
                            }
                            setAddUserValue('');
                            setAddUserOpen(false);
                          }
                          if (e.key === 'Escape') {
                            setAddUserValue('');
                            setAddUserOpen(false);
                          }
                        }}
                        style={{ flex: 1, padding: '4px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newUser = addUserValue.trim();
                          if (newUser) {
                            assignTask(resolvedWorkspaceId, resolvedSpaceId, task.id, newUser);
                          }
                          setAddUserValue('');
                          setAddUserOpen(false);
                        }}
                        style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: 'none', backgroundColor: '#8b5cf6', color: '#ffffff', cursor: 'pointer' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddUserValue('');
                          setAddUserOpen(false);
                        }}
                        style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="metadata-row">
                <span className="metadata-label"><span className="metadata-icon"><CalendarDays size={16}/></span> Due Date</span>
                <span className="metadata-value due-date">{dueDate}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label"><span className="metadata-icon"><Flag size={16}/></span> Priority</span>
                <span className="priority-badge" style={{ color: priorityColor, backgroundColor: `${priorityColor}15` }}>{priorityLabel}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label"><span className="metadata-icon"><Maximize size={16}/></span> Space</span>
                <span className="metadata-value space">{spaceName}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="section-label">TAGS</h3>
            <div className="tags-list">
              <span className="tag-pill">UI/UX</span>
              <span className="tag-pill">Mobile</span>
              <button className="add-tag-btn"><Plus size={16}/>Add Tag</button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="section-label">ATTACHMENTS</h3>
            {attachments.length > 0 ? (
              <div className="attachments-list">
                {attachments.map((attachment, index) => {
                  const name = typeof attachment === 'string' ? attachment : (attachment.name || attachment.fileName || 'Attachment');
                  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(name);
                  return (
                    <div className="attachment-item" key={index}>
                      <span className={`file-icon ${isImage ? 'img' : 'pdf'}`}>{isImage ? <Image size={16}/> : <Folder size={16}/>}</span> {name}
                    </div>
                  );
                })}
              </div>
            ) : (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                <Plus size={16} /> Upload
                <input type="file" style={{ display: 'none' }} onChange={handleAttachmentUpload} multiple />
              </label>
            )}
          </div>

        </div>

      </div>
    </div>
          </div>
          {isUpdateOpen && <UpdateTask task={task} setUpdateTask={setIsUpdateOpen} workspaceId={resolvedWorkspaceId} spaceId={resolvedSpaceId}/>}
          {isDeleteOpen && <DeleteTask setDeleteTask={setIsDeleteOpen} taskId={task.id} workspaceId={resolvedWorkspaceId} spaceId={resolvedSpaceId} isDeletingRef={isDeletingRef}/>}
        </div>
    )
};
export default WorkspaceTaskSpecific;