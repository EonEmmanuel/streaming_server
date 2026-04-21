import { Link, Navigate, Route, Routes } from 'react-router-dom';
import LivePage from './pages/LivePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TestStreamPage from './pages/TestStreamPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Live Streaming Platform</h1>
        <nav>
          <Link to="/admin">Admin</Link>
          <Link to="/test-stream">Test Stream</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/test-stream" element={<TestStreamPage />} />
          <Route path="/live/:streamKey" element={<LivePage />} />
          <Route path="*" element={<Navigate to="/test-stream" replace />} />
        </Routes>
      </main>
    </div>
  );
}
