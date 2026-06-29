import { BellRing, Check, Music2Icon, MusicIcon, Pause, Volume2, VolumeX, XIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import './focusstyles.css';
import { tooltipClasses } from "@mui/material/Tooltip";
import PauseFocus from "./PauseFocus";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";
import { useTasks } from "../../context/TasksContext";
import { focusAPI } from "../../services/api";
import toast from "react-hot-toast";
import useAmbientSound from "./AmbientSound";

const InFocusMode = ()=>{
    const navigate = useNavigate();
    const { activeWorkspaceId } = useWorkspace();
    const { activeSpaceId } = useSpaces();
    const { tasks, updateTask } = useTasks();
    
    const [openPauseFocus, setOpenPauseFocus] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isPaused, setIsPaused] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [soundLabel, setSoundLabel] = useState('');
    const { play, stop } = useAmbientSound();
    
    // Load session data from localStorage
    useEffect(() => {
        const savedSession = localStorage.getItem('focusSession');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            setSessionData(session);
            setTimeLeft(session.duration * 60);
            const soundName = session.sound || 'rainforest';
            setSoundLabel(soundName);
            if (soundEnabled && !isPaused) {
                play(soundName);
            }
        }
    }, []);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get task from context
    const task = tasks?.find(t => t.id === sessionData?.taskId);

    const [subtasks, setSubtasks] = useState(task?.subtasks || [
        { id: 1, text: 'Audit current assets', completed: true },
        { id: 2, text: 'Draft color palette', completed: false },
        { id: 3, text: 'Review with design lead', completed: false },
    ]);

    const handleEndFocus = useCallback(async () => {
        try {
            if (sessionData?.sessionId && activeWorkspaceId && activeSpaceId) {
                await focusAPI.completeFocusSession(
                    activeWorkspaceId,
                    activeSpaceId,
                    sessionData.taskId,
                    sessionData.sessionId
                );
            }
        } catch (error) {
            console.warn('Complete focus API not available, completing locally');
        }
        
        // Save completed session data for summary before clearing
        localStorage.setItem('completedFocusSession', JSON.stringify({
            ...sessionData,
            completedAt: new Date().toISOString(),
            completedSubtasks: subtasks.filter(s => s.completed).length,
            totalSubtasks: subtasks.length,
            interruptions: 0
        }));
        
        localStorage.removeItem('focusSession');
        toast.success('Focus session completed!');
        navigate('/focuscompletion');
    }, [sessionData, activeWorkspaceId, activeSpaceId, navigate, subtasks]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (!isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleEndFocus();
        }
        return () => clearInterval(interval);
    }, [isPaused, timeLeft, handleEndFocus]);

    // Pause/resume ambient sound when focus is paused or resumed
    useEffect(() => {
        if (!sessionData?.sound || soundLabel !== sessionData.sound) return;
        if (isPaused || !soundEnabled) {
            stop();
        } else {
            play(sessionData.sound);
        }
    }, [isPaused, soundEnabled, sessionData, soundLabel, play, stop]);

    const toggleSound = () => {
        setSoundEnabled(prev => !prev);
    };

    const handlePauseFocus = async () => {
        setIsPaused(true);
        setOpenPauseFocus(true);
        
        try {
            if (sessionData?.sessionId && activeWorkspaceId && activeSpaceId) {
                await focusAPI.pauseFocusSession(
                    activeWorkspaceId,
                    activeSpaceId,
                    sessionData.taskId,
                    sessionData.sessionId
                );
            }
        } catch (error) {
            console.warn('Pause focus API not available, pausing locally');
        }
    };

    const handleResumeFocus = async () => {
        setIsPaused(false);
        setOpenPauseFocus(false);
        
        try {
            if (sessionData?.sessionId && activeWorkspaceId && activeSpaceId) {
                await focusAPI.resumeFocusSession(
                    activeWorkspaceId,
                    activeSpaceId,
                    sessionData.taskId,
                    sessionData.sessionId
                );
            }
        } catch (error) {
            console.warn('Resume focus API not available, resuming locally');
        }
    };

    const handleExitFocus = async () => {
        if (confirm('Are you sure you want to exit focus mode?')) {
            await handleEndFocus();
        }
    };

    const toggelTask = (taskId) =>{
        setSubtasks(prevSubTasks =>
        prevSubTasks.map(task=> task.id === taskId ? {...task, completed: !task.completed} : task))
    };
    return(
        <div className="in-focus-mode-container">
            <p style={{fontSize:'100px',margin:'0'}}>{formatTime(timeLeft)}</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontWeight:'500',margin:'0'}}>
                <span style={{marginTop:'6px',color:'#af8ddc'}}><BellRing size={20}/></span>
                <p style={{letterSpacing:'1px',color:'#af8ddc'}}>{isPaused ? 'FOCUS SESSION PAUSED' : 'FOCUS SESSION ACTIVE'}</p>
            </div>
            <div className="content-box">
                <h2 style={{marginBottom:'0'}}>{task?.title || sessionData?.taskTitle || 'Focus Session'}</h2>
                <p style={{marginTop:'0',color:'#6b7a91'}}>{task?.description || 'Stay focused and complete your task.'}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',margin:'0'}}>
                <p style={{color:'#333'}}>Progress</p>
                <p style={{color:'#5b10bd'}}>{subtasks.filter(s => s.completed).length} of {subtasks.length} subtasks</p>
                </div>
                <div className="progress-bar-bg" style={{backgroundColor:'#efe7f9'}}>
              <div className="progress-bar-fill" style={{ width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%`,backgroundColor:'#5b10bd' }}></div>
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
                <button onClick={handlePauseFocus} style={{backgroundColor:'#5b10bd',color:'white'}}><span><Pause size={18}/></span>Pause Focus</button>
                <button onClick={handleExitFocus} style={{backgroundColor:'white',color:'#566375',border:'1px solid #aaaa'}}><span><XIcon size={18}/></span> Exit Focus</button>
            </div>
            <div
                className="music"
                style={{position:'absolute',right:'100px',bottom:'10px',color:'#566375',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}
                onClick={toggleSound}
                title={soundEnabled ? 'Mute ambient sound' : 'Play ambient sound'}
            >
                <span>{soundEnabled ? <Volume2 size={30}/> : <VolumeX size={30}/>}</span>
                <span style={{fontSize:'14px',textTransform:'capitalize'}}>{soundEnabled ? soundLabel : 'Muted'}</span>
            </div>
            {openPauseFocus && <PauseFocus setOpenPauseFocus={setOpenPauseFocus} onResumeFocus={handleResumeFocus} />}
        </div>
    )
};
export default InFocusMode;