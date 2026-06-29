import { useEffect, useMemo, useRef, useState } from 'react';
import Header from "../HomeComponent/Header";
import '../HomeComponent/home.css';
import SidebarofWorkspace from "../WorkspacesComponent/SidebarofWorkspace";
import TopSection from "../WorkspacesComponent/TopSection";
import '../WorkspacesComponent/workspace.css';
import AvtImg from '../../assets/images/avatar1.jpg';
import AvtImg2 from '../../assets/images/avatar2.jpg';
import { useSpaces } from "../../context/SpacesContext";
import { useTasks } from "../../context/TasksContext";
import { getSpaceAnalytics } from "../../services/api";
const Card = ({ children, className = '' }) => (
  <div className={`dashboard-card ${className}`}>
    {children}
  </div>
);
function normalizePriority(p) {
  const value = String(p || '').toLowerCase();
  if (value === 'high' || value === 'critical' || value === '2') return 'high';
  if (value === 'medium' || value === 'moderate' || value === 'med' || value === '1') return 'medium';
  return 'low';
}

function normalizeAnalytics(data) {
  const d = data || {};
  return {
    totalTasks: d.totalTasks ?? d.total ?? d.taskCount ?? 0,
    completedTasks: d.completedTasks ?? d.completed ?? d.done ?? 0,
    inProgressTasks: d.inProgressTasks ?? d.inProgress ?? d.onProgress ?? 0,
    pendingTasks: d.pendingTasks ?? d.pending ?? d.todo ?? 0,
    priorityDistribution: d.priorityDistribution || d.priorities || {},
    completionTrend: d.completionTrend || d.trend || d.weeklyTrend || [],
    teamProductivity: d.teamProductivity || d.team || d.members || [],
  };
}

