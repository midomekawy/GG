import { Plus } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
const UpdateTask = ({UpdateTask, setUpdateTask})=>{
    return(
          <div className="overlay">
            <div className="create-container taskPage">
                <h2 style={{ color: "#5900ca" }}>Update Task</h2>
                <div className="form-box">
                    <form>
                        <div className="text">
                            <label>Task title</label>
                            <input defaultValue={'Making cake'} style={{fontSize:'20px'}}/>
                            <label>Description</label>
                            <textarea defaultValue={'this is an example in update system please try to focus .this is an example in update system please try to focus. '}/>
                        </div>
                        <div className="selected-info">
                            <div>
                                <div className="box">
                                    <label>Status</label>
                                    <select>
                                        <option>Todo</option>
                                        <option>In progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                                <div className="box">
                                    <label>Due date</label>
                                    <input type='date' placeholder='12/09/2033'/>
                                </div>
                            </div>
                            <div>
                                <div className='box'>
                                    <label>Priority</label>
                                    <div style={{width:'200px',height:'40px',padding:'20px',borderRadius:'15px',backgroundColor:'#eff0f2',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                        <span>High</span>
                                        <span>Medium</span>
                                        <span>Low</span>
                                    </div>
                                </div>
                                <div className="box">
                                    <label>Assignee</label>
                                    <select>
                                        <option></option>
                                        <option></option>
                                        <option></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="subtasks">
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',marginBottom:'15px'}}>
                                <label>Subtasks</label>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',color:'#8f52da'}}>
                                    <span style={{cursor:'pointer',fontWeight:'500'}}><Plus size={13}/></span>
                                    <span>Add subtask</span>
                                </div>
                            </div>
                            <input/>
                            <input/>
                        </div>
                        <div className="buttons">
                            <button type='button' onClick={()=>setUpdateTask(false)}>Cancel</button>
                            <button type='submit' style={{backgroundColor:'#5a0fbd',color:'white'}}>Create task</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};
export default UpdateTask;