import "./dashboard.css";
import "../HomeComponent/home.css";
import Sidebar from "../HomeComponent/Sidebar";
import { ArrowUpRight, Bell, Calendar, ChevronLeft, ChevronRight, Download, LayoutDashboard, MessageCircleMore, Search, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useEffect, useMemo, useState } from "react";
import CompletedTasksDetails from "./CompletedTasksDetails";
import TaskStatusDetails from "./TaskStatusDetails";
import FocusSessionDetails from "./FocusSessionDetails";
import { getWorkspaceDashboard } from "../../services/api";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useTasks } from "../../context/TasksContext";
import { useSpaces } from "../../context/SpacesContext";

function pickNumber(obj, ...keys) {
  if (!obj || typeof obj !== "object") return 0;
  for (const key of keys) {
    if (obj[key] != null && !Number.isNaN(Number(obj[key]))) return Number(obj[key]);
  }
  return 0;
}

function pickArray(obj, ...keys) {
  if (!obj || typeof obj !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key];
  }
  return [];
}

const Dashboard = () => {
  const { activeWorkspaceId } = useWorkspace();
  const { tasks, fetchTasks } = useTasks();
  const { activeSpaceId } = useSpaces();
  const [openCompletedTasksDetails, setOpenCompletedTasksDetails] = useState(false);
  const [openFocusSessionDetails, setOpenFocusSessionDetails] = useState(false);
  const [openTaskStatusDetails, setOpenTaskStatusDetails] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (activeWorkspaceId) {
          res = await getWorkspaceDashboard(activeWorkspaceId);
        }
        const raw = res?.data?.data ?? res?.data?.result ?? res?.data?.payload ?? res?.data;
        console.log("Workspace dashboard response:", raw);
        if (!cancelled) setDashboard(raw || {});
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

  // Load tasks for the active space if they are not already loaded
  useEffect(() => {
    if (activeWorkspaceId && activeSpaceId) {
      const workspaceTasks = tasks.filter(t => String(t.workspaceId) === String(activeWorkspaceId));
      if (workspaceTasks.length === 0) {
        fetchTasks(activeWorkspaceId, activeSpaceId);
      }
    }
  }, [activeWorkspaceId, activeSpaceId, tasks, fetchTasks]);

  const workspaceTasks = useMemo(() => {
    if (!activeWorkspaceId) return [];
    return tasks.filter(t => String(t.workspaceId) === String(activeWorkspaceId));
  }, [tasks, activeWorkspaceId]);

  const localTotalTasks = workspaceTasks.length;
  const localCompletedTasks = workspaceTasks.filter(t => t.status === 'done' || t.status === 2).length;
  const localInProgressTasks = workspaceTasks.filter(t => t.status === 'on-progress' || t.status === 1).length;
  const localTodoTasks = workspaceTasks.filter(t => t.status === 'todo' || t.status === 0 || t.status === undefined || t.status === null).length;
  const localOverdueTasks = workspaceTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 2).length;

  const stats = dashboard?.stats ?? dashboard?.Stats ?? dashboard;
  const totalTasks = localTotalTasks || pickNumber(stats, "totalTasks", "TotalTasks", "tasksCount", "taskCount");
  const completedTasks = localCompletedTasks || pickNumber(stats, "completedTasks", "CompletedTasks", "doneTasks", "tasksCompleted");
  const inProgressTasks = localInProgressTasks || pickNumber(stats, "inProgressTasks", "InProgressTasks", "inProgressCount");
  const todoTasks = localTodoTasks || pickNumber(stats, "todoTasks", "TodoTasks", "toDoCount", "pendingTasks");
  const overdueTasks = localOverdueTasks || pickNumber(stats, "overdueTasks", "OverdueTasks", "overDueCount");
  const focusSessions = pickNumber(stats, "focusSessionsThisWeek", "totalFocusSessions", "focusSessionsCount", "focusSessions");
  const focusHours = pickNumber(stats, "focusTimeHours", "totalFocusHours", "focusHours", "totalFocusTimeHours");
  const productivityScore = pickNumber(stats, "productivityScore", "ProductivityScore", "score");
  const focusCompletionRate = pickNumber(stats, "focusCompletionRate", "FocusCompletionRate", "focusCompletedRate");
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const lineData = useMemo(() => {
    const weekly = dashboard?.weeklyFocusTime ?? dashboard?.WeeklyFocusTime;
    const series = weekly?.days ?? weekly ?? pickArray(dashboard, "productivityTrend", "focusTrend", "chartData");
    if (series.length > 0) {
      return series.map((pt, i) => ({
        name: pt.day ?? pt.name ?? pt.label ?? pt.week ?? `W${i + 1}`,
        uv: pickNumber(pt, "hours", "value", "productivity", "score", "uv")
      }));
    }
    return [
      { name: "Week 1", uv: 35 }, { name: "", uv: 40 }, { name: "", uv: 20 },
      { name: "Week 2", uv: 25 }, { name: "", uv: 22 }, { name: "", uv: 45 },
      { name: "", uv: 48 }, { name: "Week 3", uv: 40 }, { name: "", uv: 68 },
      { name: "", uv: 67 }, { name: "", uv: 82 }, { name: "Week 4", uv: 84 },
      { name: "", uv: 62 }, { name: "", uv: 60 }, { name: "", uv: 65 },
      { name: "", uv: 50 }, { name: "", uv: 62 }, { name: "", uv: 65 }
    ];
  }, [dashboard]);

  const pieData = useMemo(() => {
    const status = pickArray(dashboard, "taskStatusBreakdown", "statusBreakdown", "taskStatus");
    if (status.length > 0) {
      return status.map((s) => ({
        name: s.name ?? s.label ?? s.status ?? "Unknown",
        value: pickNumber(s, "value", "count", "percentage"),
        color: s.color ?? "#8884d8"
      }));
    }
    return [
      { name: "Completed", value: completedTasks || 55, color: "#22c55e" },
      { name: "In Progress", value: inProgressTasks || 25, color: "#60a5fa" },
      { name: "To Do", value: todoTasks || 15, color: "#e5e7eb" },
      { name: "Over Due", value: overdueTasks || 5, color: "#ef4444" }
    ];
  }, [dashboard, completedTasks, inProgressTasks, todoTasks, overdueTasks]);

  const gaugeData = [
    { name: "Completed", value: completionRate || 67, color: "#a78bfa" },
    { name: "Remaining", value: 100 - (completionRate || 67), color: "#e5e7eb" }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="header-section">
          <div className="search-box">
            <Search size={20}/>
            <input placeholder="Search..."/>
          </div>
          <div className="buttons">
            <button><MessageCircleMore/></button>
            <button style={{cursor:'pointer',position:'relative'}}><Bell fill="black"/>
            <span style={{position:'absolute',width:'10px',height:'10px',borderRadius:'50%',top:'10px',right:'12px',border:'2px solid white',backgroundColor:'red',zIndex:'3'}}></span>
            </button>
          </div>
        </header>
        <div className="page-container">
          
        <div className="dashboard-container">
      
      {/* --- Left Column --- */}
      <div className="left-column">
        
        {/* Top Row: Gauge & Stats */}
        <div className="top-row">
          {/* Tasks Completed Gauge */}
          <div className="card gauge-card card-border-purple" onClick={()=>{setOpenCompletedTasksDetails(true)}}>
            <div className="gauge-header">
              <h2>{loading ? "…" : `${completedTasks}/${totalTasks}`}</h2>
              <span>Tasks<br/>Completed</span>
            </div>
            <div className="gauge-chart-container">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="gauge-text">
                <h3>{loading ? "…" : `${completionRate}%`}</h3>
                <p>{loading ? "…" : "Tasks Done"}</p>
              </div>
            </div>
          </div>

          {/* Focus Sessions Stats */}
          <div className="card focus-card card-border-blue" onClick={()=>{setOpenFocusSessionDetails(true)}}>
            <h2>{loading ? "…" : `${focusSessions} Focus sessions`}<br/>this week</h2>
            <p className="subtitle">{loading ? "…" : `${focusHours} h - Total focus time`}</p>
            <p className="trend">
              <TrendingUp size={14} className="trend-icon" />
              <strong>{loading ? "…" : `${focusCompletionRate}%`}</strong> tasks completed during focus
            </p>
          </div>
        </div>

        {/* Bottom Row: Line Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <span>{loading ? "Loading…" : "Weekly focus hours"}</span>
            <TrendingUp size={14} className="trend-icon-sm" />
          </div>
          <div className="line-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={true} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  domain={[0, 90]} 
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="uv" 
                  stroke="#4c3b9b" 
                  strokeWidth={2.5} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Right Column --- */}
      <div className="right-column">
        
        {/* Pie Chart Card */}
        <div className="card pie-card card-border-purple-light" onClick={()=>{setOpenTaskStatusDetails(true)}}>
          <h3>Tasks Status Breakdown</h3>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <ul className="custom-legend">
            {pieData.map((item, index) => (
              <li key={index}>
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Alert Card */}
        <div className="card alert-card card-border-purple-light">
          <div className="alert-icon">
            <span role="img" aria-label="robot">🤖</span>
          </div>
          <p>
            {loading ? "Loading…" : overdueTasks > 0 ? (
              <>You have <em>{overdueTasks} over due tasks</em>, you can start a focus session to estimate your productivity</>
            ) : (
              "No overdue tasks. Great job!"
            )}
          </p>
        </div>

      </div>
    </div>

        </div>
      </main>
      {openCompletedTasksDetails && (
        <CompletedTasksDetails
          setOpenCTD={setOpenCompletedTasksDetails}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          completionRate={completionRate}
          tasks={workspaceTasks}
          loading={loading}
        />
      )}
      {openFocusSessionDetails && (
        <FocusSessionDetails
          setOpenFSD={setOpenFocusSessionDetails}
          focusSessions={focusSessions}
          focusHours={focusHours}
          focusCompletionRate={focusCompletionRate}
          loading={loading}
        />
      )}
      {openTaskStatusDetails && (
        <TaskStatusDetails
          setOpenTSD={setOpenTaskStatusDetails}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          todoTasks={todoTasks}
          overdueTasks={overdueTasks}
          loading={loading}
        />
      )}
    </div>
  );
};
export default Dashboard;