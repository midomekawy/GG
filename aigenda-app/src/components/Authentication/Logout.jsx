import { CircleQuestionMark, Home, LogInIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Logout = ()=>{
    const navigate = useNavigate();
    return(
        <div className="logout">
            <div className="logout-box">
                <div className="icon">
                    <LogOut size={25}/>
                </div>
                 <h2>Log Out From AiGenda?</h2>
                 <p>You’re currently logged in as <span style={{color:'#844acf'}}>alex.design@example.com.</span>Are you sure you want to end your session?</p>
                 <div className="buttons">
                    <button style={{backgroundColor:'var(--primary)',color:'white'}}>Log Out</button>
                    <button onClick={()=>{navigate(-1)}}>Cancel</button>
                 </div>
                 <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'5px',margin:'10px',color:'#748396'}}>
                    <p style={{color:'#748396',letterSpacing:'2px'}}>QUICK ACCESS</p>
                    <div style={{display:'flex', alignItems:'center',gap:'25px'}}>
                        <div style={{display:'flex',alignItems:'center',flexDirection:'column',cursor:'pointer'}} onClick={()=>{navigate('/home')}}>
                        <span><Home size={20}/></span>
                       <span>Home</span> 
                    </div>
                    <div style={{display:'flex',alignItems:'center',flexDirection:'column',cursor:'pointer'}}>
                        <span><CircleQuestionMark size={20}/></span>
                       <span>Help</span> 
                    </div>
                    <div style={{display:'flex',alignItems:'center',flexDirection:'column',cursor:'pointer'}}>
                        <span><LogInIcon size={20}/></span>
                       <span>Switch</span> 
                    </div>
                    </div>
                 </div>
                    
                 </div>
            </div>
    )
}
export default Logout;