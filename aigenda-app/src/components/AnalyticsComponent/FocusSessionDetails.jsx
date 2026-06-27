import { MoreVertical, TrendingUp } from "lucide-react";
const FocusSessionDetails = ({setOpenFSD})=>{
  const focusSessionDetails = [
    {id:'1',startTime:'Jan 4,2025 | 11:35 Am',spaceName:'Requirements',duration:'1h:37m',tasksCompleted:'3'},
    {id:'2',startTime:'Jan 4,2025 | 11:35 Am',spaceName:'Dashboard',duration:'1h:37m',tasksCompleted:'5'},
    {id:'3',startTime:'Jan 5,2025 | 11:35 Am',spaceName:'Dashboard',duration:'1h:37m',tasksCompleted:'2'},
    {id:'4',startTime:'Jan 6,2025 | 11:35 Am',spaceName:'Dashboard',duration:'3h:37m',tasksCompleted:'7'},
    {id:'5',startTime:'Jan 7,2025 | 11:35 Am',spaceName:'Space 2',duration:'2h:37m',tasksCompleted:'6'},
    {id:'6',startTime:'Jan 7,2025 | 11:35 Am',spaceName:'Space 3',duration:'2h:37m',tasksCompleted:'4'},
  ]
    return(
        <div className="overlay" onClick={()=>{setOpenFSD(false)}}>
         <div className="focus-details-container" onClick={(e)=>{e.stopPropagation()}}>
            <div className="card focus-card card-border-blue" style={{width:'300px',textAlign:'start'}}>
            <h2>12 Focus sessions<br/>this week</h2>
            <p className="subtitle">12 h - Total focus time</p>
            <p className="trend">
              <TrendingUp size={14} className="trend-icon" />
              <strong>18%</strong> tasks completed during focus
            </p>
          </div>
          <div className="table-box">
            <table>
              <thead>
                <tr style={{borderBottom:'1px solid #e4e7ec'}}>
                  <th>Start Time</th>
                  <th>Space Name</th>
                  <th>Duration</th>
                  <th>Tasks Completed</th>
                </tr>
              </thead>
              <tbody>
                {focusSessionDetails.map((item)=>(
                  <tr key={item.id}>
                    <td style={{color:'#5900ca'}}>{item.startTime}</td>
                    <td>{item.spaceName}</td>
                    <td>{item.duration}</td>
                    <td>{item.tasksCompleted}</td>
                    <td style={{color:'#98a2b3',cursor:'pointer'}}><MoreVertical/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         </div>
        </div>
    );
};
export default FocusSessionDetails;