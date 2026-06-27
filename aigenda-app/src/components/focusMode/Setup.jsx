import { BellOffIcon, BirdIcon, ChevronDown, ChevronUp, CoffeeIcon, icons, PenIcon, PlayIcon, SquareActivity, Trees, Waves, XIcon } from 'lucide-react';
import '../workSpaceStyle.css';
import './focusstyles.css';
import { useState } from 'react';
import FocusImg from '../../../assets/images/focusmodesetup.png';
import { Link } from 'react-router-dom';
const Setup = ({ setOpenFocusMode }) => {
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [activeBtn,setActiveBtn] = useState({
        break:false,
        blockNotifications:false,
    });
    const [openSoundbox, setOpenSoundbox] = useState(false);
    const sounds = [
        {name:'Rainforest',value:'rainforest',icon:<Trees/>},
        {name:'Ocean Waves',value:'ocean',icon:<Waves/>},
        {name:'White Noise',value:'noise',icon:<SquareActivity/>},
        {name:'Morning Birds',value:'birds',icon:<BirdIcon/>}
    ];
    const [selectedSound, setSelectedSound] = useState({name:'Rainforest',value:'rainforest',icon:<Trees/>});
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
                    <img src={FocusImg} alt="focus mode" style={{width:'70px'}}/>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <h4 style={{marginBottom:'0',color:'#7c3aed'}}>ACTIVE TASK</h4>
                    <h3 style={{margin:'0'}}>Q4 Brand Refresh Strategy</h3>
                    <p style={{marginTop:'0',color:'#475569'}}>Marketing & Design team</p>   
                    </div>
                    </div>
                    <div style={{color:'#7c3aed',cursor:'pointer'}}>
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
                <Link style={{width:'100%'}} to={'/infocusmode'}>
                <button className='setup-btn'><span style={{marginTop:'3px'}}><PlayIcon size={20}/></span>Start Focus Session</button>
                </Link>
            </div>
        </div>
    );
};
export default Setup;