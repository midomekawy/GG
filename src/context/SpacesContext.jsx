import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createSpace as apiCreateSpace, getSpaces as apiGetSpaces, notesAPI } from "../services/api";

// ============================================================================
// MOCK DATA STRUCTURE - Mirrors Backend API Payload
// ============================================================================
// Backend Endpoint Reference:
// GET    /api/WorkSpaces/{WorkspaceId}/Spaces
// POST   /api/WorkSpaces/{WorkspaceId}/Spaces
// PUT    /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}
// DELETE /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}
// GET    /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics
// GET    /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/tasks
// GET    /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/notes
// PUT    /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/move
// ============================================================================

/**
 * MOCK_SPACES - Space data structure for multiple workspaces
 * Structure: { spaceId: { workspaceId: { analytics, tasks, notes } } }
 * This allows space-specific data instead of global mock data
 */
const MOCK_SPACES = [
  {
    id: "space-1",
    workspaceId: "workspace-1",
    name: "Product Design",
    description: "This redesign proposal aims to improve user experience and modernize the interface.",
    status: "active",
    views: ["Tasks", "Notes", "Analytics"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "space-2",
    workspaceId: "workspace-1",
    name: "User Research",
    description: "Conducting user interviews and surveys to gather insights for product improvements.",
    status: "active",
    views: ["Tasks", "Notes", "Analytics"],
    createdAt: "2024-02-01T14:30:00Z",
  },
  {
    id: "space-3",
    workspaceId: "workspace-1",
    name: "Marketing Campaign",
    description: "Planning and executing the Q2 marketing campaign for product launch.",
    status: "active",
    views: ["Tasks", "Notes", "Analytics"],
    createdAt: "2024-03-10T09:15:00Z",
  },
];

/**
 * SPACE-SPECIFIC ANALYTICS DATA
 * Each space has its own analytics. Structure matches API response.
 * Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics
 */
const MOCK_ANALYTICS_BY_SPACE = {
  "space-1": {
    totalTasksCompleted: 40,
    totalTasksInProgress: 12,
    totalTasksPending: 8,
    weeklyFocusTime: "32h 45m",
    productivityScore: 85,
    recentActivity: [
      { id: 1, action: "Completed task", description: "Design review", timestamp: "2 hours ago" },
      { id: 2, action: "Added note", description: "UI Mockups", timestamp: "5 hours ago" },
      { id: 3, action: "Updated task", description: "Design refinement", timestamp: "1 day ago" },
    ],
  },
  "space-2": {
    totalTasksCompleted: 28,
    totalTasksInProgress: 15,
    totalTasksPending: 5,
    weeklyFocusTime: "28h 20m",
    productivityScore: 78,
    recentActivity: [
      { id: 1, action: "Completed task", description: "Interview summary", timestamp: "1 hour ago" },
      { id: 2, action: "Added note", description: "User insights", timestamp: "3 hours ago" },
      { id: 3, action: "Started task", description: "Survey analysis", timestamp: "2 days ago" },
    ],
  },
  "space-3": {
    totalTasksCompleted: 35,
    totalTasksInProgress: 18,
    totalTasksPending: 4,
    weeklyFocusTime: "35h 10m",
    productivityScore: 92,
    recentActivity: [
      { id: 1, action: "Completed task", description: "Copy editing", timestamp: "30 mins ago" },
      { id: 2, action: "Updated task", description: "Ad campaign", timestamp: "4 hours ago" },
      { id: 3, action: "Approved task", description: "Launch prep", timestamp: "3 days ago" },
    ],
  },
};

/**
 * SPACE-SPECIFIC TASKS DATA
 * Each space can have different tasks. Structure matches API response.
 * Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/tasks
 */
const MOCK_TASKS_BY_SPACE = {
  "space-1": [
    { id: "task-1", feature: "Dashboard Redesign", progress: 75, urgency: "High", assignedTo: "John Doe" },
    { id: "task-2", feature: "Color System", progress: 60, urgency: "High", assignedTo: "Jane Smith" },
    { id: "task-3", feature: "Typography Updates", progress: 90, urgency: "Medium", assignedTo: "Bob Johnson" },
    { id: "task-4", feature: "Icon Library", progress: 20, urgency: "Low", assignedTo: "Alice Brown" },
  ],
  "space-2": [
    { id: "task-5", feature: "User Interviews", progress: 85, urgency: "High", assignedTo: "Carol Davis" },
    { id: "task-6", feature: "Survey Distribution", progress: 40, urgency: "Medium", assignedTo: "David Lee" },
    { id: "task-7", feature: "Data Analysis", progress: 55, urgency: "High", assignedTo: "Eve Wilson" },
  ],
  "space-3": [
    { id: "task-8", feature: "Social Media Copy", progress: 95, urgency: "High", assignedTo: "Frank Miller" },
    { id: "task-9", feature: "Email Campaign", progress: 70, urgency: "High", assignedTo: "Grace White" },
    { id: "task-10", feature: "Budget Approval", progress: 100, urgency: "Critical", assignedTo: "Henry Black" },
  ],
};

/**
 * SPACE-SPECIFIC NOTES DATA
 * Each space maintains its own notes. Structure matches API response.
 * Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/notes
 */
const SPACES_STORAGE_KEY = "aigendaSpaces";
const DELETED_SPACES_STORAGE_KEY = "aigendaDeletedSpaces";
const NOTES_STORAGE_KEY = "aigendaNotes";

const loadSpacesFromStorage = (workspaceId) => {
  try {
    const raw = localStorage.getItem(SPACES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return Array.isArray(all[workspaceId]) ? all[workspaceId] : null;
  } catch (e) {
    console.error("Failed to load spaces from localStorage:", e);
    return null;
  }
};

const saveSpacesToStorage = (workspaceId, spaces) => {
  try {
    const raw = localStorage.getItem(SPACES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[workspaceId] = spaces;
    localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save spaces to localStorage:", e);
  }
};

const loadDeletedSpacesFromStorage = () => {
  try {
    const raw = localStorage.getItem(DELETED_SPACES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load deleted spaces from localStorage:", e);
    return [];
  }
};

const saveDeletedSpacesToStorage = (deletedSpaces) => {
  try {
    localStorage.setItem(DELETED_SPACES_STORAGE_KEY, JSON.stringify(deletedSpaces));
  } catch (e) {
    console.error("Failed to save deleted spaces to localStorage:", e);
  }
};

const loadNotesFromStorage = () => {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load notes from localStorage:", e);
    return [];
  }
};

const saveNotesToStorage = (notes) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes to localStorage:", e);
  }
};

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const normalizeNote = (note, workspaceId, spaceId) => ({
  ...note,
  id: note.id || note.Id || note._id,
  workspaceId: note.workspaceId || note.WorkspaceId || workspaceId,
  spaceId: note.spaceId || note.SpaceId || note.spaceGUID || note.SpaceGuid || spaceId,
  type: note.type || note.noteType || note.NoteType || "text",
  title: note.title || note.Title || "Untitled note",
  content: note.content || note.Content || note.body || note.text || "",
  imageUrl: note.imageUrl || note.ImageUrl || note.mediaUrl || note.MediaUrl || note.fileUrl || note.FileUrl || "",
  audioUrl: note.audioUrl || note.AudioUrl || note.audioFileUrl || note.AudioFileUrl || note.mediaUrl || note.MediaUrl || note.fileUrl || note.FileUrl || note.url || "",
  drawingData: note.drawingData || note.DrawingData || note.canvasJson || note.CanvasJson || null,
  createdAt: note.createdAt || note.CreatedAt || new Date().toISOString(),
  updatedAt: note.updatedAt || note.UpdatedAt || note.createdAt || note.CreatedAt || new Date().toISOString(),
});

const MOCK_NOTES_BY_SPACE = {
  "space-1": [
    { id: "note-1", title: "Design Meeting Notes", content: "Discussed color palette and typography changes.", createdAt: "2024-05-20" },
    { id: "note-2", title: "Component Specs", content: "Button sizes and states documented", createdAt: "2024-05-18" },
    { id: "note-3", title: "User Feedback", content: "Accessibility improvements needed", createdAt: "2024-05-15" },
  ],
  "space-2": [
    { id: "note-4", title: "Interview Takeaways", content: "5 users tested new flow - 80% completion rate", createdAt: "2024-05-22" },
    { id: "note-5", title: "Survey Results", content: "200 responses collected, peak frustration at checkout", createdAt: "2024-05-19" },
    { id: "note-6", title: "Research Plan", content: "Next phase: A/B testing and heatmaps", createdAt: "2024-05-10" },
  ],
  "space-3": [
    { id: "note-7", title: "Campaign Outline", content: "Q2 Launch: Social, Email, Ads coordination plan", createdAt: "2024-05-21" },
    { id: "note-8", title: "Budget Breakdown", content: "Social: 40%, Ads: 35%, Email: 25%", createdAt: "2024-05-17" },
    { id: "note-9", title: "Launch Timeline", content: "Week 1: Teasers, Week 2: Full launch", createdAt: "2024-05-12" },
  ],
};

// ============================================================================
// CREATE & EXPORT CONTEXT
// ============================================================================
const SpacesContext = createContext(null);

// ============================================================================
// PROVIDER COMPONENT - Main State Management
// ============================================================================
export const SpacesProvider = ({ children, workspaceId }) => {
  // State Management - initialize from localStorage for persistence
  const [spaces, setSpaces] = useState(() => {
    const stored = workspaceId ? loadSpacesFromStorage(workspaceId) : null;
    return stored || [];
  });
  const [deletedSpaces, setDeletedSpaces] = useState(() => loadDeletedSpacesFromStorage());
  const [notes, setNotes] = useState(() => loadNotesFromStorage());
  const notesRef = useRef(notes);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [activeSpaceId, setActiveSpaceId] = useState(() => {
    return localStorage.getItem("aigendaActiveSpaceId") || null;
  });

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  const [activeTab, setActiveTab] = useState("Tasks"); // Possible values: "Tasks", "Notes", "Analytics"
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  // Derived State - Get active space from spaces array
  const activeSpace = spaces.find((space) => space.id === activeSpaceId);

  // Persist spaces to localStorage whenever they change
  useEffect(() => {
    if (workspaceId) {
      saveSpacesToStorage(workspaceId, spaces);
    }
  }, [spaces, workspaceId]);

  // Persist deleted spaces to localStorage whenever they change
  useEffect(() => {
    saveDeletedSpacesToStorage(deletedSpaces);
  }, [deletedSpaces]);

  // Persist notes to localStorage whenever they change
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // Helper function to get token from localStorage
  const getToken = useCallback(() => {
    let t = localStorage.getItem('userToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken');

    if (!t) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          t = userObj.token || userObj.accessToken || userObj.auth_token;
        }
      } catch (e) {
        // ignore
      }
    }
    return t;
  }, []);

  // Initialize token on mount and listen for storage changes
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getToken();
      if (currentToken !== token) {
        setToken(currentToken);
        setHasCheckedToken(true);
      }
    };

    // Initial check
    checkToken();

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', checkToken);

    // Poll for same-tab token changes (e.g. after login)
    const interval = setInterval(checkToken, 500);

    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(interval);
    };
  }, [getToken, token]);

  // ============================================================================
  // ACTION: FETCH SPACES FROM API
  // Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces
  // Fetches spaces from backend and updates local state
  // ============================================================================
  const fetchSpacesFromApi = useCallback(async (wsId) => {
    if (!wsId) return;

    // Strict check: Only fetch if token is available
    const activeToken = getToken();
    if (!activeToken) {
      console.warn("SpacesContext: Fetch skipped because no token is available yet.");
      // Silently skip without warning - token may not be ready yet
      return;
    }

    setLoading(true);
    try {
      console.log(`📋 Fetching spaces for workspace: ${wsId}`);
      // Backend API call temporarily disabled during transition
      // const response = await apiGetSpaces(wsId);
      // const apiSpaces = response.data?.items || response.data || [];

      // Load persisted spaces first; if none, seed with mock data
      let loadedSpaces = loadSpacesFromStorage(wsId);
      if (!loadedSpaces || loadedSpaces.length === 0) {
        loadedSpaces = MOCK_SPACES.filter(s => s.workspaceId === wsId);
        saveSpacesToStorage(wsId, loadedSpaces);
      }

      setSpaces(loadedSpaces);
      console.log(`✅ Loaded ${loadedSpaces.length} spaces (localStorage/mock)`);

      // Auto-Sync Active Space
      const storedActiveSpaceId = localStorage.getItem("aigendaActiveSpaceId");
      const spaceExists = loadedSpaces.some(s => String(s.id) === String(storedActiveSpaceId));

      if (storedActiveSpaceId && spaceExists) {
        setActiveSpaceId(storedActiveSpaceId);
      } else if (loadedSpaces.length > 0) {
        const defaultSpaceId = loadedSpaces[0].id;
        setActiveSpaceId(defaultSpaceId);
        localStorage.setItem("aigendaActiveSpaceId", defaultSpaceId);
        console.log(`Auto-sync active space: Defaulted to first space: ${defaultSpaceId}`);
      } else {
        setActiveSpaceId(null);
        localStorage.removeItem("aigendaActiveSpaceId");
      }
    } catch (error) {
      console.error("❌ Error fetching spaces:", error);
      setSpaces([]); // fallback to empty array on error so UI doesn't crash
      setActiveSpaceId(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Fetch spaces when workspaceId or token changes
  // Only fetch after we've checked for token at least once
  useEffect(() => {
    if (workspaceId && hasCheckedToken && token) {
      fetchSpacesFromApi(workspaceId);
    }
  }, [workspaceId, token, hasCheckedToken, fetchSpacesFromApi]);

  // ============================================================================
  // ACTION: GET SPACES
  // Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces
  // Returns: Active spaces filtered by workspaceId
  // ============================================================================
  const getSpaces = useCallback((wsId) => {
    console.log(`📋 Getting spaces for workspace: ${wsId}`);
    return spaces.filter(
      (space) => space.workspaceId === wsId && space.status === "active"
    );
  }, [spaces]);

  // ============================================================================
  // ACTION: GET DELETED SPACES (For Trash/Recycle Bin)
  // Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/deleted
  // Returns: Soft-deleted spaces for restoration
  // ============================================================================
  const getDeletedSpaces = useCallback((workspaceId) => {
    console.log(`🗑️ Fetching deleted spaces for workspace: ${workspaceId}`);
    return deletedSpaces.filter((space) => space.workspaceId === workspaceId);
  }, [deletedSpaces]);

  // ============================================================================
  // ACTION: CREATE SPACE
  // Maps to: POST /api/WorkSpaces/{WorkspaceId}/Spaces
  // Triggered: When user clicks (+) in sidebar to create new space
  // Returns: The newly created space object
  // ============================================================================
  const createSpace = useCallback(async (workspaceId, spaceData) => {
    console.log(`✅ Creating new space in workspace: ${workspaceId}`, spaceData);

    try {
      // Backend API call temporarily disabled during transition
      // const response = await apiCreateSpace(workspaceId, {
      //   name: spaceData.name || "New Space",
      //   description: spaceData.description || "",
      //   iconCode: spaceData.icon || spaceData.iconCode || "default",
      //   isPublic: !spaceData.isPrivate,
      // });
      // const newSpace = response.data;

      const newSpace = {
        id: `space-${Date.now()}`,
        workspaceId,
        name: spaceData.name || "New Space",
        description: spaceData.description || "",
        iconCode: spaceData.icon || spaceData.iconCode || "default",
        isPublic: !spaceData.isPrivate,
        status: "active",
        views: ["Tasks", "Notes", "Analytics"],
        createdAt: new Date().toISOString()
      };

      setSpaces((prev) => [...prev, newSpace]);
      console.log(`✨ Space created with ID: ${newSpace.id}`);
      return newSpace;
    } catch (error) {
      console.error("❌ Error creating space:", error);
      alert("Failed to create space.");
      throw error;
    }
  }, []);

  // ============================================================================
  // ACTION: UPDATE SPACE
  // Maps to: PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}
  // Triggered: When user edits space details (name, description)
  // ============================================================================
  const updateSpace = useCallback((spaceId, updatedData) => {
    console.log(`📝 Updating space: ${spaceId}`, updatedData);

    setSpaces((prev) =>
      prev.map((space) =>
        space.id === spaceId
          ? { ...space, ...updatedData, updatedAt: new Date().toISOString() }
          : space
      )
    );
  }, []);

  // ============================================================================
  // ACTION: DELETE SPACE (Soft Delete)
  // Maps to: DELETE /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}
  // Behavior: Moves space to deleted state (can be restored)
  // Also: Clears activeSpaceId if deleted space was active
  // ============================================================================
  const deleteSpace = useCallback((spaceId) => {
    console.log(`🗑️ Soft-deleting space: ${spaceId}`);

    setSpaces((prev) => {
      const spaceToDelete = prev.find((space) => space.id === spaceId);
      if (spaceToDelete) {
        const deletedSpace = { ...spaceToDelete, status: "deleted", deletedAt: new Date().toISOString() };
        setDeletedSpaces((prevDeleted) => [...prevDeleted, deletedSpace]);
        console.log(`📦 Space moved to trash: ${spaceId}`);
      }
      return prev.filter((space) => space.id !== spaceId);
    });

    // Clear selection if deleted space was active
    if (activeSpaceId === spaceId) {
      setActiveSpaceId(null);
      setActiveTab("Tasks");
    }
  }, [activeSpaceId]);

  // ============================================================================
  // ACTION: RESTORE SPACE
  // Maps to: PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/restore
  // Triggered: When user restores from trash/deleted spaces
  // ============================================================================
  const restoreSpace = useCallback((spaceId) => {
    console.log(`♻️ Restoring space: ${spaceId}`);

    setDeletedSpaces((prev) => {
      const spaceToRestore = prev.find((space) => space.id === spaceId);
      if (spaceToRestore) {
        const restoredSpace = { ...spaceToRestore, status: "active", restoredAt: new Date().toISOString() };
        setSpaces((prevSpaces) => [...prevSpaces, restoredSpace]);
        console.log(`✅ Space restored: ${spaceId}`);
      }
      return prev.filter((space) => space.id !== spaceId);
    });
  }, []);

  // ============================================================================
  // ACTION: MOVE SPACE (Reorder)
  // Maps to: PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/move
  // Purpose: Reorder spaces in sidebar (up/down)
  // ============================================================================
  const moveSpace = useCallback((spaceId, direction) => {
    console.log(`🔄 Moving space ${spaceId} ${direction}`);

    setSpaces((prev) => {
      const index = prev.findIndex((space) => space.id === spaceId);
      if (index === -1) {
        console.warn(`Space not found: ${spaceId}`);
        return prev;
      }

      const newSpaces = [...prev];
      if (direction === "up" && index > 0) {
        [newSpaces[index], newSpaces[index - 1]] = [newSpaces[index - 1], newSpaces[index]];
        console.log(`⬆️ Space moved up: ${spaceId}`);
      } else if (direction === "down" && index < newSpaces.length - 1) {
        [newSpaces[index], newSpaces[index + 1]] = [newSpaces[index + 1], newSpaces[index]];
        console.log(`⬇️ Space moved down: ${spaceId}`);
      }
      return newSpaces;
    });
  }, []);

  // ============================================================================
  // ACTION: GET ANALYTICS FOR A SPACE
  // Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics
  // Returns: Space-specific analytics data (tasks completed, productivity score, etc.)
  // ============================================================================
  const getSpaceAnalytics = useCallback((spaceId) => {
    console.log(`📊 Fetching analytics for space: ${spaceId}`);

    // Return empty default analytics structure instead of leaking mock data
    return {
      totalTasksCompleted: 0,
      totalTasksInProgress: 0,
      totalTasksPending: 0,
      weeklyFocusTime: "0h 0m",
      productivityScore: 0,
      recentActivity: [],
    };
  }, []);

  // ============================================================================
  // ACTION: GET TASKS FOR A SPACE
  // Maps to: GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/tasks
  // Returns: Space-specific tasks array
  // ============================================================================
  const getSpaceTasks = useCallback((spaceId) => {
    console.log(`✓ Fetching tasks for space: ${spaceId}`);
    return [];
  }, []);

  // ============================================================================
  // ACTION: GET NOTES FOR A SPACE
  // ============================================================================
  const fetchSpaceNotes = useCallback(async (workspaceIdParam, spaceId) => {
    const resolvedWorkspaceId = workspaceIdParam || workspaceId || localStorage.getItem("aigendaActiveWorkspaceId");
    const resolvedSpaceId = spaceId || activeSpaceId || localStorage.getItem("aigendaActiveSpaceId");

    if (!resolvedWorkspaceId || !resolvedSpaceId) {
      return [];
    }

    setNotesLoading(true);
    setNotesError(null);

    try {
      const response = await notesAPI.getNotes(resolvedWorkspaceId, resolvedSpaceId);
      const rawNotes = response?.data?.data || response?.data?.items || response?.data?.notes || response?.data || [];
      const normalizedNotes = Array.isArray(rawNotes)
        ? rawNotes.map((note) => normalizeNote(note, resolvedWorkspaceId, resolvedSpaceId))
        : [];

      setNotes((prevNotes) => {
        const otherNotes = prevNotes.filter(
          (note) => String(note.spaceId) !== String(resolvedSpaceId)
        );
        const serverNoteIds = new Set(normalizedNotes.map((n) => String(n.id)));
        const localNotesForSpace = prevNotes.filter(
          (note) =>
            String(note.spaceId) === String(resolvedSpaceId) &&
            String(note.id).startsWith('temp-note-') &&
            !serverNoteIds.has(String(note.id))
        );
        return [...otherNotes, ...normalizedNotes, ...localNotesForSpace];
      });

      return normalizedNotes;
    } catch (error) {
      const fallbackNotes = notesRef.current.filter((note) => String(note.spaceId) === String(resolvedSpaceId));
      console.warn("Notes API unavailable, using local notes fallback:", error?.message || error);
      setNotesError(null);
      return fallbackNotes;
    } finally {
      setNotesLoading(false);
    }
  }, [activeSpaceId, workspaceId]);

  // ============================================================================
  // ACTION: CREATE NOTE
  // ============================================================================
  const createSpaceNote = useCallback(async (workspaceIdParam, spaceId, noteData) => {
    const resolvedWorkspaceId = workspaceIdParam || workspaceId || localStorage.getItem("aigendaActiveWorkspaceId");
    const resolvedSpaceId = spaceId || activeSpaceId || localStorage.getItem("aigendaActiveSpaceId");

    if (!resolvedWorkspaceId || !resolvedSpaceId) {
      throw new Error("workspaceId and spaceId are required to create a note");
    }

    const optimisticId = `temp-note-${Date.now()}`;
    const { audioFile, imageFile, ...noteDataWithoutFiles } = noteData;
    const optimisticNote = normalizeNote(
      {
        ...noteDataWithoutFiles,
        id: optimisticId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      resolvedWorkspaceId,
      resolvedSpaceId
    );

    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const response = await notesAPI.createNote(resolvedWorkspaceId, resolvedSpaceId, noteData);
      const responseData = response?.data?.data || response?.data || {};
      const committedNote = normalizeNote({ ...responseData, id: responseData.id || responseData.Id || optimisticId }, resolvedWorkspaceId, resolvedSpaceId);

      let patchedNote = committedNote;
      if (noteData.audioFile instanceof Blob && !committedNote.audioUrl) {
        try {
          patchedNote = { ...committedNote, audioUrl: await blobToBase64(noteData.audioFile) };
        } catch (e) {
          console.warn("Failed to convert audio to base64:", e);
        }
      }
      if (noteData.imageFile instanceof Blob && !committedNote.imageUrl) {
        try {
          patchedNote = { ...patchedNote, imageUrl: await blobToBase64(noteData.imageFile) };
        } catch (e) {
          console.warn("Failed to convert image to base64:", e);
        }
      }

      setNotes((prev) => prev.map((note) => (note.id === optimisticId ? patchedNote : note)));
      return patchedNote;
    } catch (error) {
      const { audioFile: _a, imageFile: _i, ...fallbackNoteData } = noteData;
      let localFallbackData = { ...fallbackNoteData, id: optimisticId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

      if (noteData.audioFile instanceof Blob) {
        try {
          localFallbackData = { ...localFallbackData, audioUrl: await blobToBase64(noteData.audioFile) };
        } catch (e) {
          console.warn("Failed to convert audio to base64:", e);
        }
      }
      if (noteData.imageFile instanceof Blob) {
        try {
          localFallbackData = { ...localFallbackData, imageUrl: await blobToBase64(noteData.imageFile) };
        } catch (e) {
          console.warn("Failed to convert image to base64:", e);
        }
      }

      const localNote = normalizeNote(localFallbackData, resolvedWorkspaceId, resolvedSpaceId);
      setNotes((prev) => prev.map((note) => (note.id === optimisticId ? localNote : note)));
      console.warn("Notes API unavailable, saved note locally:", error?.message || error);
      setNotesError(null);
      return localNote;
    }
  }, [activeSpaceId, workspaceId]);

  // ============================================================================
  // ACTION: UPDATE NOTE
  // ============================================================================
  const updateSpaceNote = useCallback(async (workspaceIdParam, spaceId, noteId, noteData) => {
    const resolvedWorkspaceId = workspaceIdParam || workspaceId || localStorage.getItem("aigendaActiveWorkspaceId");
    const resolvedSpaceId = spaceId || activeSpaceId || localStorage.getItem("aigendaActiveSpaceId");
    const normalizedNoteId = String(noteId);

    if (!resolvedWorkspaceId || !resolvedSpaceId) {
      throw new Error("workspaceId and spaceId are required to update a note");
    }

    const previousNotes = [...notes];
    const { audioFile: _a, imageFile: _i, ...updateOptimisticData } = noteData;
    setNotes((prev) => prev.map((note) => (String(note.id) === normalizedNoteId ? { ...note, ...updateOptimisticData } : note)));

    try {
      const response = await notesAPI.updateNote(resolvedWorkspaceId, resolvedSpaceId, noteId, noteData);
      const responseData = response?.data?.data || response?.data || {};
      const committedNote = normalizeNote({ ...responseData, id: responseData.id || responseData.Id || noteId }, resolvedWorkspaceId, resolvedSpaceId);
      setNotes((prev) => prev.map((note) => (String(note.id) === normalizedNoteId ? committedNote : note)));
      return committedNote;
    } catch (error) {
      const { audioFile: _a, imageFile: _i, ...updateWithoutFiles } = noteData;
      const localUpdatedNote = normalizeNote(
        { ...notes.find((note) => String(note.id) === normalizedNoteId), ...updateWithoutFiles, id: noteId },
        resolvedWorkspaceId,
        resolvedSpaceId
      );
      setNotes((prev) => prev.map((note) => (String(note.id) === normalizedNoteId ? localUpdatedNote : note)));
      console.warn("Notes API unavailable, updated note locally:", error?.message || error);
      setNotesError(null);
      return localUpdatedNote;
    }
  }, [activeSpaceId, notes, workspaceId]);

  // ============================================================================
  // ACTION: DELETE NOTE
  // ============================================================================
  const deleteSpaceNote = useCallback(async (workspaceIdParam, spaceId, noteId) => {
    const resolvedWorkspaceId = workspaceIdParam || workspaceId || localStorage.getItem("aigendaActiveWorkspaceId");
    const resolvedSpaceId = spaceId || activeSpaceId || localStorage.getItem("aigendaActiveSpaceId");
    const normalizedNoteId = String(noteId);

    if (!resolvedWorkspaceId || !resolvedSpaceId) {
      throw new Error("workspaceId and spaceId are required to delete a note");
    }

    const previousNotes = [...notes];
    setNotes((prev) => prev.filter((note) => String(note.id) !== normalizedNoteId));

    try {
      const response = await notesAPI.deleteNote(resolvedWorkspaceId, resolvedSpaceId, noteId);
      return response?.data;
    } catch (error) {
      console.warn("Notes API unavailable, deleted note locally:", error?.message || error);
      setNotesError(null);
      return { deletedLocally: true };
    }
  }, [activeSpaceId, notes, workspaceId]);

  // ============================================================================
  // HELPER: GET NOTES FOR ACTIVE SPACE
  // ============================================================================
  const getSpaceNotes = useCallback((spaceId) => {
    console.log(`📝 Fetching notes for space: ${spaceId}`);
    return notes.filter((note) => String(note.spaceId) === String(spaceId));
  }, [notes]);

  // ============================================================================
  // ACTION: SELECT SPACE
  // Purpose: Set the active space and reset tab to "Tasks"
  // Triggered: When user clicks on a space in the sidebar
  // ============================================================================
  const selectSpace = useCallback((spaceId) => {
    console.log(`🎯 Selecting space: ${spaceId}`);
    setActiveSpaceId(spaceId);
    if (spaceId) {
      localStorage.setItem("aigendaActiveSpaceId", spaceId);
    } else {
      localStorage.removeItem("aigendaActiveSpaceId");
    }
    setActiveTab("Tasks"); // Reset to Tasks tab when selecting a new space
  }, []);

  // ============================================================================
  // ACTION: SET ACTIVE TAB
  // Purpose: Switch between Tasks, Notes, and Analytics views
  // Triggered: When user clicks tab buttons
  // ============================================================================
  const setActiveTabHandler = useCallback((tab) => {
    if (!["Tasks", "Notes", "Analytics"].includes(tab)) {
      console.warn(`Invalid tab: ${tab}. Must be 'Tasks', 'Notes', or 'Analytics'`);
      return;
    }
    console.log(`📑 Switching to tab: ${tab}`);
    setActiveTab(tab);
  }, []);

  // ============================================================================
  // HELPER: SEARCH SPACES
  // Purpose: Filter spaces by name or description (for future search feature)
  // ============================================================================
  const searchSpaces = useCallback((workspaceId, searchQuery) => {
    if (!searchQuery.trim()) {
      return getSpaces(workspaceId);
    }
    const query = searchQuery.toLowerCase();
    return getSpaces(workspaceId).filter(
      (space) =>
        space.name.toLowerCase().includes(query) ||
        space.description.toLowerCase().includes(query)
    );
  }, [getSpaces]);

  // ============================================================================
  // HELPER: SORT SPACES
  // Purpose: Sort spaces by creation date or name
  // ============================================================================
  const sortSpaces = useCallback((workspaceId, sortBy = "createdAt") => {
    const workspaceSpaces = getSpaces(workspaceId);
    const sorted = [...workspaceSpaces];

    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "createdAt") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [getSpaces]);

  // ============================================================================
  // HELPER: GET SPACE BY ID
  // Purpose: Find and return a single space by ID
  // ============================================================================
  const getSpaceById = useCallback((spaceId) => {
    return spaces.find((space) => space.id === spaceId);
  }, [spaces]);

  // ============================================================================
  // CONTEXT VALUE OBJECT
  // Provides all state and actions to consuming components
  // ============================================================================
  const value = {
    // -------- STATE --------
    spaces,
    deletedSpaces,
    activeSpace,
    activeSpaceId,
    activeTab,
    loading,
    notes,
    notesLoading,
    notesError,

    // -------- CORE ACTIONS (CRUD) --------
    getSpaces,
    getDeletedSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
    restoreSpace,
    moveSpace,

    // -------- SPACE DATA ACTIONS --------
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes,
    fetchSpaceNotes,
    createSpaceNote,
    updateSpaceNote,
    deleteSpaceNote,

    // -------- UI ACTIONS --------
    selectSpace,
    setActiveTab: setActiveTabHandler,

    // -------- HELPER FUNCTIONS --------
    searchSpaces,
    sortSpaces,
    getSpaceById,
  };

  return (
    <SpacesContext.Provider value={value}>
      {children}
    </SpacesContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK - useSpaces
// Purpose: Consume SpacesContext from any component
// Error: Throws if used outside SpacesProvider
// ============================================================================
export const useSpaces = () => {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error(
      "❌ useSpaces() must be used within a <SpacesProvider>. " +
      "Make sure your component is wrapped with SpacesProvider in App.jsx"
    );
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================
export default SpacesContext;
