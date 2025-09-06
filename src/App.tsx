import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Authentication imports
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/AuthPages/Login";
import Register from "./pages/AuthPages/Register";

// Interview Assistant imports
import { InterviewProvider } from "./context/InterviewContext";
import InterviewDashboard from "./pages/Interview/Dashboard";
import InterviewSession from "./pages/Interview/Session";
import InterviewResults from "./pages/Interview/Results";
import InterviewHistory from "./pages/Interview/History";
import Analytics from "./pages/Analytics";
import About from "./pages/About";

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard Layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              {/* Redirect root to interview dashboard */}
              <Route index path="/" element={<Navigate to="/interview" replace />} />

              {/* Interview Assistant Routes */}
              <Route path="/interview" element={<InterviewDashboard />} />
              <Route path="/interview/history" element={<InterviewHistory />} />
              <Route path="/interview/:id" element={<InterviewSession />} />
              <Route path="/interview/:id/results" element={<InterviewResults />} />

              {/* Analytics Page */}
              <Route path="/analytics" element={<Analytics />} />

              {/* About Page */}
              <Route path="/about" element={<About />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </InterviewProvider>
    </AuthProvider>
  );
}
