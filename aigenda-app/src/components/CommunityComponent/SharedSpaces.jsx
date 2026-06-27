import { AppWindow, Filter, Palette, Plus, Search, Smartphone, SortDesc, SquareArrowOutUpRight, SquareBottomDashedScissorsIcon, User } from "lucide-react";
import Sidebar from "../HomeComponent/Sidebar";
import TopHeader from "./TopHeader";
import Member01 from "../../assets/images/mem01.png";
import Member02 from "../../assets/images/mem02.png";
import Member03 from "../../assets/images/mem03.png";
import Member04 from "../../assets/images/mem04.png";
import Member05 from "../../assets/images/mem05.png";
const spacesInfo = [
    {id:1, icon:<Palette size={20}/>, status:"in progress", color:'#228747',bg:'#dcfce7',title:'Q4 Brand Refresh', desc:'Updating core brand guidelines including typography, color palette, and component libraries.', progress:`68%`, teamMembers:[
        {id: 101, avatar:Member01},
        {id: 102, avatar:Member02},
        {id: 103, avatar: Member03},
        {id:104, avatar: Member04}
    ]},
    {id:2, icon:<User size={20}/>, status:"planning",color:'#1c4ed9',bg:'#dbebff', title:'Onboarding Flow', desc:'Building a comprehensive UI kit for the upcoming React Native mobile application launch.', progress:`15%`, teamMembers:[
        {id: 105, avatar:Member05},
        {id: 106, avatar:Member01},
    ]},
    {id:3, icon:<Smartphone size={20}/>, status:"on hold" ,color:'#8568ab',bg:'#ebe6f2',title:'Mobile App UI Kit', desc:'Redesigning the user onboarding experience to improve retention and product tour engagement.', progress:`95%`, teamMembers:[
        {id: 107, avatar:Member05},
        {id: 108, avatar:Member02},
        {id: 109, avatar:Member04},
    ]},
    {id:4, icon:<SquareBottomDashedScissorsIcon size={20}/>, status:"in progress",color:'#228747',bg:'#dcfce7', title:'User Research Phase II', desc:'Conducting deep-dive interviews with enterprise customers for upcoming feature releases.', progress:`45%`, teamMembers:[
        {id: 110, avatar:Member03},
        {id: 111, avatar:Member05},
    ]},
    {id:5, icon:<AppWindow size={20}/>, status:"in progress",color:'#228747',bg:'#dcfce7', title:'Internal Tooling Upgrade', desc:'Migrating design token pipelines to the new unified API for automated component builds.', progress:`20%`, teamMembers:[
        {id: 112, avatar:Member02},
        {id: 113, avatar:Member04},
    ]},
]

const SharedSpaces = ()=>{
    return(
        <div className="app-container">
           <Sidebar/>
            <main className="main-content">
                <TopHeader/>
                <div className="page-container">
                    <div className="search-project">
                        <div className="search">
                            <span><Search size={18}/></span>
                            <input placeholder="Find a project by name or status..."/>
                        </div>
                        <div className="buttons">
                            <button><Filter size={18}/> Filter</button>
                            <button><SortDesc size={18}/> Sort</button>
                        </div>
                    </div>
                    <div className="community-spaces-box">
                        {spacesInfo.map((space)=>{
                            const maxVisibleAvatar = 2;
                            const visibleMembers = space.teamMembers.slice(0, maxVisibleAvatar);
                            const remainingAvatars = space.teamMembers.length - maxVisibleAvatar;
                            return(
                                <div className="box" key={space.id}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                                    <div style={{backgroundColor:'var(--low-purple)',color:'var(--purple-color)',width:'30px',height:'30px',borderRadius:'5px',display:'flex',alignItems:'center',justifyContent:'center'}}>{space.icon}</div>  
                                    <div style={{fontWeight:'500',borderRadius:'10px',color:`${space.color}`,backgroundColor:`${space.bg}`,width:'max-content',padding:'5px'}}>{space.status.toUpperCase()}</div>
                                    </div>
                                    <div>
                                    <h3>{space.title}</h3>
                                    <p style={{color:'var(--light-purple)'}}>{space.desc}</p>
                                    </div>
                                    <div className="progress-sec">
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                                     <p style={{color:'var(--light-purple)',fontWeight:'500'}}>Progress</p> 
                                     <p style={{color:'var(--purple-color)',fontWeight:'600'}}>{space.progress}</p>  
                                    </div>
                                    <div className="progress-bar-bg" style={{backgroundColor:'var(--low-purple)'}}>
                                    <div className="progress-bar-fill" style={{ width:`${space.progress}`,backgroundColor:'var(--purple-color)' }}></div>
                                    </div>
                                    </div>
                                    <div className="footer-sec">
                                        <div className="team-avatars">
                                            {visibleMembers.map((member)=>(
                                                <img key={member.id} src={member.avatar} alt="member avatar"/>
                                            ))}
                                            {remainingAvatars > 0 && (
                                                <div className="remain-avatars">+{remainingAvatars}</div>
                                            )}
                                        </div>
                                        <div style={{color:'var(--purple-color)'}}><SquareArrowOutUpRight size={20}/></div>
                                    </div>
                                </div>
                            )
                        })}
                         <div className="create-box">
                            <div style={{fontWeight:'600',width:'50px',height:'50px',borderRadius:"50px",display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'var(--low-purple)',color:'var(--purple-color)'}}>
                                <Plus/>
                            </div>
                         <h3 style={{color:'var(--purple-color)',fontWeight:'700'}}>Share New Space</h3> 
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
};
export default SharedSpaces;