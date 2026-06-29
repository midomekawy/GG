import SidebarofWorkspace from "./SidebarofWorkspace";
import "./workSpaceStyle.css";
import "./workspace.css";
import { PlusIcon, Trash2 } from "lucide-react";
import IconImg from "../../assets/images/Background.png";
import IconImg1 from "../../assets/images/Background1.png";
import IconImg2 from "../../assets/images/Background2.png";
import PersonImg from "../../assets/images/Alex Morgan.png";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useSpaces } from "../../context/SpacesContext";
import Swal from "sweetalert2";
import CreateSpaceModal from "../SpacesComponent/CreateSpaceModal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  addWorkspaceMember,
  getApiErrorMessage,
  getDeletedWorkspaces,
  getMemberPermissions,
  getWorkspaceById,
  getWorkspaceMembers,
  normalizeWorkspaceDto,
  parseWorkspacesResponse,
  removeWorkspaceMember,
  restoreWorkspace,
  softDeleteWorkspace,
  updateMemberPermissions,
  updateWorkspace,
  WORKSPACE_VISIBILITY,
} from "../../services/api";

function parseMembersResponse(res) {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.members)) return d.members;
  return [];
}

function normalizeMemberRow(m) {
  const memberUserId = String(
    m.userId ??
      m.UserId ??
      m.memberUserId ??
      m.MemberUserId ??
      m.id ??
      ""
  );
  const permissions = m.permissions ?? m.Permissions ?? [];
  const role = m.role ?? m.Role ?? detectRole(permissions);
  return {
    memberUserId,
    email: m.email ?? m.Email ?? "",
    name:
      m.displayName ??
      m.name ??
      m.Name ??
      m.userName ??
      m.email ??
      m.Email ??
      "Member",
    avatar: m.avatarUrl ?? m.AvatarUrl ?? PersonImg,
    role,
    permissions,
  };
}

function extractPermissionsPayload(res) {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.permissions)) return d.permissions;
  if (Array.isArray(d?.Permissions)) return d.Permissions;
  return [];
}

const COMMON_PERMISSIONS = [
  { value: "ViewWorkspace", label: "View workspace" },
  { value: "EditWorkspace", label: "Edit workspace" },
  { value: "DeleteWorkspace", label: "Delete workspace" },
  { value: "ManageMembers", label: "Manage members" },
  { value: "ViewTasks", label: "View tasks" },
  { value: "CreateTasks", label: "Create tasks" },
  { value: "EditTasks", label: "Edit tasks" },
  { value: "DeleteTasks", label: "Delete tasks" },
  { value: "ViewSpaces", label: "View spaces" },
  { value: "CreateSpaces", label: "Create spaces" },
  { value: "EditSpaces", label: "Edit spaces" },
  { value: "DeleteSpaces", label: "Delete spaces" },
  { value: "ViewNotes", label: "View notes" },
  { value: "CreateNotes", label: "Create notes" },
  { value: "EditNotes", label: "Edit notes" },
  { value: "DeleteNotes", label: "Delete notes" },
];

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

const ROLE_PERMISSIONS = {
  owner: COMMON_PERMISSIONS.map((p) => p.value),
  admin: [
    "ViewWorkspace",
    "EditWorkspace",
    "ManageMembers",
    "ViewTasks",
    "CreateTasks",
    "EditTasks",
    "DeleteTasks",
    "ViewSpaces",
    "CreateSpaces",
    "EditSpaces",
    "DeleteSpaces",
    "ViewNotes",
    "CreateNotes",
    "EditNotes",
    "DeleteNotes",
  ],
  member: [
    "ViewWorkspace",
    "ViewTasks",
    "CreateTasks",
    "EditTasks",
    "ViewSpaces",
    "ViewNotes",
    "CreateNotes",
    "EditNotes",
  ],
};

