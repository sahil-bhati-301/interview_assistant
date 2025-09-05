import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Interview Assistant imports
import { InterviewProvider } from "./context/InterviewContext";
import InterviewDashboard from "./pages/Interview/Dashboard";
import InterviewSession from "./pages/Interview/Session";
import InterviewResults from "./pages/Interview/Results";
import InterviewHistory from "./pages/Interview/History";

export default function App() {
  return (
    <InterviewProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Redirect root to interview dashboard */}
            <Route index path="/" element={<Navigate to="/interview" replace />} />

            {/* Interview Assistant Routes */}
            <Route path="/interview" element={<InterviewDashboard />} />
            <Route path="/interview/history" element={<InterviewHistory />} />
            <Route path="/interview/:id" element={<InterviewSession />} />
            <Route path="/interview/:id/results" element={<InterviewResults />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </InterviewProvider>
  );
}
