import {
  Bell,
  Calendar,
  ChevronLeftIcon,
  ChevronRightIcon,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SidebarofWorkspace from "./SidebarofWorkspace";
import "./stylesofWS.css";
import "./workspace.css";
import TasksImg from "../../assets/images/tasksimg.png";
import FocustimeImg from "../../assets/images/focustimeimg.png";
import SpacesImg from "../../assets/images/spacesimg.png";
import ProductivityImg from "../../assets/images/productivityimg.png";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useUser } from "../../context/UserContext";
import {
  getApiErrorMessage,
  getWorkspaceDashboard,
  parseWorkspaceDashboard,
} from "../../services/api";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pickWeeklySeries(dashboard) {
  const w =
    dashboard.weeklyFocusTime ??
    dashboard.WeeklyFocusTime ??
    dashboard.weeklyFocus ??
    dashboard.focusByDay;
  if (!Array.isArray(w) || w.length === 0) return null;
  return w.map((entry, i) => {
    if (typeof entry === "number") {
      return { label: daysOfWeek[i % 7], hours: entry };
    }
    const label =
      entry.day ??
      entry.Day ??
      entry.label ??
      entry.Label ??
      daysOfWeek[i % 7];
    const hours =
      entry.hours ??
      entry.Hours ??
      entry.value ??
      entry.Value ??
      entry.focusHours ??
      0;
    return { label, hours: Number(hours) || 0 };
  });
}

function pickPriorityTasks(dashboard) {
  const t =
    dashboard.priorityTasks ??
    dashboard.PriorityTasks ??
    dashboard.tasks ??
    [];
  return Array.isArray(t) ? t : [];
}

function pickRecentActivity(dashboard) {
  const a =
    dashboard.recentActivity ??
    dashboard.RecentActivity ??
    dashboard.activities ??
    [];
  return Array.isArray(a) ? a : [];
}

function taskTitle(t) {
  return (
    t.title ??
    t.Title ??
    t.name ??
    t.Name ??
    t.description ??
    "Task"
  );
}

function taskMeta(t) {
  const priority =
    t.priority ?? t.Priority ?? t.priorityLabel ?? t.category ?? "";
  const due =
    t.dueDate ?? t.DueDate ?? t.due ?? t.when ?? "";
  return { priority, due };
}

function activityText(a) {
  if (typeof a === "string") return a;
  return (
    a.description ??
    a.Description ??
    a.message ??
    a.Message ??
    a.text ??
    ""
  );
}

function activityTime(a) {
  return a.time ?? a.Time ?? a.ago ?? a.relativeTime ?? "";
}

function activityColor(a, i) {
  return a.color ?? a.Color ?? ["#10b981", "#8b5cf6", "#3b82f6", "#e2e8f0"][i % 4];
}

