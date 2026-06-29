import { Clock, TimerIcon, Trophy } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
import './focusstyles.css';
import { Link } from 'react-router-dom';
const PauseFocus = ({setOpenPauseFocus, onResumeFocus})=>{
    return(
        <div className="overlay">
           <div className="create-container focus-setup-container">
             <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'500',backgroundColor:'#f5e8fe',width:'60px',height:'60px',borderRadius:'50%',color:'#7c3aed'}}><TimerIcon size={35}/></div>
             <h2 style={{marginBottom:'0'}}>You are currently in a focus session</h2>
             <p style={{color:'#3b3b3b',marginTop:'0'}}>Taking a break? Your session is more than halfway complete. Staying focused now will help you reach your daily goal.</p>
             <div className="session-progress">
                <div style={{width:'100%',display:'flex',justifyContent:'space-between'}}>
                    <span style={{color:'#3b3b3b'}}>Session Progress</span>
                    <span style={{color:'var(--dark-purple)',fontWeight:'500'}}>60%</span>
                </div>
              <div className="progress-bar-bg" style={{backgroundColor:'#efe7f9',marginBottom:'0'}}>
              <div className="progress-bar-fill" style={{ width: '60%',backgroundColor:'#5b10bd' }}></div>
              </div>
              <div className="remaining-time">
                <span style={{marginTop:'3px'}}><Clock size={18}/></span>
                <span>08:45</span>
                <span>remainig</span>
              </div>
             </div>
             <button onClick={()=>{onResumeFocus ? onResumeFocus() : setOpenPauseFocus(false)}} style={{margin:'10px',width:'100%',height:'50px',backgroundColor:'var(--dark-purple)',color:'white',border:'none',borderRadius:'20px',fontWeight:'500',fontSize:'17px',cursor:'pointer'}}>Continue Focus</button>
             <Link to={'/focuscompletion'}> 
             <button style={{border:'none',backgroundColor:'transparent',width:'100%',cursor:'pointer',color:'#3b3b3b',fontWeight:'500',fontSize:'17px',margin:'10px'}}>Leave Session</button>
             </Link>   
             <div className="goal">
                <span style={{marginTop:'7px',color:'var(--dark-purple)'}}><Trophy size={18}/></span>
                <p style={{color:'#64748b'}}>DAILY GOAL: 4 FOCUS HOURS</p>
             </div>
             </div>
           </div>
    );
};
export default PauseFocus;