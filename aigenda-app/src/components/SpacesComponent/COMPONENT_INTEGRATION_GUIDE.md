# Spaces Feature - Component Integration Guide

This guide shows how to properly integrate the Spaces Context in your React components with best practices, error handling, and common patterns.

---

## Table of Contents
1. [Basic Setup](#basic-setup)
2. [Common Patterns](#common-patterns)
3. [Error Handling](#error-handling)
4. [Performance Best Practices](#performance-best-practices)
5. [Advanced Usage](#advanced-usage)
6. [Testing](#testing)

---

## Basic Setup

### Step 1: Ensure Provider is Wrapping Your App
Verify in `App.jsx`:

```jsx
import { SpacesProvider } from './context/SpacesContext';

function App() {
  return (
    <UserProvider>
      <WorkspaceProvider>
        <SpacesProvider>
          {/* All components here can access useSpaces() */}
          <Routes>
            {/* Routes */}
          </Routes>
        </SpacesProvider>
      </WorkspaceProvider>
    </UserProvider>
  );
}
```

### Step 2: Import Hook in Component
```jsx
import { useSpaces } from '../../context/SpacesContext';
```

### Step 3: Destructure What You Need
```jsx
const { getSpaces, selectSpace, activeSpaceId } = useSpaces();
```

---

## Common Patterns

### Pattern 1: Display Space List in Sidebar
```jsx
import { useSpaces } from '../../context/SpacesContext';

export const SpaceList = ({ workspaceId }) => {
  const { getSpaces, selectSpace, activeSpaceId } = useSpaces();
  
  // Get all active spaces for this workspace
  const spaces = getSpaces(workspaceId);

  return (
    <ul className="space-list">
      {spaces.map(space => (
        <li
          key={space.id}
          className={`space-item ${activeSpaceId === space.id ? 'active' : ''}`}
          onClick={() => selectSpace(space.id)}
        >
          {space.name}
        </li>
      ))}
    </ul>
  );
};
```

### Pattern 2: Create New Space with Form
```jsx
import { useState } from 'react';
import { useSpaces } from '../../context/SpacesContext';

export const CreateSpaceForm = ({ workspaceId, onSuccess }) => {
  const { createSpace } = useSpaces();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Space name is required');
      return;
    }

    // Create space
    const newSpace = createSpace(workspaceId, formData);
    console.log('✅ Space created:', newSpace);

    // Reset form and notify parent
    setFormData({ name: '', description: '' });
    onSuccess?.(newSpace);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Space name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <button type="submit">Create Space</button>
    </form>
  );
};
```

### Pattern 3: Display Space Details + Tabs
```jsx
import { useSpaces } from '../../context/SpacesContext';

export const SpaceDetails = () => {
  const {
    activeSpace,
    activeTab,
    setActiveTab,
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes
  } = useSpaces();

  // Get space-specific data
  const analytics = getSpaceAnalytics(activeSpace?.id);
  const tasks = getSpaceTasks(activeSpace?.id);
  const notes = getSpaceNotes(activeSpace?.id);

  if (!activeSpace) {
    return <div>Select a space from the sidebar</div>;
  }

  return (
    <div className="space-details">
      <h1>{activeSpace.name}</h1>
      <p>{activeSpace.description}</p>

      {/* Tab Navigation */}
      <div className="tabs">
        {['Tasks', 'Notes', 'Analytics'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'Tasks' && <TasksList tasks={tasks} />}
        {activeTab === 'Notes' && <NotesList notes={notes} />}
        {activeTab === 'Analytics' && <AnalyticsView analytics={analytics} />}
      </div>
    </div>
  );
};
```

### Pattern 4: Edit Space
```jsx
import { useSpaces } from '../../context/SpacesContext';

export const EditSpaceModal = ({ spaceId, onClose }) => {
  const { getSpaceById, updateSpace } = useSpaces();
  const space = getSpaceById(spaceId);
  const [name, setName] = useState(space?.name || '');
  const [description, setDescription] = useState(space?.description || '');

  const handleSave = () => {
    updateSpace(spaceId, { name, description });
    console.log('✅ Space updated:', spaceId);
    onClose();
  };

  return (
    <modal>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <button onClick={handleSave}>Save Changes</button>
    </modal>
  );
};
```

### Pattern 5: Delete Space with Confirmation
```jsx
import { useSpaces } from '../../context/SpacesContext';

export const DeleteSpaceButton = ({ spaceId, spaceName }) => {
  const { deleteSpace } = useSpaces();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${spaceName}"? This can be restored from trash.`
    );

    if (confirmed) {
      deleteSpace(spaceId);
      console.log('✅ Space deleted:', spaceId);
    }
  };

  return (
    <button onClick={handleDelete} className="delete-btn">
      🗑️ Delete
    </button>
  );
};
```

### Pattern 6: Reorder Spaces
```jsx
import { useSpaces } from '../../context/SpacesContext';

export const SpaceOrderMenu = ({ spaceId }) => {
  const { moveSpace } = useSpaces();

  const handleMove = (direction) => {
    moveSpace(spaceId, direction);
    console.log(`✅ Space moved ${direction}`);
  };

  return (
    <div className="order-menu">
      <button onClick={() => handleMove('up')}>⬆️ Move Up</button>
      <button onClick={() => handleMove('down')}>⬇️ Move Down</button>
    </div>
  );
};
```

### Pattern 7: Search Spaces
```jsx
import { useState } from 'react';
import { useSpaces } from '../../context/SpacesContext';

export const SearchSpaces = ({ workspaceId }) => {
  const { searchSpaces } = useSpaces();
  const [query, setQuery] = useState('');

  const results = searchSpaces(workspaceId, query);

  return (
    <div>
      <input
        type="search"
        placeholder="Search spaces..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results.map(space => (
          <li key={space.id}>{space.name}</li>
        ))}
      </ul>
      {results.length === 0 && query && <p>No spaces found</p>}
    </div>
  );
};
```

### Pattern 8: Sort Spaces
```jsx
import { useState } from 'react';
import { useSpaces } from '../../context/SpacesContext';

