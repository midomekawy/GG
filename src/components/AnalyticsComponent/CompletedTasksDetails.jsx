import { CheckCircle, MoreVertical } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CompletedTasksDetails = ({ setOpenCTD, completedTasks, totalTasks, completionRate, tasks, loading }) => {
  const remaining = Math.max(0, (totalTasks || 0) - (completedTasks || 0));
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const gaugeData = [
    { name: 'Completed', value: completedTasks || 0, color: '#a78bfa' },
    { name: 'Remaining', value: remaining, color: '#e5e7eb' }
  ];
  const completedTasksData = (tasks || []).filter(t => t.status === 'done' || t.status === 2 || t.status === 'completed');

  let tableBody;
  if (loading) {
    tableBody = <tr><td colSpan={4} style={{textAlign:'center', color:'#94a3b8'}}>Loading…</td></tr>;
  } else if (completedTasksData.length === 0) {
    tableBody = <tr><td colSpan={4} style={{textAlign:'center', color:'#94a3b8'}}>No completed tasks yet</td></tr>;
  } else {
    tableBody = completedTasksData.map((task) => (
      <tr key={task.id || task._id || task.taskId}>
        <td id="taskName">
          <div style={{backgroundColor:'#f4ebff',color:'var(--dark-purple)',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <CheckCircle size={20} />
          </div>
          {task.title || task.taskName || task.name || 'Task'}
        </td>
        <td>{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}</td>
        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
        <td>{task.spaceName || task.spaceId || '—'}</td>
      </tr>
    ));
  }

  return (
        <div className="overlay dashboard-overlay" onClick={()=>{setOpenCTD(false)}} style={{alignItems:'flex-start',justifyContent:'flex-start'}}>
            <div className="completed-tasks-container" onClick={(e)=>e.stopPropagation()}>
            <div className="card gauge-card card-border-purple" style={{width:'300px'}}>
            <div className="gauge-header">
            <h2>{loading ? "…" : `${completedTasks}/${totalTasks}`}</h2>
            <span>Tasks<br/>Completed</span>
            </div>
            <div className="gauge-chart-container">
            <ResponsiveContainer width="100%" height={140}>
            <PieChart>
            <Pie
            data={gaugeData}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            cornerRadius={5}
            >
            {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            </Pie>
            </PieChart>
            </ResponsiveContainer>
            <div className="gauge-text">
            <h3>{loading ? "…" : `${rate}%`}</h3>
            <p>{loading ? "…" : "Tasks Done"}</p>
            </div>
            </div>
            </div>
            <div className="table-box">
                <table>
                    <thead>
                        <tr style={{borderBottom: "1px solid #e4e7ec"}}>
                        <th>Task name</th>
                        <th>Completion Date</th>
                        <th>Due Date</th>
                        <th>Space Name</th>
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
export default CompletedTasksDetails;