const WorkspaceOverview = () => {
  const navigate = useNavigate();
  const { displayName } = useUser();
  const { activeWorkspaceId, activeWorkspace } = useWorkspace();
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspaceId) {
      setLoading(false);
      setDashboard({});
      setError("");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getWorkspaceDashboard(activeWorkspaceId);
        if (cancelled) return;
        const parsed = parseWorkspaceDashboard(res);
        setDashboard(parsed);
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e));
          setDashboard({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

  const weeklySeries = useMemo(
    () => pickWeeklySeries(dashboard),
    [dashboard]
  );
  const priorityTasks = useMemo(
    () => pickPriorityTasks(dashboard),
    [dashboard]
  );
  const recentActivities = useMemo(
    () => pickRecentActivity(dashboard),
    [dashboard]
  );

  const stats = useMemo(() => {
    const d = dashboard;
    return {
      totalTasks:
        d.totalTasks ??
        d.TotalTasks ??
        d.taskCount ??
        d.TaskCount ??
        "—",
      focusHours:
        d.focusHoursThisWeek ??
        d.weeklyFocusHours ??
        d.FocusHours ??
        d.totalFocusHours ??
        "—",
      activeSpaces:
        d.activeSpaces ??
        d.ActiveSpaces ??
        d.spacesCount ??
        "—",
      productivity:
        d.productivityScore ??
        d.ProductivityScore ??
        d.score ??
        "—",
    };
  }, [dashboard]);

  const greetingName = displayName?.trim() || "there";

  if (!activeWorkspaceId) {
    return (
      <div className="app-container workspace-module" dir="auto">
        <SidebarofWorkspace />
        <div
          className="main-container"
          style={{ marginInlineStart: "140px", marginTop: "0", padding: "24px" }}
        >
          <p style={{ color: "#64748b" }}>
            No workspace selected.{" "}
            <Link to="/mainworkspace" style={{ color: "#5b10bd" }}>
              Open Workspaces
            </Link>{" "}
            and choose one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container workspace-module" dir="auto">
      <SidebarofWorkspace />
      <div
        className="main-container"
        style={{ marginInlineStart: "140px", marginTop: "0" }}
      >
        <div className="top-sec">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            <button
              type="button"
              aria-label="Back to workspaces"
              onClick={() => navigate("/mainworkspace")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <ChevronLeftIcon />
            </button>
            <span aria-hidden style={{ opacity: 0.4 }}>
              <ChevronRightIcon />
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h2 style={{ marginBottom: "0" }}>
                {activeWorkspace?.name || "Workspace"}
              </h2>
              <p style={{ marginTop: "0" }}>
                Good day, {greetingName}.{" "}
                {loading ? (
                  <span style={{ color: "#94a3b8" }}>Loading dashboard…</span>
                ) : error ? (
                  <span style={{ color: "#dc2626" }}>{error}</span>
                ) : (
                  <span style={{ color: "#46c79c" }}>
                    Here is your workspace overview.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="header-right">
            <button type="button" className="notification-btn" aria-label="Notifications">
              <Bell />
              <span className="notification-dot" />
            </button>
          </div>
        </div>

        {error ? (
          <div
            className="workspace-api-banner workspace-api-banner--error"
            style={{ margin: "12px 0" }}
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="boxes">
          <div className="box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p style={{ color: "#b0bbca" }}>TOTAL TASKS</p>
              <img src={TasksImg} alt="" />
            </div>
            <h1>{loading ? "…" : stats.totalTasks}</h1>
            <p style={{ color: "#46c79c" }}>Workspace totals</p>
          </div>
          <div className="box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p style={{ color: "#b0bbca" }}>FOCUS TIME</p>
              <img src={FocustimeImg} alt="" />
            </div>
            <h1>{loading ? "…" : stats.focusHours}</h1>
            <p style={{ color: "#b0bbca", fontSize: "15px" }}>
              From dashboard API
            </p>
          </div>
          <div className="box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p style={{ color: "#b0bbca" }}>ACTIVE SPACES</p>
              <img src={SpacesImg} alt="" />
            </div>
            <h1>{loading ? "…" : stats.activeSpaces}</h1>
            <p style={{ color: "#b0bbca", fontSize: "15px" }}>
              Sub-areas / spaces
            </p>
          </div>
          <div className="box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <p style={{ color: "#b0bbca" }}>PRODUCTIVITY SCORE</p>
              <img src={ProductivityImg} alt="" />
            </div>
            <h1>{loading ? "…" : stats.productivity}</h1>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, Number(stats.productivity) || 0)}%`,
                  backgroundColor: "#46c79c",
                }}
              />
            </div>
          </div>
        </div>

        <div className="widgets-grid">
          <div className="widget-card">
            <div className="focus-header">
              <h2 className="widget-title">Weekly Focus Time</h2>
              <button type="button" className="time-filter-btn">
                Last 7 Days
              </button>
            </div>
            <div className="focus-chart-area">
              {weeklySeries && weeklySeries.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                    height: "160px",
                    paddingTop: "16px",
                  }}
                >
                  {weeklySeries.map((pt, idx) => {
                    const max = Math.max(
                      ...weeklySeries.map((p) => Number(p.hours) || 0),
                      1
                    );
                    const h = ((Number(pt.hours) || 0) / max) * 100;
                    return (
                      <div
                        key={`${pt.label}-${idx}`}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "36px",
                            height: `${h}%`,
                            minHeight: "4px",
                            background: "linear-gradient(180deg, #8b5cf6, #5b10bd)",
                            borderRadius: "8px 8px 4px 4px",
                          }}
                        />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {pt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", margin: "24px 0" }}>
                  {loading
                    ? "Loading chart…"
                    : "No weekly focus data from the API yet."}
                </p>
              )}
              {!weeklySeries?.length ? (
                <div className="focus-x-axis">
                  {daysOfWeek.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="widget-card">
            <h2 className="widget-title">Recent Activity</h2>
            <div className="activity-list">
              {recentActivities.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>
                  {loading ? "Loading…" : "No recent activity."}
                </p>
              ) : (
                recentActivities.map((activity, i) => (
                  <div key={i} className="activity-item">
                    <div
                      className="activity-indicator"
                      style={{
                        backgroundColor: activityColor(activity, i),
                      }}
                    />
                    <div className="activity-text-group">
                      <p className="activity-desc">{activityText(activity)}</p>
                      <p className="activity-time">{activityTime(activity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <a href="#all-activity" className="view-all-link">
              View all activity
            </a>
          </div>
        </div>

        <div className="priority-tasks">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h4>Priority Tasks</h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#5f17bf",
                gap: "8px",
                fontWeight: "500",
              }}
            >
              <span style={{ cursor: "pointer", marginTop: "5px" }}>
                <Plus size={16} />
              </span>
              <span>New Task</span>
            </div>
          </div>
          {priorityTasks.length === 0 ? (
            <p style={{ color: "#94a3b8", padding: "8px 0" }}>
              {loading ? "Loading tasks…" : "No priority tasks from the API."}
            </p>
          ) : (
            priorityTasks.map((t, idx) => {
              const { priority, due } = taskMeta(t);
              return (
                <div key={idx} className="box">
                  <input type="checkbox" readOnly tabIndex={-1} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <p style={{ marginBottom: "1px" }}>{taskTitle(t)}</p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "1px",
                      }}
                    >
                      {priority ? (
                        <div
                          style={{
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "2px 10px",
                            fontSize: "12px",
                            borderRadius: "8px",
                          }}
                        >
                          {String(priority).toUpperCase()}
                        </div>
                      ) : null}
                      <div
                        style={{
                          color: "#b4bfcd",
                          display: "flex",
                          gap: "5px",
                        }}
                      >
                        <span>
                          <Calendar size={15} />
                        </span>
                        <span>{due || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default WorkspaceOverview;