export const SortSpaces = ({ workspaceId }) => {
  const { sortSpaces } = useSpaces();
  const [sortBy, setSortBy] = useState('createdAt');

  const spaces = sortSpaces(workspaceId, sortBy);

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="createdAt">Newest First</option>
        <option value="name">Name (A-Z)</option>
      </select>
      <ul>
        {spaces.map(space => (
          <li key={space.id}>{space.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Error Handling

### Handling Invalid Space ID
```jsx
export const SafeSpaceDetails = ({ spaceId, workspaceId }) => {
  const { getSpaceById, getSpaces } = useSpaces();
  const space = getSpaceById(spaceId);

  if (!space) {
    return (
      <div className="error">
        <p>❌ Space not found</p>
        <p>Available spaces:</p>
        <SpaceList workspaceId={workspaceId} />
      </div>
    );
  }

  return <SpaceDetails space={space} />;
};
```

### Handling Empty State
```jsx
export const SpaceListWithEmptyState = ({ workspaceId }) => {
  const { getSpaces } = useSpaces();
  const spaces = getSpaces(workspaceId);

  if (spaces.length === 0) {
    return (
      <div className="empty-state">
        <p>📁 No spaces yet</p>
        <p>Create your first space to get started</p>
        <CreateSpaceModal workspaceId={workspaceId} />
      </div>
    );
  }

  return <SpaceList spaces={spaces} />;
};
```

### Try-Catch Pattern (for future API integration)
```jsx
export const CreateSpaceWithError = ({ workspaceId }) => {
  const { createSpace } = useSpaces();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (spaceData) => {
    try {
      setError(null);
      setLoading(true);
      
      const newSpace = createSpace(workspaceId, spaceData);
      // For API: await createSpace(workspaceId, spaceData);
      
      console.log('✅ Space created:', newSpace);
    } catch (err) {
      setError(err.message || 'Failed to create space');
      console.error('❌ Create space error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreate({ name: 'Test', description: 'Test' });
      }}>
        <button disabled={loading}>
          {loading ? 'Creating...' : 'Create Space'}
        </button>
      </form>
    </div>
  );
};
```

---

## Performance Best Practices

### Use useMemo for Filtered Lists
```jsx
import { useMemo } from 'react';
import { useSpaces } from '../../context/SpacesContext';

export const OptimizedSpaceList = ({ workspaceId, filter }) => {
  const { getSpaces } = useSpaces();

  // Only recompute when workspaceId or filter changes
  const filteredSpaces = useMemo(() => {
    const spaces = getSpaces(workspaceId);
    if (!filter) return spaces;
    return spaces.filter(space => 
      space.status === filter
    );
  }, [workspaceId, filter, getSpaces]);

  return (
    <ul>
      {filteredSpaces.map(space => (
        <li key={space.id}>{space.name}</li>
      ))}
    </ul>
  );
};
```

### Use useCallback for Event Handlers
```jsx
import { useCallback } from 'react';
import { useSpaces } from '../../context/SpacesContext';

export const OptimizedSpaceItem = ({ space }) => {
  const { selectSpace, deleteSpace } = useSpaces();

  // These functions maintain referential equality
  const handleSelect = useCallback(() => {
    selectSpace(space.id);
  }, [space.id, selectSpace]);

  const handleDelete = useCallback(() => {
    deleteSpace(space.id);
  }, [space.id, deleteSpace]);

  return (
    <div>
      <button onClick={handleSelect}>Select</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};
```

---

## Advanced Usage

### Custom Hook for Space Operations
```jsx
import { useCallback } from 'react';
import { useSpaces } from '../../context/SpacesContext';

// Custom hook to encapsulate space operations
export const useSpaceOperations = (spaceId) => {
  const {
    getSpaceById,
    updateSpace,
    deleteSpace,
    getSpaceAnalytics,
    getSpaceTasks,
    getSpaceNotes
  } = useSpaces();

  const space = getSpaceById(spaceId);
  const analytics = getSpaceAnalytics(spaceId);
  const tasks = getSpaceTasks(spaceId);
  const notes = getSpaceNotes(spaceId);

  const rename = useCallback((newName) => {
    if (!newName.trim()) {
      console.error('Space name cannot be empty');
      return false;
    }
    updateSpace(spaceId, { name: newName });
    return true;
  }, [spaceId, updateSpace]);

  const remove = useCallback(() => {
    deleteSpace(spaceId);
  }, [spaceId, deleteSpace]);

  const getStats = useCallback(() => {
    return {
      taskCount: tasks.length,
      noteCount: notes.length,
      productivity: analytics.productivityScore
    };
  }, [tasks, notes, analytics]);

  return {
    space,
    analytics,
    tasks,
    notes,
    rename,
    remove,
    getStats
  };
};

// Usage:
export const SpaceDashboard = ({ spaceId }) => {
  const { space, analytics, tasks, notes, rename, remove, getStats } = useSpaceOperations(spaceId);
  const stats = getStats();

  return (
    <div>
      <h2>{space.name}</h2>
      <p>Tasks: {stats.taskCount} | Notes: {stats.noteCount}</p>
      <button onClick={() => rename('New Name')}>Rename</button>
      <button onClick={remove}>Delete</button>
    </div>
  );
};
```

### Batch Operations
```jsx
export const BatchDeleteSpaces = ({ spaceIds, workspaceId }) => {
  const { deleteSpace } = useSpaces();

  const handleDeleteAll = () => {
    const confirmed = window.confirm(
      `Delete ${spaceIds.length} spaces? This cannot be undone immediately.`
    );

    if (confirmed) {
      spaceIds.forEach(id => {
        deleteSpace(id);
      });
      console.log(`✅ Deleted ${spaceIds.length} spaces`);
    }
  };

  return (
    <button onClick={handleDeleteAll} className="danger">
      🗑️ Delete Selected ({spaceIds.length})
    </button>
  );
};
```

---

## Testing

### Unit Test Example (Jest + React Testing Library)
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SpacesProvider } from '../context/SpacesContext';
import { SpaceList } from './SpaceList';

describe('SpaceList', () => {
  it('should render list of spaces', () => {
    render(
      <SpacesProvider>
        <SpaceList workspaceId="workspace-1" />
      </SpacesProvider>
    );

    expect(screen.getByText('Product Design')).toBeInTheDocument();
    expect(screen.getByText('User Research')).toBeInTheDocument();
  });

  it('should select space on click', () => {
    render(
      <SpacesProvider>
        <SpaceList workspaceId="workspace-1" />
      </SpacesProvider>
    );

    const spaceItem = screen.getByText('Product Design').closest('.space-item');
    fireEvent.click(spaceItem);

    expect(spaceItem).toHaveClass('active');
  });
});
```

### Integration Test Example
```jsx
describe('Space Operations', () => {
  it('should create, select, and delete a space', () => {
    const { getByText, queryByText } = render(
      <SpacesProvider>
        <SpaceApp workspaceId="workspace-1" />
      </SpacesProvider>
    );

    // Create
    fireEvent.click(getByText('Create Space'));
    fireEvent.change(screen.getByPlaceholderText('Space name'), {
      target: { value: 'Test Space' }
    });
    fireEvent.click(getByText('Submit'));

    expect(getByText('Test Space')).toBeInTheDocument();

    // Select
    fireEvent.click(getByText('Test Space'));
    expect(getByText('Test Space').parentElement).toHaveClass('active');

    // Delete
    fireEvent.click(getByText('Delete'));
    fireEvent.click(getByText('Confirm'));

    expect(queryByText('Test Space')).not.toBeInTheDocument();
  });
});
```

---

## Checklist for Implementation

- [ ] `SpacesProvider` wraps entire app in `App.jsx`
- [ ] Components import `useSpaces` hook
- [ ] Destructure only needed functions (tree-shaking)
- [ ] Use proper error boundaries
- [ ] Handle empty/loading states
- [ ] Use useCallback for expensive operations
- [ ] Add console logging (already built-in)
- [ ] Test with mock data first
- [ ] Plan API integration
- [ ] Add error handling layer
- [ ] Implement loading states
- [ ] Add offline support (optional)

---

## Summary

The Spaces feature uses React Context API with mock data that perfectly mirrors your backend API. This guide shows common patterns and best practices for integrating it into your components. When you're ready to use real API calls, simply replace the state update logic with API calls while keeping the same component interfaces.
