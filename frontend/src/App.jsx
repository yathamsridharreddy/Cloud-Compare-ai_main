import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import AIToolsDashboard from './pages/AIToolsDashboard';
import CloudDashboard from './pages/CloudDashboard';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';

  if (!token && !justLoggedIn) {
    const landingUrl = window.location.port.startsWith('517')
      ? 'http://127.0.0.1:8000/'
      : '/';
    window.location.replace(landingUrl);
    return null;
  }

  if (justLoggedIn) {
    sessionStorage.removeItem('justLoggedIn');
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
        <div className="fixed inset-0 stars-bg z-0 pointer-events-none"></div>
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><AIToolsDashboard /></ProtectedRoute>} />
              <Route path="/cloud-compare" element={<ProtectedRoute><CloudDashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;
