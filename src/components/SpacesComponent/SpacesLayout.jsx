import React from "react";
import { useSpaces } from "../../context/SpacesContext";
import SpacesSidebar from "./SpacesSidebar";
import "./spaces.css";

const SpacesLayout = ({ workspaceId }) => {
  const {
    activeSpace,
    activeTab,
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes,
  } = useSpaces();

  const analytics = getSpaceAnalytics(activeSpace?.id);
  const tasks = getSpaceTasks(activeSpace?.id);
  const notes = getSpaceNotes(activeSpace?.id);

  const renderTasksTab = () => (
    <div className="tab-content tasks-tab">
      <div className="tab-header">
        <h2>Tasks</h2>
        <button className="add-btn">+ Add Task</button>
      </div>
      <div className="tasks-table">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Progress</th>
              <th>Urgency</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.feature}</td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${task.progress}%` }}
                    />
                    <span>{task.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className={`urgency-badge ${task.urgency.toLowerCase()}`}>
                    {task.urgency}
                  </span>
                </td>
                <td>{task.assignedTo}</td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="tab-content notes-tab">
      <div className="tab-header">
        <h2>Notes</h2>
        <button className="add-btn">+ Add Note</button>
      </div>
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <span className="note-date">{note.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="tab-content analytics-tab">
      <div className="tab-header">
        <h2>Analytics</h2>
      </div>
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-icon">✓</div>
          <div className="card-content">
            <h3>Total Tasks Completed</h3>
            <p className="card-value">{analytics.totalTasksCompleted}</p>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">⏱</div>
          <div className="card-content">
            <h3>Weekly Focus Time</h3>
            <p className="card-value">{analytics.weeklyFocusTime}</p>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Productivity Score</h3>
            <p className="card-value">{analytics.productivityScore}%</p>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">🔄</div>
          <div className="card-content">
            <h3>In Progress</h3>
            <p className="card-value">{analytics.totalTasksInProgress}</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <span className="activity-action">{activity.action}</span>
              <span className="activity-description">{activity.description}</span>
              <span className="activity-timestamp">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📁</div>
      <h2>Select a Space</h2>
      <p>Choose a space from the sidebar to view its details</p>
    </div>
  );

  return (
    <div className="spaces-layout">
      <SpacesSidebar workspaceId={workspaceId} />
      <div className="spaces-main-content">
        {activeSpace ? (
          <>
            <div className="space-details-header">
              <h1>{activeSpace.name}</h1>
              <p className="space-description">{activeSpace.description}</p>
              <span className="status-badge active">Active</span>
            </div>
            <div className="tab-content-container">
              {activeTab === "Tasks" && renderTasksTab()}
              {activeTab === "Notes" && renderNotesTab()}
              {activeTab === "Analytics" && renderAnalyticsTab()}
            </div>
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default SpacesLayout;
