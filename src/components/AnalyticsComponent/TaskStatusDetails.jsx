import { ResponsiveContainer,  PieChart, Pie, Cell} from 'recharts';
const TaskStatusDetails = ({ setOpenTSD, totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, loading }) => {
  const safeTotal = Math.max(totalTasks || 0, 1);
  const pieData = [
    { name: 'Completed', value: completedTasks || 0, color: '#22c55e' },
    { name: 'In Progress', value: inProgressTasks || 0, color: '#60a5fa' },
    { name: 'To Do', value: todoTasks || 0, color: '#e5e7eb' },
    { name: 'Over Due', value: overdueTasks || 0, color: '#ef4444' },
  ];
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const stats = [
    { isTotal: true, value: totalTasks || 0, label: "Total Tasks" },
    { value: completedTasks || 0, max: safeTotal, color: "#3b82f6", trackColor: "#bfdbfe", label: "Completed" },
    { value: inProgressTasks || 0, max: safeTotal, color: "#60a5fa", trackColor: "#e0e7ff", label: "In Progress" },
    { value: (todoTasks || 0) + (overdueTasks || 0), max: safeTotal, color: "#ef4444", trackColor: "#fecaca", label: "Pending" }
  ];
  return (
        <div className="overlay" onClick={() => setOpenTSD(false)}>
        <div className='tasks-status-container' onClick={(e) => e.stopPropagation()}>
        <div className="card pie-card card-border-purple-light" style={{width:'400px'}}>
        <h3>Tasks Status Breakdown</h3>
        <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
        <PieChart>
        <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        innerRadius={0}
        outerRadius={80}
        dataKey="value"
        stroke="#fff"
        strokeWidth={2}
        >
        {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
        </Pie>
        </PieChart>
        </ResponsiveContainer>
        </div>

        <ul className="custom-legend">
        {pieData.map((item, index) => (
        <li key={index}>
        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
        {item.name}
        </li>
        ))}
        </ul>
        </div>
        <div className="modal-content card-border-purple-light">
        <div className="modal-header">
        <h3>Tasks Status Breakdown</h3>
        <button className="month-badge">January</button>
        </div>

        <div className="modal-body">
        {stats.map((stat, index) => {
        const fillPercentage = stat.isTotal ? 1 : stat.value / stat.max;
        const strokeDashoffset = circumference - fillPercentage * circumference;

        return (
        <div className="status-ring-item" key={index}>
        <div className="ring-svg-container">
        {stat.isTotal ? (
        <div className="total-circle-shadow"></div>
        ) : (
        <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} stroke={stat.trackColor} strokeWidth="6" fill="none" />
        <circle
        cx="40" cy="40" r={radius}
        stroke={stat.color} strokeWidth="6" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        />
        </svg>
        )}
        <div className="ring-value">{stat.value}</div>
        </div>
        <p className="ring-label">{stat.label}</p>
        </div>
        );
        })}
        </div>

        </div>   
        </div>
        </div>
    );
};
export default TaskStatusDetails;