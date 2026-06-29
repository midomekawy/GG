import { AlertCircle, Clock, Search, PlusCircle, Filter } from "lucide-react";
import '../HomeComponent/home.css';
import '../WorkspacesComponent/workspace.css';
import Header from "../HomeComponent/Header";
import TopSection from "../WorkspacesComponent/TopSection";
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import { useState, useEffect } from "react";
import CreateNewTask from "../TaskComponent/CreateNewTask";
import { Link } from "react-router-dom";
import { useTasks } from "../../context/TasksContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";

const SpaceTasks = ()=>{
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const { tasks, fetchTasks } = useTasks();
  const { activeWorkspaceId } = useWorkspace();
  const { spaces, activeSpaceId } = useSpaces();
  
  // Fetch tasks when component mounts or space changes
  
  useEffect(() => {
    if (activeWorkspaceId && activeSpaceId) {
      // Temporarily disabled tasks API
      // fetchTasks(activeWorkspaceId, activeSpaceId, { PageNumber: 1, PageSize: 20 });
    }
  }, [activeWorkspaceId, activeSpaceId, fetchTasks]);

  // Get current space from context
  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "Tasks Board";
  const spaceDescription = currentSpace?.description || "Manage your space tasks";

  // Filter tasks by active space first, using robust fallback property names
  const spaceTasks = tasks.filter(task => {
    const taskSpaceId = task.spaceId || task.SpaceId || task.spaceGUID || task.SpaceGuid || task.spaceGuid;
    return String(taskSpaceId) === String(activeSpaceId);
  });

  // Filter tasks by status (standardized values: 'todo', 'on-progress', 'done')
  const todoTasks = spaceTasks.filter(task => task.status?.toLowerCase() === 'todo');
  const onProgressTasks = spaceTasks.filter(task => task.status?.toLowerCase() === 'on-progress');
  const doneTasks = spaceTasks.filter(task => task.status?.toLowerCase() === 'done');
    return(
        <div className="app-container">
        <SidebarofWorkspace/>
        <main className="main-content" style={{marginLeft:"var(--workspace-sidebar-width, 256px)"}}>
       <Header/>
      <div className="page-container">
        <TopSection spaceName={spaceName} spaceDescription={spaceDescription} />
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem"}}>
          <div style={{display:"flex", gap: "1rem"}}>
            <div className="search-bar" style={{width: "16rem"}}>
              <Search style={{position:'absolute',left:'10',top:'10',zIndex:'3'}} size={18}/>
              <input type="text" placeholder="Search..." className="search-input" style={{position:'relative',background: "white", border: "1px solid var(--border-color)"}}/>
            </div>
            <button className="control-btn" style={{background: "white", border: "1px solid var(--border-color)", padding: "0.625rem",marginLeft:'80px'}}><Filter/></button>
          </div>
          <button onClick={()=>{setOpenCreateTask(true)}} style={{display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--primary)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "var(--shadow-primary)"}}>
            <PlusCircle/>
            <span>Create Task</span>
          </button>
        </div>

        <div className="kanban-board">
          {/* <!-- Done Column --> */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-dot" style={{background: "#22C55E"}}></div>
              <h3 className="column-title">Done</h3>
              <span className="column-count">{doneTasks.length}</span>
            </div>
            <div className="column-content column-done">
              {doneTasks && doneTasks.length > 0 ? (
                doneTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <span className="task-status-tag tag-done">Completed</span>
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-desc">{task.description}</p>
                    <div className="task-footer">
                      <div className="task-avatars">
                        {task.assigneeEmail && <img src={`https://picsum.photos/seed/${task.id}/24/24`}/>}
                      </div>
                      <div className="task-meta"><Clock/><span>{task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No due date'}</span></div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{color: "#8c9196", fontSize: "13px", padding: "10px"}}>No completed tasks</p>
              )}
            </div>
          </div>

          {/* <!-- Progress Column --> */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-dot" style={{background: "#F97316"}}></div>
              <h3 className="column-title">On progress</h3>
              <span className="column-count">{onProgressTasks.length}</span>
            </div>
            <div className="column-content column-progress">
              {onProgressTasks && onProgressTasks.length > 0 ? (
                onProgressTasks.map((task) => (
                  <Link key={task.id} to={'/workspacetaskspecific'}>
                    <div className="task-card">
                      <span className="task-status-tag tag-progress">Ongoing</span>
                      <h4 className="task-title">{task.title}</h4>
                      <p className="task-desc">{task.description}</p>
                      <div className="progress-bar"><div className="progress-fill" style={{width: "50%", background: "#F97316"}}></div></div>
                      <div className="task-footer">
                        <div className="task-avatars">
                          {task.assigneeEmail && <img src={`https://picsum.photos/seed/${task.id}/24/24`}/>}
                        </div>
                        <div className="task-meta"><span>50%</span></div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{color: "#8c9196", fontSize: "13px", padding: "10px"}}>No tasks in progress</p>
              )}
            </div>
          </div>

          {/* <!-- To Do Column --> */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-dot" style={{background: "#EF4444"}}></div>
              <h3 className="column-title">To do</h3>
              <span className="column-count">{todoTasks.length}</span>
            </div>
            <div className="column-content column-todo">
              {todoTasks && todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <span className="task-status-tag tag-todo">To Do</span>
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-desc">{task.description}</p>
                    <div className="task-footer">
                      <div className="task-avatars">
                        {task.assigneeEmail && <img src={`https://picsum.photos/seed/${task.id}/24/24`}/>}
                      </div>
                      <div className="task-meta" style={{color: "#EF4444"}}><AlertCircle/><span>{task.dueDate ? `${Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left` : 'No due date'}</span></div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{color: "#8c9196", fontSize: "13px", padding: "10px"}}>No tasks to do</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
    {openCreateTask && <CreateNewTask openCreateTask={openCreateTask} setOpenCreateTask={setOpenCreateTask}/>}
        </div>
    )
};
export default SpaceTasks;