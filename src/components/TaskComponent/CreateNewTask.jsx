import { Plus } from 'lucide-react';
import { useState } from 'react';
import '../WorkspacesComponent/workSpaceStyle.css';
import { useTasks } from '../../context/TasksContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useSpaces } from '../../context/SpacesContext';

function getTomorrowDateInputValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const CreateNewTask = ({openCreateTask, setOpenCreateTask})=>{
    const { createTask } = useTasks();
    const { activeWorkspaceId } = useWorkspace();
    const { activeSpaceId, spaces } = useSpaces();
    const minDueDate = getTomorrowDateInputValue();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        priority: 1,
        assigneeEmail: '',
        subtasks: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        if (formData.dueDate && formData.dueDate < minDueDate) {
            alert('Due date must be after today. Please choose a future date.');
            return;
        }

        // Get workspace ID with fallback
        const workspaceId = activeWorkspaceId || 1;

        // Get space ID with fallback to first available space
        let spaceId = activeSpaceId;
        if (!spaceId && spaces && spaces.length > 0) {
            spaceId = spaces[0].id;
        }

        if (!spaceId) {
            alert('Cannot create task: No space available. Please create a space first.');
            return;
        }

        console.log('Creating task with IDs:', { workspaceId, spaceId });

        try {
            await createTask(workspaceId, spaceId, {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                dueDate: formData.dueDate || null,
                priority: formData.priority,
                assigneeEmail: formData.assigneeEmail || null,
                subtasks: formData.subtasks.filter(text => text.trim() !== '')
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                dueDate: '',
                priority: 1,
                assigneeEmail: '',
                subtasks: []
            });

            // Close modal
            setOpenCreateTask(false);
        } catch (error) {
            console.error('Error creating task:', error);
            const message = error?.message || error?.response?.data?.message || error?.response?.data?.title || 'Failed to create task';
            alert(message);
        }
    };

    const handleCancel = () => {
        setFormData({
            title: '',
            description: '',
            status: 'todo',
            dueDate: '',
            priority: 1,
            assigneeEmail: '',
            subtasks: []
        });
        setOpenCreateTask(false);
    };

    const addSubtask = () => {
        setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, ''] }));
    };

    const updateSubtask = (index, value) => {
        const next = [...formData.subtasks];
        next[index] = value;
        setFormData(prev => ({ ...prev, subtasks: next }));
    };

    const removeSubtask = (index) => {
        const next = formData.subtasks.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, subtasks: next }));
    };

    if (!openCreateTask) return null;

    return(
        <div className="overlay">
            <div className="create-container taskPage">
                <h2 style={{ color: "#5900ca" }}>Create New Task</h2>
                <div className="form-box">
                    <form onSubmit={handleSubmit}>
                        <div className="text">
                            <label>Task title</label>
                            <input
                                placeholder='ex.Homework.'
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                            <label>Description</label>
                            <textarea
                                placeholder='add more details about the task...'
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="selected-info">
                            <div>
                                <div className="box">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="todo">Todo</option>
                                        <option value="on-progress">On progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div className="box">
                                    <label>Due date</label>
                                    <input
                                        type='date'
                                        placeholder='DD/MM/YYYY'
                                        value={formData.dueDate}
                                        min={minDueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='box'>
                                    <label>Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                        style={{width:'200px',padding:'10px',borderRadius:'15px',backgroundColor:'#eff0f2'}}
                                    >
                                        <option value={2}>High</option>
                                        <option value={1}>Medium</option>
                                        <option value={0}>Low</option>
                                    </select>
                                </div>
                                <div className="box">
                                    <label>Assignee</label>
                                    <input
                                        type='email'
                                        placeholder='Enter email'
                                        value={formData.assigneeEmail}
                                        onChange={(e) => setFormData({...formData, assigneeEmail: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="subtasks">
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',marginBottom:'15px'}}>
                                <label>Subtasks</label>
                                <div
                                    onClick={addSubtask}
                                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',color:'#8f52da',cursor:'pointer'}}
                                >
                                    <span style={{fontWeight:'500'}}><Plus size={13}/></span>
                                    <span>Add subtask</span>
                                </div>
                            </div>
                            {formData.subtasks.map((text, index) => (
                                <div key={index} style={{display:'flex',alignItems:'center',gap:'10px',width:'100%',marginBottom:'15px'}}>
                                    <input
                                        placeholder='Enter subtask title'
                                        value={text}
                                        onChange={(e) => updateSubtask(index, e.target.value)}
                                        style={{flex:1}}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(index)}
                                        style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:'18px',padding:'0 4px'}}
                                        aria-label="Remove subtask"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="buttons">
                            <button type='button' onClick={handleCancel}>Cancel</button>
                            <button type='submit' style={{backgroundColor:'#5a0fbd',color:'white'}}>Create task</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};
export default CreateNewTask;