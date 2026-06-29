import { Calendar, Chrome, Figma, Filter, Github, Grid, Slack, Trello } from 'lucide-react';
import Header from '../HomeComponent/Header';
import '../HomeComponent/home.css';
import Sidebar from '../HomeComponent/Sidebar';
import './connect.css';
const Connect = ()=>{
    return(
    <div className='app-container'>
        <Sidebar/>
        <main className="main-content" style={{marginLeft:'130px'}}>
      <Header/>

      <div className="page-container">
        <div className="search-header">
          <div>
            <h2>Connect Apps</h2>
            <p style={{color: "var(--text-muted)", fontSize: "1.125rem", marginTop: "0.5rem"}}>Sync your favorite tools with AiGenda</p>
          </div>
          <div style={{display: "flex", gap: "1rem"}}>
            <button className="control-btn" style={{background: "white", border: "1px solid var(--border-color)", padding: "0.75rem"}}><Filter/></button>
            <button className="control-btn" style={{background: "white", border: "1px solid var(--border-color)", padding: "0.75rem"}}><Grid/></button>
          </div>
        </div>

        <div className="apps-grid">
          <div className="app-card">
            <div className="app-icon-wrapper"><Slack style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">Slack</h3>
            <p className="app-desc">Sync your messages and notifications directly to your workspace.</p>
            <button className="connect-btn">Connect</button>
          </div>
          <div className="app-card">
            <div className="app-icon-wrapper"><Github style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">GitHub</h3>
            <p className="app-desc">Track issues and pull requests alongside your tasks.</p>
            <button className="connect-btn">Connect</button>
          </div>
          <div className="app-card">
            <div className="app-icon-wrapper"><Chrome style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">Google Drive</h3>
            <p className="app-desc">Access and attach your documents seamlessly.</p>
            <button className="connect-btn">Connect</button>
          </div>
          <div className="app-card">
            <div className="app-icon-wrapper"><Calendar style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">Google Calendar</h3>
            <p className="app-desc">Keep your schedule in sync with your task deadlines.</p>
            <button className="connect-btn">Connect</button>
          </div>
          <div className="app-card">
            <div className="app-icon-wrapper"><Figma style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">Figma</h3>
            <p className="app-desc">Preview your designs and prototypes within AiGenda.</p>
            <button className="connect-btn">Connect</button>
          </div>
          <div className="app-card">
            <div className="app-icon-wrapper"><Trello style={{width: "2.5rem", height: "2.5rem"}}/></div>
            <h3 className="app-name">Trello</h3>
            <p className="app-desc">Import your boards and cards for a unified view.</p>
            <button className="connect-btn">Connect</button>
          </div>
        </div>
      </div>
    </main>
    </div>
    );
};
export default Connect;