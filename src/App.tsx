import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResourceProvider } from './contexts/ResourceContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerDashboard from './pages/ManagerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import Login from './pages/Login';
import Profile from './components/Profile';
import Report from './pages/Report';
import Engineers from './pages/Engineers';
import Projects from './pages/Projects';
import Assignments from './pages/Assignments';

function App() {
  return (
    <ResourceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />}></Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/report" element={<Report />} />
            <Route path="/engineers" element={<Engineers />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/assignments" element={<Assignments />} />
          </Route>
        </Routes>
      </Router>
    </ResourceProvider>
  );
}

export default App;
