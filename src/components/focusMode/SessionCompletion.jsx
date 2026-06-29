import { AwardIcon, Brain, Clock, CoffeeIcon, CornerRightUp, Grid2X2, MinusCircle, PartyPopper, Play, Vault } from 'lucide-react';
import './focusstyles.css';
import { Link } from 'react-router-dom';

const SessionCompletion = ()=>{
    const sessionData = JSON.parse(localStorage.getItem('completedFocusSession') || '{}');
    const duration = sessionData?.duration || 25;
    const completedSubtasks = sessionData?.completedSubtasks || 0;
    const totalSubtasks = sessionData?.totalSubtasks || 1;
    const interruptions = sessionData?.interruptions || 0;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const productivityScore = Math.min(100, Math.round((progressPercent * 0.8) + ((100 - interruptions * 10) * 0.2)));
    
    const FocusInfo = [
        {id:1 ,label:'Focus Duration',icon:<Clock size={16}/>,value:`${duration} Minutes`,state:'',color:'transparent'},
        {id:2 ,label:'Task Progress',icon:<CornerRightUp size={16}/>, value:`+${progressPercent}%`,state:completedSubtasks === totalSubtasks ? 'Done' : 'In Progress',color:'#16a34a'},
        {id:3, label:'Interruptions',icon:<MinusCircle size={16}/>, value:String(interruptions),state:'',color:'transparent'},
        {id:4, label:'Productivity Score',icon:<AwardIcon size={16}/>, value:`${productivityScore}/100`,state:productivityScore >= 80 ? 'Excellent' : 'Good',color:'var(--dark-purple)'}
    ];
    return(
        <div className="session-completed-container"> 
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'500',backgroundColor:'#e7e2f8',width:'60px',height:'60px',borderRadius:'50%',color:'#7c3aed'}}><PartyPopper/> </div>
            <h2 style={{lineHeight:'5px',fontSize:'30px'}}>Session Completed!</h2>
            <p style={{lineHeight:'2px',color:'#64748b'}}>Great job staying focused. Here is your summary.</p>
            <div className="boxes">
                {FocusInfo.map(info =>(
                    <div className="box" key={info.id}>
                        <div style={{display:'flex',alignItems:'center',gap:'5px',color:'#64748b',marginBottom:'0'}}>
                        <span style={{marginTop:'5px'}}>{info.icon}</span>
                        <p>{info.label}</p>  
                        </div>   
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'center',gap:'5px'}}>
                            <h2 style={{marginTop:'0'}}>{info.value}</h2>
                            <p style={{color:`${info.color}`,fontWeight:'500'}}>{info.state}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="recommendations">
                <div className='one'>
                <div style={{backgroundColor:'#c9aff4',width:'100px',height:'100px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Brain size={50} color="#7c3aed"/>
                </div>
                </div>
                <div className='two'>
                    <h4 style={{letterSpacing:'1px',color:'var(--dark-purple)',marginBottom:'0'}}>SMART RECOMMENDATION</h4>
                    <h3 style={{margin:'0'}}>AI Insight</h3>
                    <p style={{color:'#475569',fontWeight:'500'}}>You achieve 15% higher focus scores during morning sessions. Consider scheduling your deep work before 11 AM for maximum efficiency.</p>
                </div>
            </div>
            <Link style={{width:'70%'}} to={'/focussetup'}>
             <button className='restart-btn'><span><Play size={16}/></span>Start Another Session</button>
            </Link>
            <div className="buttons">
                <button><span><CoffeeIcon size={16}/></span>Take a Break</button>
                <div style={{borderLeft:'2px solid #64748b',height:'15px'}}></div>
                <Link to={'/spaceoverview'}>
                <button><span><Grid2X2 size={16}/></span>Return to Workspace</button>
                </Link>
            </div>
        </div>
    );
};
export default SessionCompletion;