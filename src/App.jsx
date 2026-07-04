import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import UserProvider from './context/UserContext';
import WorkspaceProvider, { useWorkspace } from './context/WorkspaceContext';
import { SpacesProvider } from './context/SpacesContext';
import { TasksProvider } from './context/TasksContext';

// Eagerly loaded for immediate display
import Login from './components/Authentication/Login';

// Lazy load feature components
const Signup = lazy(() => import('./components/Authentication/Signup'));
const ForgotPassword = lazy(() => import('./components/Authentication/ForgotPassword'));
const RestPassword = lazy(() => import('./components/Authentication/ResetPassword'));
const SignConfirmEmail = lazy(() => import('./components/Authentication/SignConfirmEmail'));

const Home = lazy(() => import('./components/HomeComponent/Home'));
const Chatbot = lazy(() => import('./components/ChatbotComponent/Chatbot'));
const Analytics = lazy(() => import('./components/AnalyticsComponent/Dashboard'));
const Community = lazy(() => import('./components/CommunityComponent/Community'));
const Connect = lazy(() => import('./components/ConnectComponent/Connect'));
const ConnectedAppsCallback = lazy(() => import('./components/ConnectComponent/ConnectedAppsCallback'));
const IntegrationsSettings = lazy(() => import('./components/SettingsComponent/IntegrationsSettings'));
const Profile = lazy(() => import('./components/ProfileComponent/Profile'));

const Settings = lazy(() => import('./components/SettingsComponent/Settings'));
const NotificationsSettings = lazy(() => import('./components/SettingsComponent/NotificationsSettings'));
const SecuritySettings = lazy(() => import('./components/SettingsComponent/SecuritySettings'));
const HelpSettings = lazy(() => import('./components/SettingsComponent/HelpSettings'));
const UpdateSystemSettings = lazy(() => import('./components/SettingsComponent/UpdateSystemSettings'));
const InviteFriendSettings = lazy(() => import('./components/SettingsComponent/InviteFriendSettings'));
const SettAbout = lazy(() => import('./components/SettingsComponent/SettAbout'));

const SpaceAnalytics = lazy(() => import('./components/SpacesComponent/SpaceAnalytics'));
const SpaceNotes = lazy(() => import('./components/SpacesComponent/SpaceNotes'));
const SpaceTasks = lazy(() => import('./components/SpacesComponent/SpaceTasks'));
const MainWorkspace = lazy(() => import('./components/WorkspacesComponent/MainWorkspace'));
const SidebarofWorkspace = lazy(() => import('./components/WorkspacesComponent/SidebarofWorkspace'));
const WorkspaceSettings = lazy(() => import('./components/WorkspacesComponent/WorkspaceSettings'));
const WorkspaceOverview = lazy(() => import('./components/WorkspacesComponent/WorkspaceOverview'));
const SpaceOverview = lazy(() => import('./components/SpacesComponent/SpaceOverview'));
const WorkspaceTaskSpecific = lazy(() => import('./components/TaskComponent/WorkspaceTaskSpecific'));
const TextNote = lazy(() => import('./components/NoteComponent/TextNote'));
const ImgNote = lazy(() => import('./components/NoteComponent/ImgNote'));
const DrawNote = lazy(() => import('./components/NoteComponent/DrawNote'));
const Setup = lazy(() => import('./components/focusMode/Setup'));
const InFocusMode = lazy(() => import('./components/focusMode/InFocusMode'));
const SessionCompletion = lazy(() => import('./components/focusMode/SessionCompletion'));

const SpacesProviderWithWorkspace = ({ children }) => {
  const { activeWorkspaceId } = useWorkspace();
  return <SpacesProvider workspaceId={activeWorkspaceId}>{children}</SpacesProvider>;
};

// Fallback component for Suspense
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <WorkspaceProvider>
          <SpacesProviderWithWorkspace>
            <TasksProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path='/home' element={<Home />} />
                  {/* Authentication */}
                  <Route path='/login' element={<Login />} />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/forgotpassword' element={<ForgotPassword />} />
                  <Route path='/Auth/reset-pss' element={<RestPassword />} />
                  <Route path='/Auth/confirm-email' element={<SignConfirmEmail />} />
                  {/* Workspace */}
                  <Route path='/workspaceoverview' element={<WorkspaceOverview />} />
                  <Route path='/mainworkspace' element={<MainWorkspace />} />
                  <Route path='/workspaceAnalytics' element={<SpaceAnalytics />} />
                  <Route path='/workspaceNotes' element={<SpaceNotes />} />
                  <Route path='/textnote' element={<TextNote />} />
                  <Route path='/workspaceTasks' element={<SpaceTasks />} />
                  <Route path='/workspaceSidebar' element={<SidebarofWorkspace />} />
                  <Route path='/workspaceSettings' element={<WorkspaceSettings />} />
                  <Route path='/spaceoverview' element={<SpaceOverview />} />
                  <Route path='/workspacetaskspecific' element={<WorkspaceTaskSpecific />} />
                  <Route path='/workspace/:workspaceId/space/:spaceId/task/:taskId' element={<WorkspaceTaskSpecific />} />
                  <Route path='/drawnote' element={<DrawNote />} />
                  {/* Focus Mode */}
                  <Route path='/focussetup' element={<Setup />} />
                  <Route path='/infocusmode' element={<InFocusMode />} />
                  <Route path='/focuscompletion' element={<SessionCompletion />} />
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />}>
                    <Route index element={<NotificationsSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    <Route path="integrations" element={<IntegrationsSettings />} />
                    <Route path="help" element={<HelpSettings />} />
                    <Route path="updates" element={<UpdateSystemSettings />} />
                    <Route path="invite" element={<InviteFriendSettings />} />
                    <Route path="about" element={<SettAbout />} />
                  </Route>

                  {/**/}
                  <Route path='/analytics' element={<Analytics />} />
                  <Route path='/community' element={<Community />} />
                  <Route path='/connect' element={<Connect />} />
                  <Route path='/connected-apps' element={<ConnectedAppsCallback />} />
                  <Route path='/chatbot' element={<Chatbot />} />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/settAbout' element={<SettAbout />} />

                </Routes>
              </Suspense>
            </TasksProvider>
          </SpacesProviderWithWorkspace>
        </WorkspaceProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  )
}

export default App;
