import { createContext, useContext, useState } from "react";

// 1. Create the context object — this is the "shared box" React components can read from
const AuthContext = createContext(null);

// 2. AuthProvider wraps your entire app and provides auth state to every child
export function AuthProvider({ children }) {
    // Initialize from localStorage so state survives page refresh
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;  // parse the JSON string back to object
    });

    // login() is called after a successful register or login API call
    function login(newToken, newUser) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }

    // logout() clears everything
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }

    // The value object is what every component using useAuth() will receive
    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Custom hook — instead of writing useContext(AuthContext) everywhere, just do useAuth()
export function useAuth() {
    return useContext(AuthContext);
}
