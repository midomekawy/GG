import { Filter, MoreVertical, Search, UserPlus2 } from "lucide-react";
import Sidebar from "../HomeComponent/Sidebar";
import TopHeader from "./TopHeader";
import Member01 from "../../assets/images/mem01.png";
import Member02 from "../../assets/images/mem02.png";
import Member03 from "../../assets/images/mem03.png";
import Member04 from "../../assets/images/mem04.png";
import PendingMember from "../../assets/images/pendingUser.jpg";
const teamMembersInfo = [
    {id:1,image:Member01, name:'Sarah Jenkins', email:'sarah.j@focusflow.io', role:'Admin', status:'Active',actions:''},
    {id:2,image:Member02, name:'Michael Chen', email:'m.chen@focusflow.io', role:'Member', status:'Active',actions:''},
    {id:3,image:Member03, name:'Elena Rodriguez', email:'elena.r@agency.com', role:'Guest', status:'Active',actions:''},
    {id:4,image:PendingMember,name:'Pending invite...', email:'david.k@focusflow.io', role:'Member', status:'Pending',actions:'Resend'},
    {id:5,image:Member04, name:'Marcus Wade', email:'m.wade@focusflow.io', role:'Member', status:'Active',actions:''},
]

const TeamMembers = ()=>{
    return(
        <div className="app-container">
           <Sidebar/>
            <main className="main-content">
                <TopHeader/>
                <div className="page-container">
                    <div className="members-main-container">
                        <div className="search-members">
                            <div className="search">
                                <span style={{color:'var(--purple-color)'}}><Search size={18}/></span>
                                <input placeholder="Search members..."/>
                            </div>
                            <div className="buttons">
                                <button><Filter size={18}/>Filter</button>
                                <button style={{backgroundColor:'var(--purple-color)',color:'white'}}><UserPlus2 size={18}/> Invite Member</button>
                            </div>
                        </div>
                        {/* <div className="table-wrapper"> */}
                        <table>
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>ROLE</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                               {teamMembersInfo.map((member)=>(
                                <tr key={member.id}>
                                    <td>
                                    <div style={{display:'flex',alignItems:'center',gap:'5px',justifyContent:'flex-start'}}>
                                    <img src={member.image} alt="member image" /> 
                                    <p style={{fontWeight:'500',color:member.status === 'Pending'?'var(--light-purple)':'black'}}>{member.name}</p>   
                                    </div></td>
                                    <td style={{color:'var(--purple-color)'}}>{member.email}</td>
                                    <td>{member.role}</td>
                                    <td><span style={{backgroundColor: member.status === 'Pending'?'#fff4c7':'#dcfce7',color:member.status === 'Pending'?'#a35b2a':'#1d6b3b',padding:'5px 10px',borderRadius:'10px'}}>{member.status}</span></td>
                                    <td style={{color:'var(--purple-color)'}}>{member.actions}</td>
                                    <td style={{color:'#ae9bbd'}}><MoreVertical/></td>
                                </tr>
                               ))} 
                            </tbody>
                        </table>
                        {/* </div> */}
                        <div className="footer">
                                 <h5>Showing {teamMembersInfo.length} of {teamMembersInfo.length} members</h5>
                                 <div className="buttons">
                                    <button>Previous</button>
                                    <button>Next</button>
                                </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
};
export default TeamMembers;