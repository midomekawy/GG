import { useEffect, useRef, useState } from "react";
import SidebarImg from "../../assets/images/sidebarlogo.png";
import "./workSpaceStyle.css";
import {
  CheckCircle2,
  ChevronDown,
  File,
  Folder,
  IdCardIcon,
  PlusCircleIcon,
  Settings,
  UserPlus,
} from "lucide-react";
import CreateNewSpace from "../SpacesComponent/CreateNewSpace";
import CreateSpaceModal from "../SpacesComponent/CreateSpaceModal";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";
import Swal from "sweetalert2";
import {
  addWorkspaceMember,
  getApiErrorMessage,
  getWorkspaces,
  normalizeWorkspaceDto,
  parseWorkspacesResponse,
} from "../../services/api";

const SidebarofWorkspace = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspace, setActiveWorkspace } =
    useWorkspace();
  const { spaces, selectSpace } = useSpaces();
  const [openNavItem, setOpenNavItem] = useState(null);
  const [openCreateSpace, setOpenCreateSpace] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [workspaceOptions, setWorkspaceOptions] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!switcherOpen) return;
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      try {
        const res = await getWorkspaces({ page: 1, pageSize: 80 });
        if (cancelled) return;
        const raw = parseWorkspacesResponse(res);
        setWorkspaceOptions(
          raw.map((r) => normalizeWorkspaceDto(r)).filter(Boolean)
        );
      } catch {
        if (!cancelled) setWorkspaceOptions([]);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [switcherOpen]);

  async function handleInvite() {
    if (!activeWorkspaceId) {
      await Swal.fire({
        icon: "info",
        text: "Select a workspace first from the list.",
      });
      return;
    }
    const { value: email } = await Swal.fire({
      title: "Invite member",
      input: "email",
      inputLabel: "Email address",
      showCancelButton: true,
      confirmButtonColor: "#5a0fbd",
    });
    if (!email) return;
    try {
      await addWorkspaceMember(activeWorkspaceId, { Email: String(email).trim() });
      await Swal.fire({ icon: "success", text: "Invitation sent." });
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    }
  }

  function selectWorkspace(ws) {
    setActiveWorkspace(ws);
    setSwitcherOpen(false);
    navigate("/workspaceoverview");
  }

  const title = activeWorkspace?.name?.trim() || "Workspace";
  const visibleSpaces = spaces.filter((space) => {
    if (!activeWorkspaceId) return true;
    return String(space.workspaceId) === String(activeWorkspaceId);
  });

  return (
    <div dir="auto">
      <aside className="workspace-sidebar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            padding: "0 20px",
            position: "relative",
          }}
        >
          <img src={SidebarImg} alt="" />
          <div
            ref={switcherRef}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
              minWidth: 0,
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setSwitcherOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "start",
                width: "100%",
              }}
            >
              <h4
                style={{
                  marginBottom: "0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "160px",
                }}
              >
                {title}
              </h4>
              <ChevronDown size={16} aria-hidden />
            </button>
            <p style={{ color: "#94a3b8", marginTop: "0", fontSize: "11px" }}>
              WORKSPACE
            </p>
            {switcherOpen ? (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  insetInlineStart: 0,
                  marginTop: "8px",
                  zIndex: 60,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
                  minWidth: "220px",
                  maxHeight: "280px",
                  overflowY: "auto",
                }}
              >
                <Link
                  to="/mainworkspace"
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    color: "#5b10bd",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                  onClick={() => setSwitcherOpen(false)}
                >
                  All workspaces
                </Link>
                {loadingList ? (
                  <div style={{ padding: "12px", color: "#94a3b8" }}>
                    Loading…
                  </div>
                ) : (
                  workspaceOptions.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => selectWorkspace(ws)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "start",
                        padding: "10px 14px",
                        border: "none",
                        background:
                          ws.id === activeWorkspaceId ? "#f5f3ff" : "#fff",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      {ws.name || `Workspace ${ws.id}`}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="spaces">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              color: "#94a3b8",
              marginBottom: "0",
            }}
          >
            <p>S P A C E S</p>
            <span
              style={{ fontSize: "5px", cursor: "pointer" }}
              onClick={() => setOpenCreateSpace(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpenCreateSpace(true);
              }}
              role="button"
              tabIndex={0}
            >
              <PlusCircleIcon />
            </span>
          </div>
          <nav className="sidebar-nav">
            {visibleSpaces && visibleSpaces.length > 0 ? (
              visibleSpaces.map((space) => (
                <div key={space.id}>
                  <NavLink
                    to={"/spaceoverview"}
                    className={({ isActive }) => (isActive ? "active" : " ")}
                  >
                    <div
                      className="nav-item"
                      onClick={() => {
                        setOpenNavItem(
                          openNavItem === space.id ? null : space.id
                        );
                        // Update active space when toggling dropdown
                        selectSpace(space.id);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "3px",
                        }}
                      >
                        <span>
                          <Folder size={16} />
                        </span>
                        {space.name}
                      </div>
                      <span>
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </NavLink>
                  {openNavItem === space.id && (
                    <div className="dropdown-list">
                      <NavLink
                        to="/spaceoverview"
                        onClick={() => selectSpace(space.id)}
                      >
                        <span>
                          <CheckCircle2 size={16} />
                        </span>
                        Tasks
                      </NavLink>
                      <NavLink
                        to="/workspaceNotes"
                        onClick={() => selectSpace(space.id)}
                      >
                        <span>
                          <File size={16} />
                        </span>
                        Notes
                      </NavLink>
                      <NavLink
                        to="/workspaceAnalytics"
                        onClick={() => selectSpace(space.id)}
                      >
                        <span>
                          <IdCardIcon size={16} />
                        </span>
                        Analytics
                      </NavLink>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "#8c9196", fontSize: "13px", padding: "0 10px" }}>
                No spaces available
              </p>
            )}
          </nav>
        </div>
        <div className="sidebar-footer">
          <NavLink
            to="/workspaceSettings"
            end
            className={({ isActive }) =>
              isActive ? "active-item" : "normal-item"
            }
          >
            <div
              style={{
                color: "#475569",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "10px",
                paddingLeft: "10px",
                cursor: "pointer",
              }}
            >
              <Settings size={20} /> Settings
            </div>
          </NavLink>
          <button type="button" onClick={handleInvite}>
            <UserPlus size={20} /> Invite Members
          </button>
        </div>
      </aside>
      <CreateSpaceModal
        open={openCreateSpace}
        onClose={() => setOpenCreateSpace(false)}
      />
    </div>
  );
};
export default SidebarofWorkspace;
