import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";     // wrap everything with auth
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TripWorkspace from "./pages/TripWorkspace";
import JoinTrip from "./pages/JoinTrip";

function App() {
  return (
    // AuthProvider makes user/token available to every component in the tree
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — anyone can access */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:token" element={<JoinTrip />} />

          {/* Protected routes — redirects to /login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip/:id" element={<TripWorkspace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;