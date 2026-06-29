import { MoreVertical, TrendingUp } from "lucide-react";
const FocusSessionDetails = ({ setOpenFSD, focusSessions, focusHours, focusCompletionRate, loading }) => {
  const focusSessionDetails = [];

  let tableBody;
  if (loading) {
    tableBody = <tr><td colSpan={4} style={{textAlign:'center', color:'#94a3b8'}}>Loading…</td></tr>;
  } else if (focusSessionDetails.length === 0) {
    tableBody = <tr><td colSpan={4} style={{textAlign:'center', color:'#94a3b8'}}>No focus sessions yet</td></tr>;
  } else {
    tableBody = focusSessionDetails.map((item) => (
      <tr key={item.id}>
        <td style={{color:'#5900ca'}}>{item.startTime}</td>
        <td>{item.spaceName}</td>
        <td>{item.duration}</td>
        <td>{item.tasksCompleted}</td>
      </tr>
    ));
  }

  return (
    <div className="overlay" onClick={()=>{setOpenFSD(false)}}>
      <div className="focus-details-container" onClick={(e)=>{e.stopPropagation()}}>
        <div className="card focus-card card-border-blue" style={{width:'300px',textAlign:'start'}}>
          <h2>{loading ? "…" : `${focusSessions} Focus sessions`}<br/>this week</h2>
          <p className="subtitle">{loading ? "…" : `${focusHours} h - Total focus time`}</p>
          <p className="trend">
            <TrendingUp size={14} className="trend-icon" />
            <strong>{loading ? "…" : `${focusCompletionRate}%`}</strong> tasks completed during focus
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
                {tableBody}
              </tbody>
            </table>
          </div>
         </div>
        </div>
    );
};
export default FocusSessionDetails;