# Spaces Feature - State Management Documentation

## Overview
The Spaces feature uses React Context API for centralized state management. All state is currently managed with mock data that perfectly mirrors the backend API structure, making it easy to swap for real API calls later.

---

## Table of Contents
1. [Data Structure](#data-structure)
2. [Context API Reference](#context-api-reference)
3. [State Management Actions](#state-management-actions)
4. [Component Integration Guide](#component-integration-guide)
5. [API Integration Roadmap](#api-integration-roadmap)
6. [Debugging & Logging](#debugging--logging)

---

## Data Structure

### Space Object (Core Entity)
```javascript
{
  id: "space-1",                    // Unique identifier (string/UUID)
  workspaceId: "workspace-1",       // Parent workspace ID
  name: "Product Design",           // Display name
  description: "...",               // Long description
  status: "active",                 // 'active' | 'deleted'
  views: ["Tasks", "Notes", "Analytics"],  // Available sub-views
  createdAt: "2024-01-15T10:00:00Z",  // ISO 8601 timestamp
  updatedAt: "2024-01-20T15:30:00Z",  // Optional: Last update time
  deletedAt: "2024-02-01T10:00:00Z",  // Optional: Deletion timestamp
}
```

### Analytics Data (Space-Specific)
```javascript
{
  totalTasksCompleted: 40,          // Number of completed tasks
  totalTasksInProgress: 12,         // Tasks currently being worked on
  totalTasksPending: 8,             // Tasks not yet started
  weeklyFocusTime: "32h 45m",       // Total focus time this week
  productivityScore: 85,            // Percentage 0-100
  recentActivity: [
    {
      id: 1,
      action: "Completed task",     // Action type
      description: "Design review", // What was done
      timestamp: "2 hours ago"      // Relative or absolute time
    }
  ]
}
```

### Task Object (Space-Specific)
```javascript
{
  id: "task-1",                     // Unique task ID
  feature: "Dashboard Redesign",    // Task name
  progress: 75,                     // Percentage complete 0-100
  urgency: "High",                  // 'High' | 'Medium' | 'Low' | 'Critical'
  assignedTo: "John Doe"            // Team member name or ID
}
```

### Note Object (Space-Specific)
```javascript
{
  id: "note-1",                     // Unique note ID
  title: "Design Meeting Notes",    // Note title
  content: "Discussed color...",    // Note content (markdown supported)
  createdAt: "2024-05-20"          // Creation date
}
```

---

## Context API Reference

### useSpaces Hook
```javascript
import { useSpaces } from '../../context/SpacesContext';

const MyComponent = () => {
  const {
    // State
    spaces,
    deletedSpaces,
    activeSpace,
    activeSpaceId,
    activeTab,
    
    // Actions
    getSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
    restoreSpace,
    moveSpace,
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes,
    selectSpace,
    setActiveTab,
    
    // Helpers
    searchSpaces,
    sortSpaces,
    getSpaceById,
  } = useSpaces();
  
  // ... component code
};
```

---

## State Management Actions

### 1. GET SPACES
**Backend Endpoint:** `GET /api/WorkSpaces/{WorkspaceId}/Spaces`

```javascript
const spaces = getSpaces("workspace-1");
// Returns: Array of active spaces for the workspace
// Returns: []  (if none found)
```

**Use Cases:**
- Load space list in sidebar on component mount
- Display available spaces to user

---

### 2. GET DELETED SPACES
**Backend Endpoint:** `GET /api/WorkSpaces/{WorkspaceId}/Spaces/deleted`

```javascript
const deletedSpaces = getDeletedSpaces("workspace-1");
// Returns: Array of soft-deleted spaces
// Returns: []  (if none deleted)
```

**Use Cases:**
- Show recycle bin / trash view
- Allow user to restore deleted spaces

---

### 3. CREATE SPACE
**Backend Endpoint:** `POST /api/WorkSpaces/{WorkspaceId}/Spaces`

```javascript
const newSpace = createSpace("workspace-1", {
  name: "New Project",
  description: "Project description here"
});

// Returns: The newly created space object with generated ID
// Side Effects:
//   - Adds space to spaces array
//   - Logs creation in console
```

**Use Cases:**
- Modal form submission (CreateSpaceModal.jsx)
- Quick create button in sidebar

**Example in Component:**
```javascript
const handleCreateSpace = () => {
  const { createSpace } = useSpaces();
  createSpace("workspace-1", {
    name: formData.name,
    description: formData.description
  });
};
```

---

### 4. UPDATE SPACE
**Backend Endpoint:** `PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}`

```javascript
updateSpace("space-1", {
  name: "Updated Name",
  description: "Updated description"
});

// Side Effects:
//   - Updates existing space in spaces array
//   - Adds updatedAt timestamp
```

**Use Cases:**
- Edit space details from context menu
- Rename space after creation

---

### 5. DELETE SPACE (Soft Delete)
**Backend Endpoint:** `DELETE /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}`

```javascript
deleteSpace("space-1");

// Side Effects:
//   - Moves space to deletedSpaces array
//   - Sets status = "deleted"
//   - Clears activeSpaceId if deleted space was active
//   - Logs deletion in console
```

**Use Cases:**
- Delete button in space context menu
- Batch delete operations

**Important:** This is a soft delete - space can be restored

---

### 6. RESTORE SPACE
**Backend Endpoint:** `PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/restore`

```javascript
restoreSpace("space-1");

// Side Effects:
//   - Moves space from deletedSpaces back to spaces
//   - Sets status = "active"
//   - Adds restoredAt timestamp
```

**Use Cases:**
- Restore button in recycle bin view
- Undo delete functionality

---

### 7. MOVE SPACE (Reorder)
**Backend Endpoint:** `PUT /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/move`

```javascript
moveSpace("space-1", "up");    // Move space up in list
moveSpace("space-1", "down");  // Move space down in list

// Side Effects:
//   - Reorders spaces array
//   - Updates view immediately
```

**Use Cases:**
- Move Up/Down context menu items
- Drag-and-drop reordering (future enhancement)

---

### 8. GET SPACE ANALYTICS
**Backend Endpoint:** `GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics`

```javascript
const analytics = getSpaceAnalytics("space-1");

// Returns:
// {
//   totalTasksCompleted: 40,
//   totalTasksInProgress: 12,
//   totalTasksPending: 8,
//   weeklyFocusTime: "32h 45m",
//   productivityScore: 85,
//   recentActivity: [...]
// }
```

**Use Cases:**
- Render analytics tab cards
- Display recent activity feed
- Show productivity score

---

### 9. GET SPACE TASKS
**Backend Endpoint:** `GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/tasks`

```javascript
const tasks = getSpaceTasks("space-1");

// Returns: Array of task objects
// [
//   { id: "task-1", feature: "...", progress: 75, urgency: "High", assignedTo: "..." },
//   ...
// ]
```

**Use Cases:**
- Render tasks table in Tasks tab
- Filter/sort tasks
- Show task progress

---

### 10. GET SPACE NOTES
**Backend Endpoint:** `GET /api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/notes`

```javascript
const notes = getSpaceNotes("space-1");

// Returns: Array of note objects
// [
//   { id: "note-1", title: "...", content: "...", createdAt: "..." },
//   ...
// ]
```

**Use Cases:**
- Render notes grid in Notes tab
- Display note cards with content preview
- Show note creation dates

---

### 11. SELECT SPACE
**No Backend Endpoint** (Client-side only)

```javascript
selectSpace("space-1");

// Side Effects:
//   - Sets activeSpaceId = "space-1"
//   - Resets activeTab = "Tasks"
//   - Updates activeSpace (derived state)
```

**Use Cases:**
- Click handler for space items in sidebar
- Navigation between spaces

---

### 12. SET ACTIVE TAB
**No Backend Endpoint** (Client-side only)

```javascript
setActiveTab("Tasks");     // Valid: "Tasks", "Notes", "Analytics"
setActiveTab("Notes");
setActiveTab("Analytics");

// Side Effects:
//   - Updates activeTab state
//   - Warns if invalid tab name
```

**Use Cases:**
- Tab button click handlers
- Programmatic navigation between tabs

---

## Component Integration Guide

### SpacesSidebar.jsx (List + CRUD)
```javascript
import { useSpaces } from "../../context/SpacesContext";

export const SpacesSidebar = ({ workspaceId }) => {
  const {
    getSpaces,              // Fetch all spaces
    selectSpace,            // Click handler
    createSpace,            // Create button
    updateSpace,            // Edit action
    deleteSpace,            // Delete action
    moveSpace,              // Move up/down
    activeSpaceId           // Highlight active space
  } = useSpaces();

  const spaces = getSpaces(workspaceId);

  return (
    <div className="spaces-sidebar">
      {/* Space list with click handlers */}
      {spaces.map(space => (
        <div key={space.id} onClick={() => selectSpace(space.id)}>
          {space.name}
        </div>
      ))}
    </div>
  );
};
```

### SpacesLayout.jsx (Main Content + Tabs)
```javascript
import { useSpaces } from "../../context/SpacesContext";

export const SpacesLayout = ({ workspaceId }) => {
  const {
    activeSpace,            // Current space
    activeTab,              // Current tab
    setActiveTab,           // Tab switch handler
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes
  } = useSpaces();

  const analytics = getSpaceAnalytics(activeSpace?.id);
  const tasks = getSpaceTasks(activeSpace?.id);
  const notes = getSpaceNotes(activeSpace?.id);

  return (
    <div className="spaces-layout">
      {/* Tab buttons */}
      <button onClick={() => setActiveTab("Tasks")}>Tasks</button>
      <button onClick={() => setActiveTab("Notes")}>Notes</button>
      <button onClick={() => setActiveTab("Analytics")}>Analytics</button>

      {/* Render content based on activeTab */}
      {activeTab === "Tasks" && <TasksView tasks={tasks} />}
      {activeTab === "Notes" && <NotesView notes={notes} />}
      {activeTab === "Analytics" && <AnalyticsView analytics={analytics} />}
    </div>
  );
};
```

### CreateSpaceModal.jsx (Form)
```javascript
import { useSpaces } from "../../context/SpacesContext";

export const CreateSpaceModal = ({ workspaceId, open, onClose }) => {
  const { createSpace } = useSpaces();
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) return;
    
    // Create space
    createSpace(workspaceId, {
      name: formData.name,
      description: formData.description
    });
    
    // Reset and close
    setFormData({ name: "", description: "" });
    onClose();
  };

  // ... render form
};
```

---

## API Integration Roadmap

### Step 1: Install Axios (Already done)
The project already has axios configured in `services/api.js`

### Step 2: Replace Mock Data with API Calls
Replace each action function with actual API calls:

**Before (Mock):**
```javascript
const getSpaces = useCallback((workspaceId) => {
  return spaces.filter(space => space.workspaceId === workspaceId);
}, [spaces]);
```

**After (API):**
```javascript
const getSpaces = useCallback(async (workspaceId) => {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces`);
    setSpaces(response.data);  // Assuming API returns array
    return response.data;
  } catch (error) {
    console.error("Failed to fetch spaces:", error);
    return [];
  }
}, []);
```

### Step 3: Add Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Then update actions to set these states
```

### Step 4: Handle API Errors Gracefully
```javascript
const [apiErrors, setApiErrors] = useState({});

// Catch errors and display in UI
```

### Step 5: Update Components to Handle Async
```javascript
// Use useEffect to fetch on mount
useEffect(() => {
  const spaces = getSpaces(workspaceId);
  // ...
}, [workspaceId]);
```

---

## Debugging & Logging

### Console Logs
All actions log to console with emoji prefixes:

```
📋 Fetching spaces for workspace: workspace-1
✅ Creating new space in workspace: workspace-1
📝 Updating space: space-1
🗑️ Soft-deleting space: space-1
♻️ Restoring space: space-1
🔄 Moving space space-1 up
📊 Fetching analytics for space: space-1
✓ Fetching tasks for space: space-1
📝 Fetching notes for space: space-1
🎯 Selecting space: space-1
📑 Switching to tab: Tasks
```

### Browser DevTools
1. Open React DevTools extension
2. Find `<SpacesProvider>` in component tree
3. Click on it to inspect context value
4. All state and functions visible in props

### Testing State Changes
```javascript
// In browser console:
// Access context through component inspection or:
const { useSpaces } = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
```

---

## Space-Specific Data

Each space has its own analytics, tasks, and notes:

| Space ID | Analytics | Tasks | Notes |
|----------|-----------|-------|-------|
| space-1 | 85 score, 40 completed | 4 tasks | 3 notes |
| space-2 | 78 score, 28 completed | 3 tasks | 3 notes |
| space-3 | 92 score, 35 completed | 3 tasks | 3 notes |

When you call `getSpaceAnalytics("space-1")`, you get analytics for that specific space only.

---

## Error Handling (Future)

When integrating with real API, add error handling:

```javascript
const getSpaces = useCallback(async (workspaceId) => {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error("Workspace not found");
    } else if (error.response?.status === 401) {
      console.error("Unauthorized");
    } else {
      console.error("Error fetching spaces:", error);
    }
    return [];
  }
}, []);
```

---

## Performance Considerations

1. **useCallback Dependencies:** All actions use proper dependency arrays
2. **Memoization:** Derived state (activeSpace) computed in render
3. **Re-renders:** Only components using changed state re-render
4. **Future:** Consider React Query or SWR for caching/optimization

---

## Files Modified
- `src/context/SpacesContext.jsx` - Main context provider
- `src/components/SpacesComponent/SpacesSidebar.jsx` - Already using context
- `src/components/SpacesComponent/SpacesLayout.jsx` - Already using context
- `src/components/SpacesComponent/CreateSpaceModal.jsx` - Already using context

---

## Next Steps
1. ✅ State Management Complete (This file)
2. ⏳ API Integration (Replace mock with real calls)
3. ⏳ Error Handling (Add try-catch, user feedback)
4. ⏳ Loading States (Show spinners during API calls)
5. ⏳ Caching Strategy (Prevent duplicate requests)
6. ⏳ Real-time Updates (WebSocket or polling)
