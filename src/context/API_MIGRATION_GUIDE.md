# API Migration Guide - Spaces Feature

This guide shows exactly how to migrate from mock data to real API calls when your backend is ready.

---

## Current Architecture

### Mock Data Flow
```
SpacesContext (Mock Data)
    ↓
useSpaces() Hook
    ↓
Components (SpacesSidebar, SpacesLayout, etc.)
    ↓
User Interface
```

### Future Architecture (With API)
```
SpacesContext (API Calls)
    ↓
axios (services/api.js)
    ↓
Backend API (/api/WorkSpaces/{WorkspaceId}/Spaces)
    ↓
useSpaces() Hook
    ↓
Components (Same Interface)
    ↓
User Interface
```

**Key Point:** Component code doesn't change! Only SpacesContext implementation changes.

---

## API Endpoints Mapping

| Function | Method | Endpoint | Body | Response |
|----------|--------|----------|------|----------|
| `getSpaces` | GET | `/api/WorkSpaces/{WorkspaceId}/Spaces` | - | `Space[]` |
| `getDeletedSpaces` | GET | `/api/WorkSpaces/{WorkspaceId}/Spaces/deleted` | - | `Space[]` |
| `createSpace` | POST | `/api/WorkSpaces/{WorkspaceId}/Spaces` | `{ name, description }` | `Space` |
| `updateSpace` | PUT | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}` | `{ name, description }` | `Space` |
| `deleteSpace` | DELETE | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}` | - | `void` |
| `restoreSpace` | PUT | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/restore` | - | `Space` |
| `moveSpace` | PUT | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/move` | `{ direction }` | `Space[]` |
| `getSpaceAnalytics` | GET | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/analytics` | - | `Analytics` |
| `getSpaceTasks` | GET | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/tasks` | - | `Task[]` |
| `getSpaceNotes` | GET | `/api/WorkSpaces/{WorkspaceId}/Spaces/{Id}/notes` | - | `Note[]` |

---

## Step-by-Step Migration

### Step 1: Add API Helper Functions (services/api.js)

```javascript
// At the bottom of services/api.js, add these functions:

/**
 * SPACES API - All endpoints for space management
 * Base Path: /api/WorkSpaces/{WorkspaceId}/Spaces
 */

// GET - List all active spaces for a workspace
export async function getSpaces(workspaceId) {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces`);
    console.log('✅ Spaces fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching spaces:', error);
    throw error;
  }
}

// GET - List deleted spaces for a workspace
export async function getDeletedSpaces(workspaceId) {
  try {
    const response = await api.get(`/api/WorkSpaces/${workspaceId}/Spaces/deleted`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching deleted spaces:', error);
    throw error;
  }
}

// POST - Create a new space
export async function createSpace(workspaceId, spaceData) {
  try {
    const response = await api.post(
      `/api/WorkSpaces/${workspaceId}/Spaces`,
      {
        name: spaceData.name,
        description: spaceData.description
      }
    );
    console.log('✅ Space created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating space:', error);
    throw error;
  }
}

// PUT - Update space details
export async function updateSpace(workspaceId, spaceId, updateData) {
  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}`,
      {
        name: updateData.name,
        description: updateData.description
      }
    );
    console.log('✅ Space updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating space:', error);
    throw error;
  }
}

// DELETE - Soft delete a space
export async function deleteSpace(workspaceId, spaceId) {
  try {
    await api.delete(`/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}`);
    console.log('✅ Space deleted:', spaceId);
  } catch (error) {
    console.error('❌ Error deleting space:', error);
    throw error;
  }
}

// PUT - Restore a deleted space
export async function restoreSpace(workspaceId, spaceId) {
  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/restore`
    );
    console.log('✅ Space restored:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error restoring space:', error);
    throw error;
  }
}

