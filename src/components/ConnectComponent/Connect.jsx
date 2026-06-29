import { Calendar, Check, Chrome, ExternalLink, Figma, Filter, Github, Grid, Loader2, RefreshCw, Slack, Trello } from 'lucide-react';
import Header from '../HomeComponent/Header';
import '../HomeComponent/home.css';
import Sidebar from '../HomeComponent/Sidebar';
import './connect.css';
import { useEffect, useMemo, useState } from 'react';
import { appConnectionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AVAILABLE_APPS = [
  { id: 'slack', name: 'Slack', icon: Slack, description: 'Sync your messages and notifications directly to your workspace.' },
  { id: 'github', name: 'GitHub', icon: Github, description: 'Track issues and pull requests alongside your tasks.' },
  { id: 'google-drive', name: 'Google Drive', icon: Chrome, description: 'Access and attach your documents seamlessly.' },
  { id: 'google-calendar', name: 'Google Calendar', icon: Calendar, description: 'Keep your schedule in sync with your task deadlines.' },
  { id: 'figma', name: 'Figma', icon: Figma, description: 'Preview your designs and prototypes within AiGenda.' },
  { id: 'trello', name: 'Trello', icon: Trello, description: 'Import your boards and cards for a unified view.' },
];

function parseConnectionsResponse(res) {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.connections)) return d.connections;
  if (Array.isArray(d?.appConnections)) return d.appConnections;
  return [];
}

function getConnectionId(connection) {
  return connection?.id ?? connection?.Id ?? connection?.connectionId ?? connection?.ConnectionId;
}

function getConnectionProvider(connection) {
  return (
    connection?.provider ??
    connection?.Provider ??
    connection?.appId ??
    connection?.AppId ??
    connection?.app?.id
  );
}

const Connect = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [authWindows, setAuthWindows] = useState({});

  const connectedAppIds = useMemo(() => {
    return new Set(
      connections
        .map((c) => String(getConnectionProvider(c)).toLowerCase())
        .filter(Boolean)
    );
  }, [connections]);

  const connectionMap = useMemo(() => {
    const map = {};
    connections.forEach((c) => {
      const provider = String(getConnectionProvider(c)).toLowerCase();
      if (provider) map[provider] = c;
    });
    return map;
  }, [connections]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const res = await appConnectionsAPI.getConnections();
      const list = parseConnectionsResponse(res);
      setConnections(list);
    } catch (e) {
      console.warn('App connections API not available, using local state');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // Poll for updated connections after an OAuth popup closes
  useEffect(() => {
    const providers = Object.keys(authWindows).filter((p) => authWindows[p]);
    if (providers.length === 0) return;

    let interval;
    const checkClosed = () => {
      let allClosed = true;
      providers.forEach((provider) => {
        const win = authWindows[provider];
        if (win && !win.closed) {
          allClosed = false;
        } else if (win && win.closed) {
          setAuthWindows((prev) => ({ ...prev, [provider]: null }));
        }
      });
      if (allClosed) {
        clearInterval(interval);
        loadConnections();
      }
    };
    interval = setInterval(checkClosed, 1000);
    return () => clearInterval(interval);
  }, [authWindows]);

  const handleToggle = async (app) => {
    const existing = connectionMap[app.id.toLowerCase()];

    setProcessing((prev) => ({ ...prev, [app.id]: true }));
    try {
      if (existing) {
        const connectionId = getConnectionId(existing);
        if (connectionId) {
          await appConnectionsAPI.disconnectApp(connectionId);
        }
        setConnections((prev) => prev.filter((c) => c !== existing));
        toast.success(`${app.name} disconnected`);
      } else {
        const res = await appConnectionsAPI.authorizeProvider(app.id);
        const authUrl =
          res?.data?.url ??
          res?.data?.authorizationUrl ??
          res?.data?.loginUrl ??
          res?.data?.data?.url;

        if (authUrl && typeof authUrl === 'string') {
          const popup = window.open(authUrl, `${app.id}-auth`, 'width=600,height=700');
          setAuthWindows((prev) => ({ ...prev, [app.id]: popup }));
          toast.success(`Opening ${app.name} authorization…`);
        } else {
          // Backend completed connection without redirect (e.g. already authorized)
          await loadConnections();
          toast.success(`${app.name} connected`);
        }
      }
    } catch (e) {
      console.warn('App connection API failed:', e);
      toast.error(`Could not connect ${app.name}. Please try again.`);
    } finally {
      setProcessing((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  const handleSync = async (app) => {
    const existing = connectionMap[app.id.toLowerCase()];
    const connectionId = existing && getConnectionId(existing);
    if (!connectionId) return;

    setProcessing((prev) => ({ ...prev, [app.id]: true }));
    try {
      await appConnectionsAPI.syncConnection(connectionId);
      toast.success(`${app.name} synced`);
    } catch (e) {
      console.warn('Sync failed:', e);
      toast.error(`Could not sync ${app.name}`);
    } finally {
      setProcessing((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  return (
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

          {loading && <p style={{ color: '#64748b', padding: '1rem 0' }}>Loading connections…</p>}

          <div className="apps-grid">
            {AVAILABLE_APPS.map((app) => {
              const isConnected = connectedAppIds.has(app.id.toLowerCase());
              const isProcessing = processing[app.id];
              const Icon = app.icon;
              return (
                <div className="app-card" key={app.id}>
                  <div className="app-icon-wrapper"><Icon style={{width: "2.5rem", height: "2.5rem"}}/></div>
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-desc">{app.description}</p>
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button
                      className="connect-btn"
                      onClick={() => handleToggle(app)}
                      disabled={isProcessing}
                      style={{
                        backgroundColor: isConnected ? '#dcfce7' : undefined,
                        color: isConnected ? '#15803d' : undefined,
                        border: isConnected ? '1px solid #86efac' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        flex: 1,
                      }}
                    >
                      {isProcessing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : isConnected ? <Check size={16}/> : <ExternalLink size={16}/>}
                      {isConnected ? 'Connected' : 'Connect'}
                    </button>
                    {isConnected && (
                      <button
                        className="connect-btn"
                        onClick={() => handleSync(app)}
                        disabled={isProcessing}
                        title="Sync"
                        style={{ width: '44px', padding: 0 }}
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Connect;