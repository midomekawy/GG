import { Archive, ChevronLeftIcon, IdCard, Plus, Settings, User, Users, Users2 } from 'lucide-react';
import './community.css';
import { NavLink, useNavigate } from 'react-router-dom';
const TopHeader = ()=>{
    const navigate = useNavigate();
    return(
        <div className='header-box'>
        <div className='top-section'>
            <div className='left-section'>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{cursor:'pointer'}} onClick={()=>{navigate(-1)}}><ChevronLeftIcon size={30}/></div>
                <div className="card">
                    <Users/>
                </div>
                 </div>
                <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <h2>Design Systems Team</h2>
                <div style={{backgroundColor:'var(--low-purple)',color:'var(--purple-color)',width:'max-content',padding:'5px 10px',textAlign:'center',borderRadius:'10px',fontWeight:'500'}}>PRO PLAN</div>
                </div>
                <div className='info'>
                    <p><span><Archive size={18}/></span>12 Active Projects</p>
                    <p><span><User size={18}/></span>5 Members</p>
                </div>  
                </div>
            </div>
            <div className="buttons">
                <button style={{backgroundColor:'var(--low-purple)',color:'black'}}><span><Settings size={18}/></span>Team Settings</button>
                <button style={{backgroundColor:'var(--purple-color)',color:'white'}}><span><Plus size={18}/></span>Share New Space</button>
            </div>
        </div>
        <div className="links">
            <NavLink to='/sharedspaces' className={({isActive})=> isActive? "actv-link":'normal-link'}><div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{marginTop:'5px'}}><IdCard size={18}/></span> Shared Spaces</div> </NavLink>
            <NavLink to='/teammember' className={({isActive})=> isActive? "actv-link":'normal-link'}> <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{marginTop:'5px'}}><Users2 size={18}/></span>Team Members</div></NavLink>
        </div>
        </div>
    )
};
export default TopHeader;