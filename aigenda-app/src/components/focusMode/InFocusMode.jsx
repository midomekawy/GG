import { BellRing, Check, Music2Icon, Pause, XIcon } from "lucide-react";
import { useState } from "react";
import './focusstyles.css';
import { tooltipClasses } from "@mui/material/Tooltip";
import PauseFocus from "./PauseFocus";
import { Link } from "react-router-dom";
const InFocusMode = ()=>{
    const [openPauseFocus, setOpenPauseFocus] = useState(false);
    const [subtasks, setSubtasks] = useState([
  { id: 1, text: 'Audit current assets', completed: true },
  { id: 2, text: 'Draft color palette', completed: false },
  { id: 3, text: 'Review with design lead', completed: false },
]);
const toggelTask = (taskId) =>{
    setSubtasks(prevSubTasks =>
    prevSubTasks.map(task=> task.id === taskId ? {...task, completed: !task.completed} : task))
};
    return(
        <div className="in-focus-mode-container">
            <p style={{fontSize:'100px',margin:'0'}}>25:00</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontWeight:'500',margin:'0'}}>
                <span style={{marginTop:'6px',color:'#af8ddc'}}><BellRing size={20}/></span>
                <p style={{letterSpacing:'1px',color:'#af8ddc'}}>FOCUS SESSION ACTIVE</p>
            </div>
            <div className="content-box">
                <h2 style={{marginBottom:'0'}}>Q4 Brand Refresh Strategy</h2>
                <p style={{marginTop:'0',color:'#6b7a91'}}>Deep work on visual identity and assets audit.</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',margin:'0'}}>
                <p style={{color:'#333'}}>Progress</p>
                <p style={{color:'#5b10bd'}}>1 of 3 subtasks</p>
                </div>
                <div className="progress-bar-bg" style={{backgroundColor:'#efe7f9'}}>
              <div className="progress-bar-fill" style={{ width: '33%',backgroundColor:'#5b10bd' }}></div>
            </div>
                <div className="subtasks">
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',width:'100%'}}>
                    {subtasks.map(task=>(
                        <div key={task.id} className={task.completed ? 'subtask-box completed':'subtask-box'} onClick={()=>{toggelTask(task.id)}}>
                            <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                             {task.completed && <span>✓</span>}
                             </div>
                            <span className="task-text">{task.text}</span>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button onClick={()=>{setOpenPauseFocus(true)}} style={{backgroundColor:'#5b10bd',color:'white'}}><span><Pause size={18}/></span>Pause Focus</button>
                <Link to={'/spaceoverview'}>
                <button style={{backgroundColor:'white',color:'#566375',border:'1px solid #aaaa'}}><span><XIcon size={18}/></span> Exit Focus</button>
                </Link>
            </div>
            <div className="music" style={{position:'absolute',right:'100px',bottom:'10px',color:'#566375',cursor:'pointer'}}><span><Music2Icon size={30}/></span></div>
            {openPauseFocus && <PauseFocus setOpenPauseFocus={setOpenPauseFocus}/>}
        </div>
    )
};
export default InFocusMode;