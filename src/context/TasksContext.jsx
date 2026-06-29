import { createContext, useContext, useState, useCallback } from "react";
import { tasksAPI } from "../services/api";

// ============================================================================
// DATA MAPPING DICTIONARIES
// Translate between UI strings and API integers
// ============================================================================
const STATUS_MAP = {
  'todo': 0,
  'on-progress': 1,
  'done': 2
};

const STATUS_REVERSE_MAP = {
  0: 'todo',
  1: 'on-progress',
  2: 'done'
};

const PRIORITY_MAP = {
  'Low': 0,
  'Moderate': 1,
  'Medium': 1, // alias
  'High': 2, // alias
  'Critical': 2
};

const PRIORITY_REVERSE_MAP = {
  0: 'Low',
  1: 'Moderate',
  2: 'Critical'
};

const TASKS_STORAGE_KEY = "aigendaTasksBySpace";
const DELETED_TASKS_STORAGE_KEY = "aigendaDeletedTasksBySpace";

function getTaskCacheKey(workspaceId, spaceId) {
  return `${String(workspaceId)}::${String(spaceId)}`;
}

function readDeletedTasksCache() {
  try {
    const raw = localStorage.getItem(DELETED_TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDeletedTasksCache(cache) {
  try {
    localStorage.setItem(DELETED_TASKS_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write failures.
  }
}

function readTasksCache() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeTasksCache(cache) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write failures.
  }
}

// ============================================================================
// TASKS CONTEXT
// ============================================================================
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // ACTION: FETCH TASKS
  // ============================================================================
  const fetchTasks = useCallback(async (workspaceId, spaceId, params = {}) => {
    // Resolve workspaceId and spaceId, falling back to localStorage if parameters are not provided
    const resolvedWorkspaceId = workspaceId || localStorage.getItem("aigendaActiveWorkspaceId");
    const resolvedSpaceId = spaceId || localStorage.getItem("aigendaActiveSpaceId");

    // Save to localStorage if valid parameters are provided
    if (workspaceId) {
      localStorage.setItem("aigendaActiveWorkspaceId", String(workspaceId));
    }
    if (spaceId) {
      localStorage.setItem("aigendaActiveSpaceId", String(spaceId));
    }

    // Debug Logger: Print the exact URL being called
    console.log(`🔍 Fetching tasks from: /api/WorkSpaces/${resolvedWorkspaceId}/Spaces/${resolvedSpaceId}/Tasks`);

    if (!resolvedWorkspaceId || !resolvedSpaceId) {
      console.warn("fetchTasks skipped: Missing workspaceId or spaceId", { resolvedWorkspaceId, resolvedSpaceId });
      return;
    }

    setIsLoading(true);
    setError(null);

    const {
      PageNumber = 1,
      PageSize = 20,
      SearchTerm = '',
      Status = null,
      Priority = null
    } = params;

    const queryParams = {
      PageNumber: PageNumber.toString(),
      PageSize: PageSize.toString()
    };

    if (SearchTerm) queryParams.SearchTerm = SearchTerm;
    if (Status !== null) queryParams.Status = Status.toString();
    if (Priority !== null) queryParams.Priority = Priority.toString();

    try {
      // workspaceId is an integer, spaceId is a GUID string - do NOT parse spaceId
      const apiWorkspaceId = parseInt(resolvedWorkspaceId, 10);
      const response = await tasksAPI.getTasks(apiWorkspaceId, resolvedSpaceId, queryParams);

      // Defensive data extraction: handle nested or direct arrays
      const rawData = response.data?.data || response.data?.items || response.data?.tasks || response.data || [];
      const taskList = Array.isArray(rawData) ? rawData : [];
      const deletedTaskIds = new Set(readDeletedTasksCache()[getTaskCacheKey(apiWorkspaceId, resolvedSpaceId)] || []);

      // Map API integer values back to UI strings
      const mappedTasks = taskList.filter(task => !deletedTaskIds.has(String(task.id || task.Id || task._id))).map(task => ({
        ...task,
        // Ensure id is always accessible
        id: task.id || task.Id || task._id,
        // Stamp spaceId so filtering always works regardless of API casing
        spaceId: task.spaceId || task.SpaceId || task.spaceGUID || task.SpaceGuid || resolvedSpaceId,
        workspaceId: apiWorkspaceId,
        status: STATUS_REVERSE_MAP[task.status] !== undefined ? STATUS_REVERSE_MAP[task.status] : 'todo',
        priority: PRIORITY_REVERSE_MAP[task.priority] !== undefined ? PRIORITY_REVERSE_MAP[task.priority] : 'Low'
      }));

      const cachedTasks = (readTasksCache()[getTaskCacheKey(apiWorkspaceId, resolvedSpaceId)] || []).filter(
        task => !deletedTaskIds.has(String(task.id || task.Id || task._id))
      );

      // Merge server tasks into existing state:
      // - Keep any optimistically-added tasks for THIS space that the server didn't return yet
      // - Replace tasks for this space that the server DID return (server is source of truth)
      // - Never touch tasks belonging to OTHER spaces
      setTasks(prevTasks => {
        // Separate tasks for other spaces (keep as-is)
        const otherSpaceTasks = prevTasks.filter(
          t => String(t.spaceId || t.SpaceId || t.spaceGUID || t.SpaceGuid) !== String(resolvedSpaceId)
        );

        // Build a set of IDs returned by server for this space
        const serverIds = new Set(mappedTasks.map(t => String(t.id)));
        const cachedIds = new Set(cachedTasks.map(t => String(t.id)));

        // Keep optimistically-added tasks for this space that server hasn't confirmed yet
        const optimisticOnly = prevTasks.filter(t => {
          const tSpaceId = String(t.spaceId || t.SpaceId || t.spaceGUID || t.SpaceGuid);
          return tSpaceId === String(resolvedSpaceId) && !serverIds.has(String(t.id));
        });

        const cachedOnly = cachedTasks.filter(task => !serverIds.has(String(task.id)) && !optimisticOnly.some(opt => String(opt.id) === String(task.id)) && !cachedIds.has(String(task.id)));

        const currentSpaceTasks = [...cachedTasks, ...mappedTasks, ...optimisticOnly];
        const dedupedCurrentSpaceTasks = Array.from(
          new Map(currentSpaceTasks.map(task => [String(task.id), task])).values()
        );

        return [...otherSpaceTasks, ...dedupedCurrentSpaceTasks, ...cachedOnly];
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // ACTION: CREATE TASK
  // ============================================================================
  const createTask = useCallback(async (workspaceId, spaceId, taskData) => {
    setIsLoading(true);
    setError(null);

    let previousTasks = [...tasks];
    let apiWorkspaceId;
    let optimisticId;

    try {
      // Map UI strings to API integers
      // Handle both string ('Low', 'Medium', 'Critical') and integer (0, 1, 2) inputs
      let priorityValue;
      if (typeof taskData.priority === 'number') {
        priorityValue = taskData.priority;
      } else if (typeof taskData.priority === 'string') {
        priorityValue = PRIORITY_MAP[taskData.priority] || 0;
      } else {
        priorityValue = 0;
      }

      // Ensure workspaceId is an integer (spaceId is a GUID string, keep as-is)
      apiWorkspaceId = parseInt(workspaceId, 10);
      optimisticId = `temp-task-${Date.now()}`;

      const optimisticTask = {
        ...taskData,
        id: optimisticId,
        spaceId,
        workspaceId: apiWorkspaceId,
        status: String(taskData.status || 'todo'),
        priority: String(taskData.priority ?? 'Low'),
        assigneeEmail: taskData.assigneeEmail || null,
        subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
        __optimistic: true,
      };

      setTasks(prevTasks => [optimisticTask, ...prevTasks]);

      {
        const taskCache = readTasksCache();
        const cacheKey = getTaskCacheKey(apiWorkspaceId, spaceId);
        const currentCachedTasks = Array.isArray(taskCache[cacheKey]) ? taskCache[cacheKey] : [];
        taskCache[cacheKey] = [
          optimisticTask,
          ...currentCachedTasks.filter((task) => String(task.id) !== String(optimisticId)),
        ];
        writeTasksCache(taskCache);
      }

      const apiPayload = {
        title: taskData.title,
        description: taskData.description || '',
        status: STATUS_MAP[taskData.status] !== undefined ? STATUS_MAP[taskData.status] : 0,
        priority: priorityValue,
        dueDate: taskData.dueDate || null,
        subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : []
      };

      console.log("API Payload:", apiPayload);
      console.log("Request URL: WorkSpaces/${apiWorkspaceId}/Spaces/${spaceId}/Tasks");

      const response = await tasksAPI.createTask(apiWorkspaceId, spaceId, apiPayload);

      console.log("Response status:", response.status);

      // Extract the actual task object defensively (handle wrapped responses)
      const responseData = response.data?.data ? response.data.data : response.data;

      // Define explicit UI fallbacks based on what our UI components expect
      const finalStatus = STATUS_REVERSE_MAP[responseData?.status] ?? responseData?.status ?? taskData.status ?? 'todo';
      const finalPriority = PRIORITY_REVERSE_MAP[responseData?.priority] ?? responseData?.priority ?? taskData.priority ?? 'Low';

      const mappedTask = {
        ...optimisticTask,
        ...responseData,
        id: responseData?.id || responseData?._id || optimisticId,
        spaceId,
        workspaceId: apiWorkspaceId,
        status: finalStatus.toString(),
        priority: finalPriority.toString(),
        user: responseData?.user || null,
        assignee: responseData?.assignee || null,
        __optimistic: false,
      };

      // Reconcile the optimistic entry with the confirmed server record.
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === optimisticId ? mappedTask : task))
      );

      {
        const taskCache = readTasksCache();
        const cacheKey = getTaskCacheKey(apiWorkspaceId, spaceId);
        const currentCachedTasks = Array.isArray(taskCache[cacheKey]) ? taskCache[cacheKey] : [];
        taskCache[cacheKey] = [
          mappedTask,
          ...currentCachedTasks.filter((task) => String(task.id) !== String(optimisticId)),
        ];
        writeTasksCache(taskCache);
      }

      console.log("Task successfully committed to safe state:", mappedTask);

      return mappedTask;
    } catch (err) {
      setTasks(previousTasks);

      {
        const taskCache = readTasksCache();
        const cacheKey = getTaskCacheKey(apiWorkspaceId, spaceId);
        const currentCachedTasks = Array.isArray(taskCache[cacheKey]) ? taskCache[cacheKey] : [];
        taskCache[cacheKey] = currentCachedTasks.filter((task) => String(task.id) !== String(optimisticId));
        writeTasksCache(taskCache);
      }

      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error creating task:", err);
      console.error("Error details:", err.response?.data || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  // ============================================================================
  // ACTION: UPDATE TASK STATUS
  // Optimistic UI update with rollback on error
  // ============================================================================
  const updateTaskStatus = useCallback(async (workspaceId, spaceId, taskId, newStatus) => {
    setError(null);

    // Helper function to safely map status to integer
    const mapStatusToInt = (statusValue) => {
      // If already a valid integer (0, 1, 2), return it
      if (typeof statusValue === 'number' && [0, 1, 2].includes(statusValue)) {
        return statusValue;
      }
      // If it's a string, try to map it
      if (typeof statusValue === 'string') {
        const mapped = STATUS_MAP[statusValue];
        if (mapped !== undefined) return mapped;
        // Try parsing as integer
        const parsed = parseInt(statusValue, 10);
        if (!isNaN(parsed) && [0, 1, 2].includes(parsed)) return parsed;
      }
      // Default fallback
      return 0; // Default to todo (0)
    };

    const apiStatus = mapStatusToInt(newStatus);

    // Determine the UI string fallback for optimistic update
    const uiStringStatus = STATUS_REVERSE_MAP[apiStatus] || 'todo';

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: uiStringStatus } : task
    ));

    try {
      // Pass the payload as per API documentation: { status: <integer> }
      const payload = { status: apiStatus };

      console.log('updateTaskStatus API Payload:', payload);

      const response = await tasksAPI.updateTaskStatus(workspaceId, spaceId, taskId, payload);
      const data = response?.data || {};

      // Sync strictly with server response if it returned the updated object
      if (data && data.status !== undefined) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status: STATUS_REVERSE_MAP[data.status] || uiStringStatus } : task
        ));
      }
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error updating task status:", err);
      throw err;
    }
  }, [tasks]);

  // ============================================================================
  // ACTION: ASSIGN TASK
  // Optimistic UI update with rollback on error
  // ============================================================================
  const assignTask = useCallback(async (workspaceId, spaceId, taskId, email) => {
    setError(null);

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assigneeEmail: email } : task
    ));

    try {
      const response = await tasksAPI.assignMember(workspaceId, spaceId, taskId, { email });
      return response.data;
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error assigning task:", err);
      throw err;
    }
  }, [tasks]);

  // ============================================================================
  // ACTION: UNASSIGN TASK
  // Optimistic UI update with rollback on error
  // ============================================================================
  const unassignTask = useCallback(async (workspaceId, spaceId, taskId, email) => {
    setError(null);

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assigneeEmail: null } : task
    ));

    try {
      const response = await tasksAPI.unassignMember(workspaceId, spaceId, taskId, { email });
      return response.data;
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error unassigning task:", err);
      throw err;
    }
  }, [tasks]);

  // ============================================================================
  // ACTION: UPDATE TASK (FULL)
  // Used for priority changes - sends full task payload
  // Optimistic UI update with rollback on error
  // ============================================================================
  const updateTask = useCallback(async (workspaceId, spaceId, taskId, updatedFields) => {
    setError(null);

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updatedFields } : task
    ));

    try {
      // Find the current task to get full payload
      const currentTask = tasks.find(t => String(t.id) === String(taskId));
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Helper function to safely map priority to integer
      const mapPriorityToInt = (priorityValue) => {
        // If already a valid integer (0, 1, 2), return it
        if (typeof priorityValue === 'number' && [0, 1, 2].includes(priorityValue)) {
          return priorityValue;
        }
        // If it's a string, try to map it
        if (typeof priorityValue === 'string') {
          const mapped = PRIORITY_MAP[priorityValue];
          if (mapped !== undefined) return mapped;
          // Try parsing as integer
          const parsed = parseInt(priorityValue, 10);
          if (!isNaN(parsed) && [0, 1, 2].includes(parsed)) return parsed;
        }
        // Default fallback
        return 1; // Default to Moderate (1)
      };

      const apiWorkspaceId = parseInt(workspaceId, 10) || workspaceId;

      // Map UI strings to API integers (Endpoint #6 accepts: title, description, priority, dueDate, subtasks)
      const apiPayload = {
        title: updatedFields.title ?? currentTask.title ?? '',
        description: updatedFields.description ?? currentTask.description ?? '',
        priority: mapPriorityToInt(updatedFields.priority ?? currentTask.priority),
        dueDate: updatedFields.dueDate ?? currentTask.dueDate ?? null,
        subtasks: Array.isArray(updatedFields.subtasks) ? updatedFields.subtasks : (currentTask.subtasks || [])
      };

      // If status is provided in updatedFields, include it in the payload and update status separately
      if (updatedFields.status !== undefined) {
        const statusValue = STATUS_MAP[updatedFields.status];
        if (statusValue !== undefined) {
          apiPayload.status = statusValue;
        }
      }

      console.log('updateTask API Payload:', apiPayload);

      const response = await tasksAPI.updateTask(apiWorkspaceId, spaceId, taskId, apiPayload);
      const data = response.data;

      // Update with server response (mapped back to UI strings)
      setTasks(prev => prev.map(task =>
        task.id === taskId ? {
          ...task,
          ...updatedFields,
          ...(data && typeof data === 'object' ? data : {}),
          priority: PRIORITY_REVERSE_MAP[data.priority] || updatedFields.priority || task.priority,
          status: STATUS_REVERSE_MAP[data.status] || updatedFields.status || task.status
        } : task
      ));
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      setError(err?.response?.data?.message || err.message || "An error occurred");
      console.error("Error updating task:", err);
      throw err;
    }
  }, [tasks]);

  // ============================================================================
  // ACTION: DELETE TASK
  // Optimistic UI update with rollback on error
  // ============================================================================
  const deleteTask = useCallback(async (workspaceId, spaceId, taskId) => {
    const apiWorkspaceId = parseInt(workspaceId, 10) || workspaceId;
    const normalizedTaskId = String(taskId);
    const cacheKey = getTaskCacheKey(apiWorkspaceId, spaceId);
    const deletedCache = readDeletedTasksCache();
    const deletedIds = new Set(deletedCache[cacheKey] || []);
    deletedIds.add(normalizedTaskId);
    deletedCache[cacheKey] = Array.from(deletedIds);
    writeDeletedTasksCache(deletedCache);

    console.log(`🗑 DELETE /api/WorkSpaces/${apiWorkspaceId}/Spaces/${spaceId}/Tasks/${normalizedTaskId}`);

    // Optimistic UI: remove the task immediately without triggering isLoading
    setTasks(prev => prev.filter(task => String(task.id) !== normalizedTaskId));

    // Also remove from localStorage tasks cache so fetchTasks won't bring it back
    const taskCache = readTasksCache();
    if (taskCache[cacheKey]) {
      taskCache[cacheKey] = taskCache[cacheKey].filter(
        task => String(task.id || task.Id || task._id) !== normalizedTaskId
      );
      writeTasksCache(taskCache);
    }

    try {
      await tasksAPI.deleteTask(apiWorkspaceId, spaceId, normalizedTaskId);
      console.log("✅ Task deleted from server successfully");
    } catch (err) {
      console.error("❌ Task delete API error:", err?.response?.status, err?.response?.data, err?.message);
    }
  }, [tasks]);

  // ============================================================================
  // HELPER: GET TASKS BY STATUS
  // ============================================================================
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // ============================================================================
  // HELPER: GET TASK BY ID
  // ============================================================================
  const getTaskById = useCallback((taskId) => {
    const normalizedTaskId = String(taskId);
    return tasks.find(task => String(task.id) === normalizedTaskId);
  }, [tasks]);

  // ============================================================================
  // HELPER: GET TASKS COUNT BY SPACE ID
  // ============================================================================
  const getTasksCountBySpaceId = useCallback((spaceId) => {
    if (!spaceId) return 0;
    // tasks array is already normalized and mapped when fetched
    return tasks.filter(task => String(task.spaceId) === String(spaceId)).length;
  }, [tasks]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  const value = {
    // State
    tasks,
    isLoading,
    error,

    // CRUD Actions
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,

    // Helpers
    getTasksByStatus,
    getTaskById,
    getTasksCountBySpaceId
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK - useTasks
// ============================================================================
export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error(
      "useTasks() must be used within a <TasksProvider>. " +
      "Make sure your component is wrapped with TasksProvider in App.jsx"
    );
  }
  return context;
};