function detectRole(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) return "member";
  const perms = new Set(permissions);
  const isOwner = ROLE_PERMISSIONS.owner.every((p) => perms.has(p));
  if (isOwner) return "owner";
  const isAdmin = ROLE_PERMISSIONS.admin.every((p) => perms.has(p));
  if (isAdmin) return "admin";
  return "member";
}

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspace();
  const { spaces, deleteSpace, updateSpace } = useSpaces();
  const [openCreateSpace, setOpenCreateSpace] = useState(false);
  const [actvBtn, setActvBtn] = useState({
    wsActivity: false,
    members: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    iconCode: "",
    slug: "",
  });
  const [users, setUsers] = useState([]);
  const [deletedList, setDeletedList] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState(null);
  const [permList, setPermList] = useState([]);
  const [permLoading, setPermLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");
  const [newPerm, setNewPerm] = useState("");

  const loadWorkspace = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    setError("");
    try {
      const [wsRes, memRes] = await Promise.all([
        getWorkspaceById(activeWorkspaceId),
        getWorkspaceMembers(activeWorkspaceId),
      ]);
      const w = normalizeWorkspaceDto(wsRes?.data?.data ?? wsRes?.data);
      if (w) {
        setForm({
          name: w.name,
          description: w.description,
          iconCode: w.iconCode || "",
          slug: (w.name || "workspace")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .slice(0, 40),
        });
        setActiveWorkspace(w);
      }
      const raw = parseMembersResponse(memRes);
      setUsers(raw.map(normalizeMemberRow).filter((u) => u.memberUserId));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, setActiveWorkspace]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  async function loadDeleted() {
    try {
      const res = await getDeletedWorkspaces();
      const raw = parseWorkspacesResponse(res);
      setDeletedList(raw.map(normalizeWorkspaceDto).filter(Boolean));
    } catch {
      setDeletedList([]);
    }
  }

  useEffect(() => {
    if (showDeleted) loadDeleted();
  }, [showDeleted]);

  async function handleSaveGeneral(e) {
    e.preventDefault();
    if (!activeWorkspaceId) return;
    setSaving(true);
    setError("");
    try {
      await updateWorkspace(activeWorkspaceId, {
        name: form.name.trim(),
        description: form.description.trim(),
        iconCode: form.iconCode || "folder",
        visibility: WORKSPACE_VISIBILITY.PRIVATE,
      });
      setActiveWorkspace({
        id: activeWorkspaceId,
        name: form.name.trim(),
        description: form.description.trim(),
        iconCode: form.iconCode,
        visibility: WORKSPACE_VISIBILITY.PRIVATE,
      });
      await Swal.fire({
        icon: "success",
        text: "Workspace updated.",
        confirmButtonColor: "#5e2ec4",
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite() {
    if (!activeWorkspaceId) return;

    const { value: formValues } = await Swal.fire({
      title: "Invite member",
      html: `
        <input id="swal-email" class="swal2-input" type="email" placeholder="Email address">
        <select id="swal-role" class="swal2-input" style="margin-top:12px;width:auto;min-width:200px;">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: "#5e2ec4",
      focusConfirm: false,
      preConfirm: () => {
        const email = document.getElementById('swal-email').value;
        const role = document.getElementById('swal-role').value;
        if (!email || !email.includes('@')) {
          Swal.showValidationMessage('Please enter a valid email');
          return false;
        }
        return { email, role };
      }
    });

    if (!formValues) return;
    const { email, role } = formValues;
    try {
      const res = await addWorkspaceMember(activeWorkspaceId, {
        "Email": String(email).trim(),
      });
      await loadWorkspace();

      // Apply role permissions to the newly invited member if we can determine their user id
      const newMember = parseMembersResponse(res)[0] || users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (newMember?.memberUserId) {
        await updateMemberPermissions(activeWorkspaceId, newMember.memberUserId, {
          permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member,
        });
      }

      await loadWorkspace();
      await Swal.fire({ icon: "success", text: `Member invited as ${role}.` });
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    }
  }

  async function handleRemoveMember(email) {
    if (!activeWorkspaceId) return;
    const c = await Swal.fire({
      icon: "warning",
      title: "Remove member?",
      text: email,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!c.isConfirmed) return;
    try {
      await removeWorkspaceMember(activeWorkspaceId, { email });
      await loadWorkspace();
    } catch (e) {
      if (e?.response?.status === 404) {
        await Swal.fire({
          icon: "error",
          title: "Failed to remove member",
          text: "Member or Workspace no longer exists.",
        });
      } else {
        await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
      }
    }
  }

  async function openPermissions(member) {
    if (!activeWorkspaceId || !member?.memberUserId) return;
    setPermTarget(member);
    setPermOpen(true);
    setPermLoading(true);
    setNewPerm("");
    try {
      const res = await getMemberPermissions(
        activeWorkspaceId,
        member.memberUserId
      );
      const list = extractPermissionsPayload(res);
      const perms = Array.isArray(list) ? [...list] : [];
      setPermList(perms);
      setSelectedRole(detectRole(perms));
    } catch {
      setPermList([]);
      setSelectedRole("member");
    } finally {
      setPermLoading(false);
    }
  }

  async function savePermissions() {
    if (!activeWorkspaceId || !permTarget?.memberUserId) return;
    setPermLoading(true);
    try {
      const permissionsToSave = ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS.member;
      await updateMemberPermissions(activeWorkspaceId, permTarget.memberUserId, {
        permissions: permissionsToSave,
      });
      setPermOpen(false);
      await Swal.fire({ icon: "success", text: `Role updated to ${ROLES.find(r => r.value === selectedRole)?.label || selectedRole}.` });
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    } finally {
      setPermLoading(false);
    }
  }

  function addPermission(value) {
    const t = String(value ?? newPerm).trim();
    if (!t || permList.includes(t)) return;
    setPermList((p) => [...p, t]);
    setNewPerm("");
  }

  function removePermission(p) {
    setPermList((list) => list.filter((x) => x !== p));
  }

  async function handleArchive() {
    if (!activeWorkspaceId) return;
    const c = await Swal.fire({
      icon: "warning",
      title: "Archive workspace?",
      text: "It will be hidden until restored from deleted list.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!c.isConfirmed) return;
    try {
      await softDeleteWorkspace(activeWorkspaceId);
      await Swal.fire({ icon: "success", text: "Workspace archived." });
    } catch (e) {
      await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
    }
  }

  async function handleRestore(id) {
    try {
      await restoreWorkspace(id);
      await loadDeleted();
      await Swal.fire({ icon: "success", text: "Workspace restored." });
    } catch (e) {
      if (e?.response?.status === 403) {
        await Swal.fire({
          icon: "error",
          title: "Action Denied",
          text: "Only the workspace owner can restore this item.",
        });
      } else {
        await Swal.fire({ icon: "error", text: getApiErrorMessage(e) });
      }
    }
  }

  async function handleArchiveSpace(spaceId) {
    if (!activeWorkspaceId) return;
    const c = await Swal.fire({
      icon: "warning",
      title: "Archive space?",
      text: "This space will be hidden until restored from deleted list.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!c.isConfirmed) return;
    try {
      deleteSpace(spaceId);
      await Swal.fire({ icon: "success", text: "Space archived." });
    } catch (e) {
      await Swal.fire({ icon: "error", text: "Failed to archive space." });
    }
  }

  async function handleRenameSpace(space) {
    const { value: newName } = await Swal.fire({
      title: "Rename Space",
      input: "text",
      inputValue: space.name,
      showCancelButton: true,
      confirmButtonColor: "#5e2ec4",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Space name is required";
        }
      },
    });
    if (!newName || !newName.trim()) return;
    try {
      updateSpace(space.id, { name: newName.trim() });
      await Swal.fire({ icon: "success", text: "Space renamed successfully." });
    } catch (e) {
      await Swal.fire({ icon: "error", text: "Failed to rename space." });
    }
  }

  if (!activeWorkspaceId) {
    return (
      <div className="app-container">
        <SidebarofWorkspace />
        <div
          className="main-container"
          style={{ marginInlineStart: "150px", padding: "24px" }}
        >
          <p style={{ color: "#64748b" }}>
            No workspace selected.{" "}
            <Link to="/mainworkspace" style={{ color: "#5e2ec4" }}>
              Choose a workspace
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container workspace-module" dir="auto">
      <SidebarofWorkspace />
      <div
        className="main-container"
        style={{ marginInlineStart: "150px" }}
      >
        <h1 style={{ marginBottom: "0" }}>Workspace Settings</h1>
        <p style={{ color: "#64748B", marginTop: "0" }}>
          Manage your workspace configuration, team members, and preferences.
        </p>
        {error ? (
          <div
            className="workspace-api-banner workspace-api-banner--error"
            role="alert"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            {error}
          </div>
        ) : null}
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading workspace…</p>
        ) : null}

        <form className="general-box" onSubmit={handleSaveGeneral}>
          <h4>General</h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "10px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                width: "min(100%, 360px)",
                flex: "1",
              }}
            >
              <label htmlFor="ws-name">Workspace Name</label>
              <input
                id="ws-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                width: "min(100%, 360px)",
                flex: "1",
              }}
            >
              <label htmlFor="ws-slug">Workspace URL slug</label>
              <input
                id="ws-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                disabled={loading}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "5px",
              width: "95%",
            }}
          >
            <label htmlFor="ws-desc">Description</label>
            <textarea
              id="ws-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              disabled={loading}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              width: "95%",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              disabled={saving || loading}
              style={{
                backgroundColor: "#5e2ec4",
                color: "white",
                border: "none",
                width: "141px",
                height: "40px",
                borderRadius: "10px",
                fontSize: "16px",
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.85 : 1,
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="spaces-box">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h4>Manage Spaces</h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                justifyContent: "center",
                textAlign: "center",
                color: "#888af4",
                cursor: "pointer",
              }}
              onClick={() => setOpenCreateSpace(true)}
            >
              <span style={{ marginTop: "5px" }}>
                <PlusIcon size={16} />
              </span>
              <span>New Space</span>
            </div>
          </div>
          {spaces && spaces.length > 0 ? (
            spaces.map((space) => (
              <div key={space.id} className="box">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <img src={IconImg} alt="" />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <span>{space.name}</span>
                    <span style={{ color: "#a6afbd" }}>
                      {space.createdAt
                        ? `Updated ${Math.floor((Date.now() - new Date(space.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                        : "Updated recently"}
                    </span>
                  </div>
                </div>
                <div className="buttons">
                  <button type="button" onClick={() => handleRenameSpace(space)}>Rename</button>
                  <button type="button" onClick={() => handleArchiveSpace(space.id)}>Archive</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#8c9196", fontSize: "14px" }}>No spaces created yet in this workspace.</p>
          )}
        </div>

        <div className="members-box">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h4>Members Access</h4>
            <button
              type="button"
              onClick={handleInvite}
              style={{
                backgroundColor: "#5e2ec4",
                color: "white",
                border: "none",
                width: "141px",
                height: "40px",
                borderRadius: "10px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Invite Member
            </button>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th
                  style={{
                    padding: "16px 24px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  USER
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ROLE
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  STATUS
                </th>
                <th style={{ padding: "16px 24px" }} />
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.memberUserId}
                  style={{
                    backgroundColor: "#ffffff",
                    borderBottom:
                      index === users.length - 1 ? "none" : "1px solid #f1f5f9",
                  }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <img
                        src={user.avatar}
                        alt=""
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#0f172a",
                            fontSize: "14px",
                          }}
                        >
                          {user.name}
                        </span>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <button
                      type="button"
                      onClick={() => openPermissions(user)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role || "Member"}
                    </button>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Active
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(user.email)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        padding: "4px",
                      }}
                      aria-label={`Remove ${user.name}`}
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="notifications-box">
          <h4>Notifications</h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "15px",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "5px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span>Workspace Activity</span>
              <span style={{ color: "#64748b" }}>
                Notify everyone when new tasks or notes are created.
              </span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setActvBtn((p) => ({ ...p, wsActivity: !p.wsActivity }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setActvBtn((p) => ({ ...p, wsActivity: !p.wsActivity }));
              }}
              className={
                actvBtn.wsActivity ? "toggle-switch active" : "toggle-switch"
              }
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "15px",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "5px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span>Members Updates</span>
              <span style={{ color: "#64748b" }}>
                Alert admins when members join or leave the workspace.
              </span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setActvBtn((p) => ({ ...p, members: !p.members }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setActvBtn((p) => ({ ...p, members: !p.members }));
              }}
              className={
                actvBtn.members ? "toggle-switch active" : "toggle-switch"
              }
            />
          </div>
        </div>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <button
            type="button"
            onClick={() => setShowDeleted((s) => !s)}
            style={{
              background: "none",
              border: "none",
              color: "#5e2ec4",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {showDeleted ? "Hide" : "Show"} deleted workspaces
          </button>
          {showDeleted ? (
            <div
              style={{
                marginTop: "8px",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "#f8fafc",
              }}
            >
              {deletedList.length === 0 ? (
                <span style={{ color: "#64748b" }}>No deleted workspaces.</span>
              ) : (
                deletedList.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <span>{w.name || `Workspace ${w.id}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRestore(w.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #5e2ec4",
                        background: "#fff",
                        color: "#5e2ec4",
                        cursor: "pointer",
                      }}
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="danger-zone">
          <h4 style={{ color: "#dc2626" }}>Danger Zone</h4>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid #feeaea",
              paddingTop: "10px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h4 style={{ margin: "0" }}>Archive Workspace</h4>
              <p style={{ margin: "0", color: "#a6afbd" }}>
                This will hide the workspace from all members. You can restore
                it later from deleted workspaces if the API supports it.
              </p>
            </div>
            <button
              type="button"
              onClick={handleArchive}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                height: "38px",
                width: "160px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Archive Workspace
            </button>
          </div>
        </div>
      </div>

      <Dialog open={permOpen} onClose={() => setPermOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Member Role{permTarget?.name ? ` — ${permTarget.name}` : ""}
        </DialogTitle>
        <DialogContent>
          {permLoading ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : (
            <>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
                Choose a role for this member. Each role has a predefined set of permissions.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      fontSize: "15px",
                      color: "#0f172a",
                      background: selectedRole === role.value ? "#f5f3ff" : "#fff",
                      borderColor: selectedRole === role.value ? "#8b5cf6" : "#e2e8f0",
                    }}
                  >
                    <input
                      type="radio"
                      name="member-role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={() => setSelectedRole(role.value)}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{role.label}</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        {role.value === "owner" && "Full access to workspace, members, and settings."}
                        {role.value === "admin" && "Can manage tasks, spaces, notes, and members except deleting the workspace."}
                        {role.value === "member" && "Can view and create tasks, spaces, and notes."}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                Permissions: {permList.length > 0 ? permList.join(", ") : "None"}
              </p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={savePermissions}
            disabled={permLoading}
            sx={{ backgroundColor: "#5e2ec4" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <CreateSpaceModal
        open={openCreateSpace}
        onClose={() => setOpenCreateSpace(false)}
      />
    </div>
  );
};
export default WorkspaceSettings;
