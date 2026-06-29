import { useEffect, useMemo, useState } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { useTasks } from '../../context/TasksContext';
import './UpdateTask.css';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'on-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = ['Low', 'Med', 'High'];

function normalizePriority(priority) {
  if (!priority) return 'Low';
  const p = String(priority).toLowerCase();
  if (p === 'high' || p === 'critical') return 'High';
  if (p === 'medium' || p === 'moderate' || p === 'med') return 'Med';
  return 'Low';
}

const UpdateTask = ({ task, setUpdateTask, workspaceId, spaceId }) => {
  const { updateTask, updateTaskStatus } = useTasks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    priority: 'Low',
    assignee: '',
    subtasks: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const normalizedSubtasks = useMemo(() => {
    if (!task || !Array.isArray(task.subtasks)) return [];
    return task.subtasks.map((s) =>
      typeof s === 'string' ? { title: s, completed: false } : { title: s.title || '', completed: !!s.completed }
    );
  }, [task]);

  useEffect(() => {
    if (!task) return;
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: normalizePriority(task.priority),
      assignee: task.assigneeEmail || task.assignee?.email || task.assignee?.name || '',
      subtasks: normalizedSubtasks,
    });
  }, [task, normalizedSubtasks]);

  if (!task) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSubtask = () => {
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: '', completed: false }],
    }));
  };

  const updateSubtask = (index, value) => {
    const next = [...formData.subtasks];
    next[index] = { ...next[index], title: value };
    setFormData((prev) => ({ ...prev, subtasks: next }));
  };

  const toggleSubtask = (index) => {
    const next = [...formData.subtasks];
    next[index] = { ...next[index], completed: !next[index].completed };
    setFormData((prev) => ({ ...prev, subtasks: next }));
  };

  const removeSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task || !workspaceId || !spaceId) return;

    const priorityPayload = formData.priority === 'Med' ? 'Medium' : formData.priority;

    setIsSaving(true);
    try {
      await updateTask(workspaceId, spaceId, task.id, {
        title: formData.title,
        description: formData.description,
        priority: priorityPayload,
        dueDate: formData.dueDate || null,
        subtasks: formData.subtasks,
      });

      if (task.status !== formData.status) {
        await updateTaskStatus(workspaceId, spaceId, task.id, formData.status);
      }

      setUpdateTask(false);
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const assigneeInitial = formData.assignee ? formData.assignee.charAt(0).toUpperCase() : '?';

  return (
    <div className="update-task-overlay" onClick={() => setUpdateTask(false)}>
      <div className="update-task-modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="update-task-header">
            <h2>Update Task</h2>
            <button
              type="button"
              className="update-task-close"
              onClick={() => setUpdateTask(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="update-task-title">{formData.title || 'Untitled Task'}</h3>

          <label className="update-task-label">Description</label>
          <div className="update-task-description-box">
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add a description..."
            />
          </div>

          <div className="update-task-grid">
            <div className="update-task-field">
              <label className="update-task-label">Status</label>
              <select
                className="update-task-select"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="update-task-field">
              <label className="update-task-label">Due Date</label>
              <div className="update-task-date-wrapper">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
                <Calendar size={14} />
              </div>
            </div>

            <div className="update-task-field">
              <label className="update-task-label">Priority</label>
              <div className="update-task-priority">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={formData.priority === option ? 'active' : ''}
                    onClick={() => handleChange('priority', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="update-task-field">
              <label className="update-task-label">Assignee</label>
              <div className="update-task-assignee">
                <span className="update-task-avatar">{assigneeInitial}</span>
                <select
                  value={formData.assignee}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                >
                  <option value="">Unassigned</option>
                  <option value={formData.assignee}>{formData.assignee || 'Current assignee'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="update-task-subtasks-header">
            <label className="update-task-label" style={{ marginBottom: 0 }}>
              Subtasks
            </label>
            <button type="button" className="update-task-add-subtask" onClick={addSubtask}>
              <Plus size={14} />
              Add Subtask
            </button>
          </div>

          {formData.subtasks.map((subtask, index) => (
            <div
              key={index}
              className={`update-task-subtask-item ${subtask.completed ? 'completed' : ''}`}
            >
              <button
                type="button"
                className={`update-task-subtask-checkbox ${subtask.completed ? '' : 'unchecked'}`}
                onClick={() => toggleSubtask(index)}
                aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {subtask.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <input
                type="text"
                value={subtask.title}
                onChange={(e) => updateSubtask(index, e.target.value)}
                placeholder="Enter subtask title"
              />
              <button
                type="button"
                className="update-task-subtask-delete"
                onClick={() => removeSubtask(index)}
                aria-label="Remove subtask"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="update-task-footer">
            <button type="button" className="update-task-cancel" onClick={() => setUpdateTask(false)}>
              Cancel
            </button>
            <button type="submit" className="update-task-save" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTask;