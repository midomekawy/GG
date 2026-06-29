import axios from "axios";
import toast from "react-hot-toast";

const BACKEND_ORIGIN = "https://aigendatest.runasp.net";

/** In Vite dev, use same-origin prefix so the dev server can proxy and avoid browser CORS. In production, call the API host directly. */
const apiBaseURL = import.meta.env.DEV ? "/aigenda-api" : BACKEND_ORIGIN;

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    Accept: "application/json",
  },
});
const axiosInstance = api;

const WORKSPACES_SEGMENT = "/api/WorkSpaces";
const WORKSPACES_BASE =
  apiBaseURL.toLowerCase().endsWith(WORKSPACES_SEGMENT.toLowerCase())
    ? ""
    : WORKSPACES_SEGMENT;

function workspacePath(suffix = "") {
  if (WORKSPACES_BASE === "") {
    return suffix || "/";
  }
  return `${WORKSPACES_BASE}${suffix}`;
}

api.interceptors.request.use((config) => {
  // Check all common token keys
  let token = localStorage.getItem('userToken') || 
              localStorage.getItem('token') || 
              localStorage.getItem('auth_token') || 
              localStorage.getItem('accessToken');

  // Handle case where token might be stored in a user object
  if (!token) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        token = userObj.token || userObj.accessToken || userObj.auth_token;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token attached to request:", token.substring(0, 20) + "...");
  } else {
    console.warn("No token found in localStorage for request:", config.url);
  }

  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    const status = error.response?.status || 'NO_STATUS';

    // Handle 401 Unauthorized - Session expired or invalid token
    if (status === 401) {
      console.error(`[${method}] ${url} - 401 Unauthorized: Authentication failed`);
      toast.error('Authentication failed. Please log in again.');
      
      // Clear all authentication data from localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response) {
      const message = error.response.data?.message || error.response.data?.title || 'An error occurred';
      toast.error(message);
      console.error(`[${method}] ${url} - Server Error ${status}:`, error.response.data);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      console.error(`[${method}] ${url} - Network Error: Server unreachable. Check your connection or API URL.`);
    } else {
      toast.error(error.message || 'An unexpected error occurred.');
      console.error(`[${method}] ${url} - Error setting up request:`, error.message);
    }
    
    return Promise.reject(error);
  }
);

function getErrorMessage(error, fallback) {
  if (error?.message === "Network Error") {
    return "Network error — check your connection and that the dev server is running on port 5173 with the API proxy.";
  }
  if (typeof error?.message === "string" && error.message && !error?.response) {
    return error.message;
  }
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && typeof data.title === "string") return data.title;
  return fallback;
}

export async function getMyProfile() {
  return api.get("/me");
}

export async function updateMyProfile(payload) {
  return api.put("/me", payload);
}

/** POST /me/change-email — JSON body `{ newemail }`. Bearer token: axios interceptor. */
export async function requestChangeEmail(payload) {
  return api.post("/me/change-email", payload, {
    headers: { "Content-Type": "application/json" },
  });
}

/** PUT /me/confirm-change-email — JSON body `{ id, newemail, code }`. Bearer token: axios interceptor. */
export async function confirmChangeEmail(payload) {
  return api.put("/me/confirm-change-email", payload, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function getMyAvatar() {
  return api.get("/me/avatar");
}

export async function uploadMyAvatar(file) {
  const formData = new FormData();
  // IMPORTANT: key MUST be exactly "File" (capital F)
  formData.append("File", file);

  // Do NOT manually set Content-Type; Axios will add the correct multipart boundary.
  const res = await api.post("/me/avatar", formData);
  return res;
}

export async function deleteMyAvatar() {
  return api.delete("/me/avatar");
}

export function getApiErrorMessage(error) {
  return getErrorMessage(error, "Something went wrong");
}

export function extractApiErrorData(error) {
  if (error?.response?.data !== undefined) return error.response.data;
  if (typeof error?.message === "string") return { message: error.message, clientError: true };
  return { message: "Unknown error", clientError: true };
}



// =========================
// Workspaces API (Bearer via axios interceptor)
// Base paths: /api/WorkSpaces — dev proxy: /aigenda-api → backend
// =========================

/** Visibility enum in API body (int). */
export const WORKSPACE_VISIBILITY = {
  PRIVATE: 0,
  TEAM: 1,
  PUBLIC: 2,
};

function normalizeVisibility(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : 0;
}

/**
 * GET /api/WorkSpaces — list workspaces (simple request for testing)
 */
export async function getWorkspaces() {
  try {
    const response = await api.get("/api/WorkSpaces");
    console.log("API Response:", response.data);
    return response;
  } catch (error) {
    if (error?.response?.status === 401) {
      alert("Authentication Error: Please check your user token. Status: 401");
    }
    throw error;
  }
}

/** POST /api/WorkSpaces — create workspace */
export async function createWorkspace(payload) {
  // PascalCase enforcement for workspace payloads
  const workspaceData = {
    "Name": payload.name || payload.Name || "",          
    "Description": payload.description || payload.Description || "",  
    "IconCode": payload.iconCode || payload.IconCode || "default",
    "Visibility": parseInt(payload.visibility || payload.Visibility, 10) ?? 0 
  };
  
  console.log("Creating workspace with data:", workspaceData);
  
  try {
    const response = await api.post("/api/WorkSpaces", workspaceData);
    console.log("Workspace created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to create workspace:", error?.response?.data || error.message);
    throw error;
  }
}

/** GET /api/WorkSpaces/{Id} */
export async function getWorkspaceById(workspaceId) {
  return api.get(workspacePath(`/${workspaceId}`));
}

/** PUT /api/WorkSpaces/{Id} — update workspace */
export async function updateWorkspace(workspaceId, payload) {
  // PascalCase enforcement for workspace payloads
  const normalizedPayload = {
    "Name": String(payload?.name || payload?.Name || "New Workspace").trim(),
    "Description": String(payload?.description || payload?.Description || "No Description").trim(),
    "IconCode": String(payload?.iconCode || payload?.IconCode || "default").trim(),
    "Visibility": parseInt(payload?.visibility || payload?.Visibility, 10) ?? 0,
  };
  return api.put(workspacePath(`/${workspaceId}`), normalizedPayload, {
    headers: { "Content-Type": "application/json" },
  });
}

/** DELETE /api/WorkSpaces/{Id} — soft-delete workspace */
export async function softDeleteWorkspace(workspaceId) {
  try {
    const response = await api.delete(workspacePath(`/${workspaceId}`));
    console.log("Workspace deleted successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to delete workspace:", error?.response?.data || error.message);
    throw error;
  }
}

/** GET /api/WorkSpaces/{Id}/dashboard — stats + dashboard payload */
export async function getWorkspaceDashboard(workspaceId) {
  return api.get(workspacePath(`/${workspaceId}/dashboard`));
}

/** GET /api/WorkSpaces/dashboard — global dashboard */
export async function getGlobalDashboard() {
  return api.get(workspacePath("/dashboard"));
}

/** GET /api/WorkSpaces/{Id}/members */
export async function getWorkspaceMembers(workspaceId) {
  return api.get(workspacePath(`/${workspaceId}/members`));
}

/** POST /api/WorkSpaces/{Id}/member — invite by email */
export async function addWorkspaceMember(workspaceId, payload) {
  // PascalCase enforcement for member payloads
  const memberData = {
    "Email": String(payload?.email || payload?.Email || "").trim()
  };
  
  try {
    const response = await api.post(workspacePath(`/${workspaceId}/member`), memberData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Member added successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to add member:", error?.response?.data || error.message);
    throw error;
  }
}

/** DELETE /api/WorkSpaces/{Id}/remove — remove member (body: { email: "string" }) */
export async function removeWorkspaceMember(workspaceId, payload) {
  // Validation check
  if (!workspaceId) {
    throw new Error("workspaceId is required");
  }
  const memberEmail = String(payload?.email || payload?.Email || "").trim();
  if (!memberEmail) {
    throw new Error("email is required");
  }
  
  // API expects camelCase { email: "string" }
  const memberData = {
    email: memberEmail
  };
  
  try {
    const response = await api.delete(workspacePath(`/${workspaceId}/remove`), {
      data: memberData,
      headers: { "Content-Type": "application/json" },
    });
    console.log("Member removed successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to remove member:", error?.response?.data || error.message);
    throw error;
  }
}

/** GET /api/WorkSpaces/{Id}/members/{MemberUserId}/permissions */
export async function getMemberPermissions(workspaceId, memberUserId) {
  return api.get(
    workspacePath(
      `/${workspaceId}/members/${encodeURIComponent(memberUserId)}/permissions`
    )
  );
}

/** PUT /api/WorkSpaces/{Id}/members/{MemberUserId}/permissions — body { Permissions: string[] } */
export async function updateMemberPermissions(workspaceId, memberUserId, payload) {
  // PascalCase enforcement for permissions payload
  const permissionsData = {
    "Permissions": Array.isArray(payload?.permissions || payload?.Permissions) 
      ? (payload?.permissions || payload?.Permissions)
      : []
  };
  
  try {
    const response = await api.put(
      workspacePath(
        `/${workspaceId}/members/${encodeURIComponent(memberUserId)}/permissions`
      ),
      permissionsData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Permissions updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to update permissions:", error?.response?.data || error.message);
    throw error;
  }
}

/** PUT /api/WorkSpaces/{Id}/restore */
export async function restoreWorkspace(workspaceId) {
  return api.put(workspacePath(`/${workspaceId}/restore`));
}

/** GET /api/WorkSpaces/deleted */
export async function getDeletedWorkspaces() {
  return api.get(workspacePath("/deleted"));
}

/** Normalize list response from GET /api/WorkSpaces (shape varies by backend). */
export function parseWorkspacesResponse(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.workSpaces)) return d.workSpaces;
  if (Array.isArray(d?.workspaces)) return d.workspaces;
  return [];
}

/** Normalize single workspace object (PascalCase / camelCase). */
export function normalizeWorkspaceDto(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw.Id;
  return {
    id: id != null ? Number(id) : null,
    name: raw.name ?? raw.Name ?? "",
    description: raw.description ?? raw.Description ?? "",
    iconCode: raw.iconCode ?? raw.IconCode ?? "",
    visibility: raw.visibility ?? raw.Visibility,
    memberCount: raw.memberCount ?? raw.MemberCount ?? raw.membersCount ?? 0,
    taskCount: raw.taskCount ?? raw.TaskCount ?? raw.tasksCount ?? 0,
  };
}

/** Dashboard payload: flexible keys for backend variations. */
export function parseWorkspaceDashboard(res) {
  const root =
    res?.data?.data ??
    res?.data?.result ??
    res?.data?.dashboard ??
    res?.data?.payload ??
    res?.data;
  console.log('Dashboard API raw response:', res?.data);
  if (!root || typeof root !== "object") return {};
  return root;
}

// =========================
// Spaces API (Bearer via axios interceptor)
// Base paths: /api/WorkSpaces/{WorkspaceId}/Spaces
// =========================

/**
 * POST /api/WorkSpaces/{WorkspaceId}/Spaces — create space
 * Body: { name, description, iconCode, isPublic }
 */
export async function createSpace(workspaceId, payload) {
  const spaceData = {
    name: String(payload?.name || "").trim(),
    description: String(payload?.description || "").trim(),
    iconCode: String(payload?.iconCode || payload?.icon || "default").trim(),
    isPublic: Boolean(payload?.isPublic ?? payload?.isPrivate === false),
  };

  try {
    const response = await api.post(`/api/WorkSpaces/${workspaceId}/Spaces`, spaceData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Space created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to create space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * GET /api/WorkSpaces/{WorkspaceId}/Spaces — list spaces
 * Query: PageNumber, PageSize, SearchValue, SortColumn, SortOrder
 */
export async function getSpaces(workspaceId, params = {}) {
  const queryParams = {
    PageNumber: params.pageNumber ?? params.PageNumber ?? 1,
    PageSize: params.pageSize ?? params.PageSize ?? 10,
    SearchValue: params.searchValue ?? params.SearchValue ?? "",
    SortColumn: params.sortColumn ?? params.SortColumn ?? "name",
    SortOrder: params.sortOrder ?? params.SortOrder ?? "asc",
  };

  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces`, {
      params: queryParams,
    });
    console.log("Spaces fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch spaces:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * GET /api/WorkSpaces/{WorkspaceId}/Spaces/deleted — list deleted spaces
 */
export async function getDeletedSpaces(workspaceId) {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces/deleted`);
    console.log("Deleted spaces fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch deleted spaces:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id} — get space by id
 */
export async function getSpaceById(workspaceId, spaceId) {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}`);
    console.log("Space fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id} — update space
 * Body: { name, description, iconCode, isPublic }
 */
export async function updateSpace(workspaceId, spaceId, payload) {
  const spaceData = {
    name: String(payload?.name || "").trim(),
    description: String(payload?.description || "").trim(),
    iconCode: String(payload?.iconCode || payload?.icon || "default").trim(),
    isPublic: Boolean(payload?.isPublic ?? payload?.isPrivate === false),
  };

  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}`,
      spaceData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Space updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to update space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * DELETE /api/WorkSpaces/{WorkspaceId}/Spaces/{Id} — delete space
 */
export async function deleteSpace(workspaceId, spaceId) {
  try {
    const response = await api.delete(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}`);
    console.log("Space deleted successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to delete space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/move — move space to another workspace
 * Body: { targetWorkspaceId }
 */
export async function moveSpace(workspaceId, spaceId, payload) {
  const moveData = {
    targetWorkspaceId: String(payload?.targetWorkspaceId || "").trim(),
  };

  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/move`,
      moveData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Space moved successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to move space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/restore — restore deleted space
 */
export async function restoreSpace(workspaceId, spaceId) {
  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/restore`
    );
    console.log("Space restored successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to restore space:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics — get space analytics
 * Query: Days, Search
 */
export async function getSpaceAnalytics(workspaceId, spaceId, params = {}) {
  const queryParams = {
    Days: params.days ?? params.Days ?? 30,
    Search: params.search ?? params.Search ?? "",
  };

  try {
    const response = await api.get(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/analytics`,
      {
        params: queryParams,
      }
    );
    console.log("Space analytics fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch space analytics:", error?.response?.data || error.message);
    throw error;
  }
}

/**
 * GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics/export — export space analytics
 * Query: Days, Search
 */
export async function exportSpaceAnalytics(workspaceId, spaceId, params = {}) {
  const queryParams = {
    Days: params.days ?? params.Days ?? 30,
    Search: params.search ?? params.Search ?? "",
  };

  try {
    const response = await api.get(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/analytics/export`,
      {
        params: queryParams,
        responseType: "blob", // Important for file downloads
      }
    );
    console.log("Space analytics exported successfully");
    return response;
  } catch (error) {
    console.error("Failed to export space analytics:", error?.response?.data || error.message);
    throw error;
  }
}

// ============================================================================
// TASKS API
// Structured object for all task-related API endpoints
// ============================================================================
export const tasksAPI = {
  // 1. Create a task
  createTask: (workspaceId, spaceId, taskData) =>
    api.post(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks`, taskData),

  // 2. Get all tasks (with optional query parameters for sorting/pagination)
  getTasks: (workspaceId, spaceId, params = {}) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks`, { params }),

  // 3. Get removed tasks
  getRemovedTasks: (workspaceId, spaceId) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/removed`),

  // 4. Get specific removed task
  getRemovedTaskById: (workspaceId, spaceId, id) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/removed/${id}`),

  // 5. Get task by ID
  getTaskById: (workspaceId, spaceId, id) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}`),

  // 6. Update task (PUT)
  updateTask: (workspaceId, spaceId, id, taskData) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}`, taskData),

  // 7. Delete task
  deleteTask: (workspaceId, spaceId, id) =>
    api.delete(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}`),

  // 8. Update task status
  updateTaskStatus: (workspaceId, spaceId, id, statusData) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}/status`, statusData),

  // 9. Restore task
  restoreTask: (workspaceId, spaceId, id) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}/restore`),

  // 10. Assign member
  assignMember: (workspaceId, spaceId, id, assignData) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}/assign`, assignData),

  // 11. Unassign member
  unassignMember: (workspaceId, spaceId, id, unassignData) =>
    api.delete(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${id}/unassign`, { data: unassignData })
};

// ============================================================================
// NOTES API
// Endpoints from Note API.pdf accept multipart/form-data when files are present
// ============================================================================
function buildNoteFormData(noteData) {
  const formData = new FormData();

  if (noteData.title !== undefined) formData.append('title', noteData.title);
  if (noteData.type !== undefined) formData.append('type', noteData.type);
  if (noteData.content !== undefined) formData.append('content', noteData.content);
  if (noteData.drawingData !== undefined) {
    const drawing = typeof noteData.drawingData === 'string'
      ? noteData.drawingData
      : JSON.stringify(noteData.drawingData);
    formData.append('drawingData', drawing);
  }
  if (noteData.audioUrl !== undefined) formData.append('audioUrl', noteData.audioUrl);
  if (noteData.imageUrl !== undefined) formData.append('imageUrl', noteData.imageUrl);

  if (noteData.audioFile instanceof Blob) {
    const audioName = noteData.audioFileName || 'recording.webm';
    formData.append('audioFile', noteData.audioFile, audioName);
    formData.append('file', noteData.audioFile, audioName);
    formData.append('media', noteData.audioFile, audioName);
  }
  if (noteData.imageFile instanceof Blob) {
    const imageName = noteData.imageFileName || 'image.jpg';
    formData.append('imageFile', noteData.imageFile, imageName);
    formData.append('file', noteData.imageFile, imageName);
    formData.append('media', noteData.imageFile, imageName);
  }

  return formData;
}

function prepareNotePayload(noteData) {
  const hasFile = noteData.audioFile instanceof Blob || noteData.imageFile instanceof Blob;
  if (hasFile) {
    return buildNoteFormData(noteData);
  }
  return noteData;
}

export const notesAPI = {
  getNotes: (workspaceId, spaceId, params = {}) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Notes`, { params, timeout: 15000 }),

  createNote: (workspaceId, spaceId, noteData) =>
    api.post(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Notes`,
      prepareNotePayload(noteData),
      { timeout: 30000 }
    ),

  getNoteById: (workspaceId, spaceId, id) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Notes/${id}`, { timeout: 15000 }),

  updateNote: (workspaceId, spaceId, id, noteData) =>
    api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Notes/${id}`,
      prepareNotePayload(noteData),
      { timeout: 30000 }
    ),

  deleteNote: (workspaceId, spaceId, id) =>
    api.delete(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Notes/${id}`, { timeout: 15000 }),
};

// ============================================================================
// FOCUS SESSIONS API
// From swagger: https://aigendatest.runasp.net/swagger/v1/swagger.json
// ============================================================================
export const focusAPI = {
  // Start a focus session
  // POST /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions
  // Body: { durationMinutes, ambientSound, breakAfter, blockNotifications }
  startFocusSession: (workspaceId, spaceId, taskId, focusData) =>
    api.post(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions`, focusData),

  // Get current focus session
  // GET /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/current
  getCurrentFocusSession: (workspaceId, spaceId, taskId) =>
    api.get(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/current`),

  // Pause a focus session
  // PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/{SessionId}/pause
  pauseFocusSession: (workspaceId, spaceId, taskId, sessionId) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/${sessionId}/pause`),

  // Resume a focus session
  // PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/{SessionId}/resume
  resumeFocusSession: (workspaceId, spaceId, taskId, sessionId) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/${sessionId}/resume`),

  // Complete a focus session
  // PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/{SessionId}/complete
  completeFocusSession: (workspaceId, spaceId, taskId, sessionId) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/${sessionId}/complete`),

  // Abandon a focus session
  // PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/{SessionId}/abandon
  abandonFocusSession: (workspaceId, spaceId, taskId, sessionId) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/${sessionId}/abandon`),

  // Toggle focus session subtask completion
  // PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{SpaceId}/Tasks/{TaskId}/FocusSessions/{SessionId}/subtasks/{SubTaskId}
  // Body: { isCompleted }
  toggleFocusSubtask: (workspaceId, spaceId, taskId, sessionId, subTaskId, data) =>
    api.put(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/Tasks/${taskId}/FocusSessions/${sessionId}/subtasks/${subTaskId}`, data),
};