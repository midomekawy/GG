import { AppWindow, AppWindowIcon, ArrowRight, Banknote, BoxesIcon, Calendar1, CalendarDays, File, Image, LayoutDashboard, List, Map, Megaphone, MessageCircleCode, MessageCircleQuestionIcon, Microscope, PaletteIcon, Plus, PlusIcon, SaveAll, Settings, TerminalSquare, TriangleAlert, Users } from "lucide-react";
import "../HomeComponent/home.css";
import Sidebar from "../HomeComponent/Sidebar";
import "./community.css";
import { useNavigate } from "react-router-dom";
const Community = () => {
  const navigate = useNavigate();
  const workspacesData = [
  {
    id: 1,
    title: "Design System Group",
    status: "ACTIVE",
    icon: <PaletteIcon/>,
    members: 12,
    tag: "Shared Assets",
    recentItems: [
      {
        id: "a1",
        title: "Brand Guidelines 2024",
        type: <SaveAll size={20}/>, 
      },
      {
        id: "a2",
        title: "Icon Library v2.0",
        type: <File size={20}/>,
      },
      {
        id: "a3",
        title: "Component Roadmap",
        type: <LayoutDashboard size={20}/>,
      }
    ],
  },
  {
    id: 2,
    title: "Marketing Ops",
    status: "UPDATED 2H AGO",
    icon: <Megaphone/>,
    members: 5,
    tag: "Campaign Planning",
    recentItems: [
      {
        id: "a4",
        title: "Social Media Calender",
        type: <CalendarDays size={20}/>, 
      },
      {
        id: "a5",
        title: "Q4 Campaign Assets",
        type: <Image size={20}/>,
      },
      {
        id: "a6",
        title: "Influencer Brief",
        type: <File size={20}/>,
      }
    ],
  },
  {
    id: 3,
    title: "Engineering Alpha",
    status: "8 NEW DOCS",
    icon: <BoxesIcon/>,
    members: 8,
    tag: "Dev Environment",
    recentItems: [
      {
        id: "a7",
        title: "Sprint Backlog Q4",
        type: <List size={20}/>, 
      },
      {
        id: "a8",
        title: "API Documentation",
        type: <AppWindow size={20}/>,
      },
      {
        id: "a9",
        title: "Security Protocal",
        type: <TriangleAlert size={20}/>,
      }
    ],
  },
  {
    id: 4,
    title: "Sales & Growth",
    status: "UPDATED 6H AGO",
    icon: <Banknote/>,
    members: 15,
    tag: "High Priority",
    recentItems: [
      {
        id: "a10",
        title: "Q3 Revenue Report",
        type: <TerminalSquare  size={20}/>, 
      },
      {
        id: "a11",
        title: "Target Customer Profiles",
        type: <Users size={20}/>,
      },
      {
        id: "a12",
        title: "Pitch Deck Final",
        type: <File size={20}/>,
      }
    ],
  },
  {
    id: 5,
    title: "Product Strategy",
    status: "3 NEW DOCS",
    icon: <Settings/>,
    members: 3,
    tag: "Executive",
    recentItems: [
      {
        id: "a13",
        title: "2025 Vision Roadmap",
        type: <Map size={20}/>, 
      },
      {
        id: "a14",
        title: "User Interview Insights",
        type: <MessageCircleQuestionIcon size={20}/>,
      },
      {
        id: "a15",
        title: "Market Research Pack",
        type: <Microscope size={20}/>,
      }
    ],
  },
];
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="main-community-header">
            <div>
              <h2>Your Teams</h2>
              <p style={{color:'var(--light-purple)'}}>You are currently active in 6 workspaces</p>
            </div>
            <button>
              <span style={{marginTop:'2px'}}><PlusIcon size={17}/></span>
              Create Team
            </button>
          </div>
          <div className="community-boxes">
                {workspacesData.map((group) => (
                <div key={group.id} className="card">
                <div className="card-header">
                <div className="icon-bg">{group.icon}</div>
                <div className={group.status === "ACTIVE"?"status-tag-active":"status-tag"}>{group.status}</div>
                </div>
                <div className="text">
                <h3>{group.title}</h3>
                <div className="sub-info">
                  <p><Users size={15}/> {group.members} members</p>
                  <p>•  {group.tag}</p></div>
                </div>

                <div className="recent-section">
                <h5 style={{color:"var(--light-purple)"}}>RECENT SHARED ITEMS</h5>
                {group.recentItems.map((item) => (
                <div key={item.id} className="item-row">
                  <span style={{color:'var(--light-purple)'}}>{item.type}</span>
                  <span style={{fontWeight:'500'}}>{item.title}</span>
                </div>
                ))}
                </div>

                <div className="card-footer" onClick={()=>{navigate('/sharedspaces')}}>
                <span style={{fontWeight:'500',color:'var(--purple-color)'}}>View workspace</span>
                <span style={{color:'var(--light-purple)',marginTop:'10px'}}><ArrowRight size={20} /></span>
                </div>
                </div>
                ))}
              <div className="create-box">
                <div className="circle"> <Plus/></div>
                <h4>Create New Team</h4>
                <p style={{color:'var(--light-purple)',width:'200px',marginTop:'0'}}>Organize your projects and collaborate with teammates.</p>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Community;
