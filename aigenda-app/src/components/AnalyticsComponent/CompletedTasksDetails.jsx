import { FilmIcon, Image, LayoutDashboard, MoreVertical, ZapIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CompletedTasksDetails = ({setOpenCTD})=>{
    const gaugeData = [
  { name: 'Completed', value: 67, color: '#a78bfa' },
  { name: 'Remaining', value: 33, color: '#e5e7eb' }];
   const completedTasksData = [
    {taskId:'1',taskName:'Tech requirements.pdf',completionDate:'Jan 4, 2024',dueDate:'Jan 4, 2024',spaceName:'Requirements',icon:<ZapIcon size={20}/>},
    {taskId:'2',taskName:'Dashboard screenshot.jpg',completionDate:'Jan 4, 2024',dueDate:'Jan 4, 2024',spaceName:'Dashboard',icon:<Image size={20}/>},
    {taskId:'3',taskName:'Dashboard prototype recording.mp4',completionDate:'Jan 4, 2024',dueDate:'Jan 2, 2024',spaceName:'Dashboard',icon:<FilmIcon size={20}/>},
    {taskId:'4',taskName:'Dashboard prototype FINAL.fig',completionDate:'Jan 4, 2024',dueDate:'Jan 6, 2024',spaceName:'Dashboard',icon:<LayoutDashboard size={20}/>},
    {taskId:'5',taskName:'Dashboard interaction.framerx',completionDate:'Jan 4, 2024',dueDate:'Jan 6, 2024',spaceName:'Space 2',icon:<LayoutDashboard size={20}/>},
    {taskId:'6',taskName:'App inspiration.png',completionDate:'Jan 4, 2024',dueDate:'Jan 6, 2024',spaceName:'Space 3',icon:<Image size={20}/>},
   ]     
    return(
        <div className="overlay dashboard-overlay" onClick={()=>{setOpenCTD(false)}} style={{alignItems:'flex-start',justifyContent:'flex-start'}}>
            <div className="completed-tasks-container" onClick={(e)=>e.stopPropagation()}>
            <div className="card gauge-card card-border-purple" style={{width:'300px'}}>
            <div className="gauge-header">
            <h2>35/50</h2>
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
            <h3>67%</h3>
            <p>Jan</p>
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
                        {/* <th></th> */}
                    </tr>
                    </thead>
                    <tbody>
                        {completedTasksData.map((task )=>(
                            <tr key={task.taskId}>
                            <td id="taskName"><div style={{backgroundColor:'#f4ebff',color:'var(--dark-purple)',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{task.icon}</div>{task.taskName}</td>
                            <td>{task.completionDate}</td>
                            <td>{task.dueDate}</td>
                            <td>{task.spaceName}</td>
                            <td style={{color:'#6b7280',cursor:'pointer'}}><MoreVertical/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
};
export default CompletedTasksDetails;