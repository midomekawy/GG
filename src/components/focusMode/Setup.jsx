import { BellOffIcon, BirdIcon, ChevronDown, ChevronUp, CoffeeIcon, icons, PenIcon, PlayIcon, SquareActivity, Trees, Waves, XIcon } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
import './focusstyles.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useSpaces } from '../../context/SpacesContext';
import { useTasks } from '../../context/TasksContext';
import { focusAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Setup = ({ setOpenFocusMode }) => {
    const navigate = useNavigate();
    const { activeWorkspaceId } = useWorkspace();
    const { activeSpaceId } = useSpaces();
    const { tasks } = useTasks();
    
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [activeBtn,setActiveBtn] = useState({
        break:false,
        blockNotifications:false,
    });
    const [openSoundbox, setOpenSoundbox] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    
    const sounds = [
        {name:'Rainforest',value:'rainforest',icon:<Trees/>},
        {name:'Ocean Waves',value:'ocean',icon:<Waves/>},
        {name:'White Noise',value:'noise',icon:<SquareActivity/>},
        {name:'Morning Birds',value:'birds',icon:<BirdIcon/>}
    ];
    const [selectedSound, setSelectedSound] = useState({name:'Rainforest',value:'rainforest',icon:<Trees/>});

    // Get active task (first incomplete task)
    const activeTask = tasks?.find(t => t.status !== 'done' && t.status !== 'completed');

    const handleStartFocus = async () => {
        if (!activeWorkspaceId || !activeSpaceId) {
            toast.error('Please select a workspace and space first');
            return;
        }
        
        if (!activeTask) {
            toast.error('No active task found. Please create a task first');
            return;
        }

        setIsStarting(true);
        
        const focusData = {
            durationMinutes: selectedDuration,
            ambientSound: selectedSound.value,
            breakAfter: activeBtn.break,
            blockNotifications: activeBtn.blockNotifications
        };

        let sessionId = 'focus-session-' + Date.now();

        // Try to call API, but always proceed locally if it fails
        try {
            const response = await focusAPI.startFocusSession(activeWorkspaceId, activeSpaceId, activeTask.id, focusData);
            console.log('Focus session started on server:', response.data);
            sessionId = response.data?.id || response.data?.sessionId || sessionId;
        } catch (error) {
            console.warn('Focus API not available, using local mode');
        }

        localStorage.setItem('focusSession', JSON.stringify({
            sessionId: sessionId,
            taskId: activeTask.id,
            taskTitle: activeTask.title,
            duration: selectedDuration,
            sound: selectedSound.value,
            startTime: new Date().toISOString()
        }));

        toast.success('Focus session started!');
        navigate('/infocusmode');
        setIsStarting(false);
    };

    return(
        <div className="overlay">
            <div className="create-focus">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                <div style={{display:'flex',alignItems:'flex-start',flexDirection:'column'}}>
                <h3 style={{marginBottom:'0'}}>Focus Mode Setup</h3>
                <p style={{marginTop:'2px',color:'#475569'}}>Customize your session to stay productive.</p>
                </div>
                <button onClick={()=>{setOpenFocusMode(false)}} style={{border:'none',backgroundColor:'transparent',color:'#475569',cursor:'pointer'}}><XIcon/></button>
                </div>
                <div className="active-task">
                    <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                    <div style={{width:'70px',height:'70px',borderRadius:'12px',background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <PlayIcon size={32} color="#7c3aed"/>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <h4 style={{marginBottom:'0',color:'#7c3aed'}}>ACTIVE TASK</h4>
                    <h3 style={{margin:'0'}}>{activeTask?.title || 'No active task'}</h3>
                    <p style={{marginTop:'0',color:'#475569'}}>{activeTask?.description || 'Select a task to focus on'}</p>   
                    </div>
                    </div>
                    <div style={{color:'#7c3aed',cursor:'pointer'}} onClick={() => navigate('/spaceoverview')}>
                        <PenIcon/>
                    </div>
                </div>
                <div className="duration">
                    <h4 style={{color:'#334155'}}>Focus Duration(minutes)</h4>
                  <div className='boxes'>
                    <div className={selectedDuration === 25?'box active': 'box'} onClick={()=>{setSelectedDuration(25)}}>25 min</div>
                    <div className={selectedDuration === 45?'box active': 'box'} onClick={()=>{setSelectedDuration(45)}}>45 min</div>
                    <div className={selectedDuration === 60?'box active': 'box'} onClick={()=>{setSelectedDuration(60)}}>60 min</div>
                    <div className={selectedDuration === 90?'box active': 'box'} onClick={()=>{setSelectedDuration(90)}}>90 min</div>
                  </div>
                </div>
                <div className="sound">
                    <h4 style={{color:'#475569',marginTop:'0'}}>Ambient Sound</h4>
                    <div className="custome-select" onClick={()=>{setOpenSoundbox(!openSoundbox)}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{color:'#7c3aed',marginTop:'5px'}}>{selectedSound.icon}</span>
                        <span style={{color:'#475569',fontWeight:'500'}}>{selectedSound.name}</span>
                        </div>
                        <span>{openSoundbox ? <ChevronUp/> : <ChevronDown/>}</span>
                    </div>
                    {openSoundbox && (
                    <ul className="sound-options">
                    {sounds.map((sound) => (
                    <li
                    key={sound.value}
                    onClick={() => {
                    setSelectedSound(sound);
                    setOpenSoundbox(false);}}>
                        <span style={{color:'#7c3aed',marginTop:'5px'}}>{sound.icon}</span>
                        <span style={{color:'#475569',fontWeight:'500'}}>{sound.name}</span>
                    </li>
                    ))}
                    </ul>
                    )}
                </div>
                <div className="choices">
                <div className='box'>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    <div style={{color:'#64748b'}}><CoffeeIcon/></div>
                    <div style={{display:'flex',alignItems:'flex-start',flexDirection:'column'}}>
                    <h3 style={{marginBottom:'0'}}>Optional break after session</h3>
                    <p style={{marginTop:'0',color:'#64748b'}}>Automatic 5-minute breather</p>
                    </div>
                    </div>
                    <div className={activeBtn.break ? "toggle-switch active" : "toggle-switch"} onClick={() => setActiveBtn(prev => ({ ...prev, break: !prev.break }))}></div>
                </div>
                <div className='box'>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    <div style={{color:'#64748b'}}><BellOffIcon/></div>
                    <div style={{display:'flex',alignItems:'flex-start',flexDirection:'column'}}>
                    <h3 style={{marginBottom:'0'}}>Block notifications</h3>
                    <p style={{marginTop:'0',color:'#64748b'}}>Silent mode for all desktop apps</p>
                    </div>
                    </div>
                    <div className={activeBtn.blockNotifications ? "toggle-switch active" : "toggle-switch"} onClick={() => setActiveBtn(prev => ({ ...prev, blockNotifications: !prev.blockNotifications }))}></div>
                </div>
                </div>
                <button 
                    className='setup-btn' 
                    onClick={handleStartFocus}
                    disabled={isStarting}
                    style={{width:'100%', opacity: isStarting ? 0.7 : 1, cursor: isStarting ? 'not-allowed' : 'pointer'}}
                >
                    <span style={{marginTop:'3px'}}><PlayIcon size={20}/></span>
                    {isStarting ? 'Starting...' : 'Start Focus Session'}
                </button>
            </div>
        </div>
    );
};
export default Setup;