// PUT - Move space (reorder)
export async function moveSpace(workspaceId, spaceId, direction) {
  try {
    const response = await api.put(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/move`,
      { direction }
    );
    console.log(`✅ Space moved ${direction}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error moving space:', error);
    throw error;
  }
}

// GET - Get analytics for a specific space
export async function getSpaceAnalytics(workspaceId, spaceId) {
  try {
    const response = await api.get(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/analytics`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    throw error;
  }
}

// GET - Get tasks for a specific space
export async function getSpaceTasks(workspaceId, spaceId) {
  try {
    const response = await api.get(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/tasks`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    throw error;
  }
}

// GET - Get notes for a specific space
export async function getSpaceNotes(workspaceId, spaceId) {
  try {
    const response = await api.get(
      `/api/WorkSpaces/${workspaceId}/Spaces/${spaceId}/notes`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    throw error;
  }
}
```

### Step 2: Update SpacesContext.jsx

Change from using mock data to API calls. Here's the pattern for each function:

#### Before (Mock):
```javascript
const getSpaces = useCallback((workspaceId) => {
  return spaces.filter(
    (space) => space.workspaceId === workspaceId && space.status === "active"
  );
}, [spaces]);
```

#### After (API):
```javascript
import * as spacesApi from '../../services/api';

const getSpaces = useCallback(async (workspaceId) => {
  try {
    console.log(`📋 Fetching spaces for workspace: ${workspaceId}`);
    const data = await spacesApi.getSpaces(workspaceId);
    setSpaces(data);  // Update local state
    return data;
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
    setError(error.message);
    return [];
  }
}, []);
```

#### Full Updated Context (Partial - Show Key Changes):
```javascript
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as spacesApi from '../../services/api';

const SpacesContext = createContext(null);

export const SpacesProvider = ({ children }) => {
  // State
  const [spaces, setSpaces] = useState([]);
  const [deletedSpaces, setDeletedSpaces] = useState([]);
  const [activeSpaceId, setActiveSpaceId] = useState(null);
  const [activeTab, setActiveTab] = useState("Tasks");
  
  // New: Add loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeSpace = spaces.find((space) => space.id === activeSpaceId);

  // ========== GET SPACES (Now using API) ==========
  const getSpaces = useCallback(async (workspaceId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await spacesApi.getSpaces(workspaceId);
      setSpaces(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ getSpaces error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== CREATE SPACE (Now using API) ==========
  const createSpace = useCallback(async (workspaceId, spaceData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newSpace = await spacesApi.createSpace(workspaceId, spaceData);
      setSpaces((prev) => [...prev, newSpace]);
      return newSpace;
    } catch (err) {
      setError(err.message);
      console.error('❌ createSpace error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== UPDATE SPACE (Now using API) ==========
  const updateSpace = useCallback(async (workspaceId, spaceId, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await spacesApi.updateSpace(workspaceId, spaceId, updatedData);
      setSpaces((prev) =>
        prev.map((space) => (space.id === spaceId ? updated : space))
      );
    } catch (err) {
      setError(err.message);
      console.error('❌ updateSpace error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== DELETE SPACE (Now using API) ==========
  const deleteSpace = useCallback(async (workspaceId, spaceId) => {
    try {
      setLoading(true);
      setError(null);
      
      await spacesApi.deleteSpace(workspaceId, spaceId);
      
      // Update local state
      setSpaces((prev) => {
        const space = prev.find((s) => s.id === spaceId);
        if (space) {
          const deletedSpace = { ...space, status: "deleted" };
          setDeletedSpaces((prevDeleted) => [...prevDeleted, deletedSpace]);
        }
        return prev.filter((s) => s.id !== spaceId);
      });

      if (activeSpaceId === spaceId) {
        setActiveSpaceId(null);
        setActiveTab("Tasks");
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ deleteSpace error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeSpaceId]);

  // ... similar updates for other functions

  // Context value includes new loading/error states
  const value = {
    // State
    spaces,
    deletedSpaces,
    activeSpace,
    activeSpaceId,
    activeTab,
    loading,      // NEW
    error,        // NEW

    // Actions (all now async)
    getSpaces,
    getDeletedSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
    restoreSpace,
    moveSpace,
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes,

    // UI Actions
    selectSpace,
    setActiveTab: setActiveTabHandler,

    // Helpers
    searchSpaces,
    sortSpaces,
    getSpaceById,
  };

  return (
    <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>
  );
};
```

### Step 3: Update Components to Handle Async

Components need to handle the async nature of API calls:

#### Before (Sync):
```javascript
const handleCreateSpace = () => {
  createSpace(workspaceId, { name: "Test", description: "Test" });
};
```

#### After (Async):
```javascript
const handleCreateSpace = async () => {
  try {
    await createSpace(workspaceId, { name: "Test", description: "Test" });
    onClose(); // Close modal on success
  } catch (err) {
    setError(err.message); // Show error to user
  }
};
```

### Step 4: Add Loading States to UI

```javascript
export const CreateSpaceModal = ({ workspaceId, open, onClose }) => {
  const { createSpace, loading, error } = useSpaces();
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createSpace(workspaceId, formData);
      setFormData({ name: "", description: "" });
      onClose();
    } catch (err) {
      console.error('❌ Create failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...} />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Space'}
      </button>
    </form>
  );
};
```

---

## Migration Checklist

- [ ] **Phase 1: Preparation**
  - [ ] Review all API endpoints with backend team
  - [ ] Confirm request/response formats
  - [ ] Verify authentication/authorization
  - [ ] Test endpoints with Postman/Insomnia

- [ ] **Phase 2: API Layer (services/api.js)**
  - [ ] Add all space API functions
  - [ ] Add error handling
  - [ ] Test each endpoint in isolation
  - [ ] Document any special cases

- [ ] **Phase 3: Context Migration**
  - [ ] Update one function at a time (e.g., getSpaces)
  - [ ] Test thoroughly with backend
  - [ ] Move to next function
  - [ ] Keep mock data as fallback during development

- [ ] **Phase 4: Component Updates**
  - [ ] Add error/loading states
  - [ ] Update async handling
  - [ ] Add loading spinners/feedback
  - [ ] Test user workflows end-to-end

- [ ] **Phase 5: Testing & Cleanup**
  - [ ] Integration testing
  - [ ] Error scenario testing
  - [ ] Remove mock data when stable
  - [ ] Performance testing
  - [ ] Document any API quirks

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Backend should have proper CORS headers. Dev proxy is already configured in vite.config.js:

```javascript
// vite.config.js already has this for dev
proxy: {
  '/aigenda-api': {
    target: 'https://aigendaweb.runasp.net',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/aigenda-api/, ''),
  },
},
```

### Issue 2: 401 Unauthorized
**Solution:** Token is added automatically by axios interceptor in api.js. Ensure token is in localStorage:

```javascript
// Check in browser console:
localStorage.getItem('userToken')
```

### Issue 3: Stale Data
**Solution:** Invalidate cache after mutations:

```javascript
const createSpace = useCallback(async (workspaceId, spaceData) => {
  const newSpace = await spacesApi.createSpace(workspaceId, spaceData);
  // Refetch to ensure consistency
  await getSpaces(workspaceId);
  return newSpace;
}, [getSpaces]);
```

### Issue 4: Race Conditions
**Solution:** Add request cancellation or debouncing:

```javascript
import { useRef, useEffect } from 'react';

export const useCancelableAsync = () => {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return abortControllerRef;
};
```

---

## Testing Your API Integration

### Manual Testing Workflow
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform space operations
4. Verify correct endpoints are called
5. Check request/response payloads
6. Confirm status codes (200, 201, 204, etc.)

### Automated Testing
```javascript
describe('Spaces API Integration', () => {
  it('should fetch spaces from API', async () => {
    const { result } = renderHook(() => useSpaces());
    
    await act(async () => {
      await result.current.getSpaces('workspace-1');
    });

    expect(result.current.spaces.length).toBeGreaterThan(0);
  });

  it('should create space via API', async () => {
    const { result } = renderHook(() => useSpaces());
    
    await act(async () => {
      await result.current.createSpace('workspace-1', {
        name: 'Test',
        description: 'Test'
      });
    });

    expect(result.current.spaces).toContainEqual(
      expect.objectContaining({ name: 'Test' })
    );
  });
});
```

---

## Summary

1. **Current state:** Mock data in SpacesContext
2. **API layer:** Add functions to services/api.js
3. **Context update:** Replace mock with API calls
4. **Component updates:** Handle async/loading
5. **Testing:** Verify all workflows
6. **Cleanup:** Remove mock data when stable

**Key takeaway:** Components don't need to change much - only SpacesContext and services/api.js need updates!