const SpaceAnalytics = () => {
  const { spaces, activeSpaceId } = useSpaces();
  const { tasks, fetchTasks } = useTasks();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false);

  const currentSpace = spaces?.find(s => String(s.id) === String(activeSpaceId));
  const spaceName = currentSpace?.name || "No Space Selected";
  const spaceDescription = currentSpace?.description || "No description available for this space.";

  const workspaceId = localStorage.getItem("aigendaActiveWorkspaceId");
  const spaceId = activeSpaceId || localStorage.getItem("aigendaActiveSpaceId");

  const spaceTasks = useMemo(() => {
    return tasks.filter(t => String(t.spaceId || t.SpaceId || t.spaceGUID || t.SpaceGuid) === String(spaceId));
  }, [tasks, spaceId]);

  const computedAnalytics = useMemo(() => {
    const total = spaceTasks.length;
    const completed = spaceTasks.filter(t => String(t.status).toLowerCase() === 'done').length;
    const inProgress = spaceTasks.filter(t => String(t.status).toLowerCase() === 'on-progress').length;
    const pending = total - completed - inProgress;
    const priorityDistribution = { high: 0, medium: 0, low: 0 };
    spaceTasks.forEach(t => {
      const key = normalizePriority(t.priority);
      priorityDistribution[key] += 1;
    });
    const teamMap = {};
    spaceTasks.forEach(t => {
      const name = t.assigneeEmail || t.assignee?.name || t.assignee?.email || 'Unassigned';
      teamMap[name] = (teamMap[name] || 0) + 1;
    });
    const teamProductivity = Object.entries(teamMap).map(([name, count], idx) => ({
      id: idx,
      name,
      tasks: count,
      maxTasks: Math.max(count, total > 0 ? total : 1),
      color: idx % 2 === 0 ? '#8b5cf6' : '#c4b5fd',
      avatar: idx % 2 === 0 ? AvtImg : AvtImg2,
    }));
    const groupedByWeek = {};
    spaceTasks.forEach(t => {
      const rawDate = t.dueDate || t.createdAt || t.CreatedAt || new Date().toISOString();
      const d = new Date(rawDate);
      const week = Number.isNaN(d.getTime()) ? 'This Week' : `Week ${Math.ceil((d.getDate()) / 7)}`;
      groupedByWeek[week] = groupedByWeek[week] || { completed: 0, planned: 0 };
      groupedByWeek[week].planned += 1;
      if (String(t.status).toLowerCase() === 'done') groupedByWeek[week].completed += 1;
    });
    const completionTrend = Object.entries(groupedByWeek).map(([label, vals]) => ({ label, ...vals }));
    return { totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, pendingTasks: pending, priorityDistribution, completionTrend, teamProductivity };
  }, [spaceTasks]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!workspaceId || !spaceId || loadedRef.current) return;
      setError(null);
      try {
        const response = await getSpaceAnalytics(workspaceId, spaceId, { days: 30 });
        const data = response?.data?.data || response?.data || {};
        if (!cancelled) setAnalytics(normalizeAnalytics(data));
      } catch (err) {
        console.warn("Analytics API failed, falling back to computed tasks:", err);
        if (!cancelled) setAnalytics(null);
      } finally {
        if (!cancelled) loadedRef.current = true;
      }
    };
    load();
    fetchTasks(workspaceId, spaceId);
    return () => { cancelled = true; };
  }, [workspaceId, spaceId]);

  const stats = useMemo(() => {
    const api = analytics || {};
    const computed = computedAnalytics;
    return {
      totalTasks: computed.totalTasks || api.totalTasks || 0,
      completedTasks: computed.completedTasks || api.completedTasks || 0,
      inProgressTasks: computed.inProgressTasks || api.inProgressTasks || 0,
      pendingTasks: computed.pendingTasks || api.pendingTasks || 0,
      priorityDistribution: computed.priorityDistribution || api.priorityDistribution || { high: 0, medium: 0, low: 0 },
      completionTrend: computed.completionTrend.length ? computed.completionTrend : (api.completionTrend || []),
      teamProductivity: computed.teamProductivity.length ? computed.teamProductivity : (api.teamProductivity || []),
    };
  }, [analytics, computedAnalytics]);
  const total = stats.totalTasks || 0;
  const completed = stats.completedTasks || 0;
  const inProgress = stats.inProgressTasks || 0;
  const pending = stats.pendingTasks || 0;
  const priorityDistribution = stats.priorityDistribution || { high: 0, medium: 0, low: 0 };
  const completionTrend = stats.completionTrend || [];
  const teamProductivity = stats.teamProductivity || [];

  const priorities = [
    { label: 'High Priority', count: priorityDistribution.high || 0, color: '#8b5cf6' },
    { label: 'Medium', count: priorityDistribution.medium || 0, color: '#c4b5fd' },
    { label: 'Low', count: priorityDistribution.low || 0, color: '#e2e8f0' },
  ];
  const priorityTotal = Math.max(1, priorities.reduce((sum, p) => sum + p.count, 0));
  const donutTotal = total || priorityTotal;
  const highPct = Math.round(((priorityDistribution.high || 0) / priorityTotal) * 100);
  const mediumPct = Math.round(((priorityDistribution.medium || 0) / priorityTotal) * 100);
  const donutGradient = `conic-gradient(#8b5cf6 0% ${highPct}%, #c4b5fd ${highPct}% ${highPct + mediumPct}%, #e2e8f0 ${highPct + mediumPct}% 100%)`;

  const maxTrendValue = Math.max(1, ...completionTrend.map(t => Math.max(t.completed || 0, t.planned || 0)));
  const teamMax = Math.max(1, ...teamProductivity.map(m => m.maxTasks || m.tasks || 1));

  return (
    <div className="app-container">
      <SidebarofWorkspace />
      <main className="main-content" style={{ marginLeft: 'var(--workspace-sidebar-width, 256px)' }}>
        <Header />
        <div className="page-container">
          <TopSection spaceName={`${spaceName}`} spaceDescription={spaceDescription} />

          <div className="dashboard-container">
            {error && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* 1. TASK COMPLETION TREND */}
            <Card className="trend-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Task Completion Trend</h2>
                  <p className="card-subtitle">{total} tasks total • {completed} completed</p>
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
              <div className="chart-placeholder">
                {completionTrend.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', gap: '8px', padding: '0 16px' }}>
                    {completionTrend.map((item, index) => (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center', height: '80%' }}>
                          <div style={{ width: '12px', backgroundColor: '#8b5cf6', borderRadius: '4px 4px 0 0', height: `${((item.completed || 0) / maxTrendValue) * 100}%`, minHeight: '4px' }} />
                          <div style={{ width: '12px', backgroundColor: '#cbd5e1', borderRadius: '4px 4px 0 0', height: `${((item.planned || 0) / maxTrendValue) * 100}%`, minHeight: '4px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{item.label || item.week || `W${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    No trend data available
                  </div>
                )}
              </div>
            </Card>

            {/* 2. PRIORITY DISTRIBUTION */}
            <Card>
              <h2 className="card-title priority-title">Priority Distribution</h2>
              <div className="priority-content">
                <div className="donut-chart" style={{ background: donutGradient }}>
                  <div className="donut-inner">
                    <span className="donut-value">{donutTotal}</span>
                    <span className="donut-label">Tasks</span>
                  </div>
                </div>
                <div className="priority-list">
                  {priorities.map((item, index) => (
                    <div key={index} className="priority-list-item">
                      <span className="priority-list-label">
                        <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                        {item.label}
                      </span>
                      <span className="priority-list-percent">{Math.round((item.count / priorityTotal) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 3. TEAM PRODUCTIVITY */}
            <Card className="productivity-card">
              <div className="card-header productivity-header-wrapper">
                <div>
                  <h2 className="card-title">Team Productivity</h2>
                  <p className="card-subtitle">Tasks completed per member this cycle</p>
                </div>
              </div>
              <div className="bars-container">
                {teamProductivity.length > 0 ? teamProductivity.map((member) => (
                  <div key={member.id} className="member-column">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${((member.tasks || 0) / teamMax) * 100}%`,
                          backgroundColor: member.color || '#8b5cf6',
                        }}
                      />
                    </div>
                    <div className="member-info">
                      <img src={member.avatar || AvtImg} alt={member.name} className="member-avatar" />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span className="member-name">{member.name}</span>
                        <span className="member-tasks">{member.tasks} tasks</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    No team productivity data
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpaceAnalytics;