import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute: if no token → redirect to /login, otherwise render the page
export default function ProtectedRoute() {
    const { token } = useAuth();

    // <Outlet /> renders whatever child route is matched (e.g. Dashboard, TripWorkspace)
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}
