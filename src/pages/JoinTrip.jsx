import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function JoinTrip() {
    const { token: inviteToken } = useParams();
    const navigate = useNavigate();
    const { token: authToken } = useAuth();    // removed unused `user`

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!authToken) {
            localStorage.setItem("redirectAfterLogin", `/join/${inviteToken}`);
            navigate(`/login`);
            return;
        }

        async function joinTrip() {
            setStatus("joining");
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/trips/join/${inviteToken}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                setStatus("done");
                setTimeout(() => navigate(`/trip/${res.data.trip._id}`), 1500);
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Invalid or expired invite link.");
            }
        }

        joinTrip();
    }, [inviteToken, authToken, navigate]);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logo}>✈ TripMate</div>

                {(status === "loading" || status === "joining") && (
                    <>
                        <div style={styles.icon}>🔗</div>
                        <h2 style={styles.title}>Joining Trip...</h2>
                        <p style={styles.sub}>Please wait while we add you to the group.</p>
                        <div style={styles.dots}>
                            <span style={{ ...styles.dot, animationDelay: "0s" }} />
                            <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                            <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                        </div>
                    </>
                )}

                {status === "done" && (
                    <>
                        <div style={styles.icon}>✅</div>
                        <h2 style={styles.title}>You're in!</h2>
                        <p style={styles.sub}>Redirecting you to the trip workspace...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div style={styles.icon}>❌</div>
                        <h2 style={styles.title}>Invite Error</h2>
                        <p style={styles.errorText}>{message}</p>
                        <button style={styles.btn} onClick={() => navigate("/dashboard")}>
                            Go to Dashboard
                        </button>
                    </>
                )}
            </div>

            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f9f9f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        padding: "20px",
    },
    card: {
        background: "#ffffff",
        border: "1px solid rgba(220,38,38,0.12)",
        borderRadius: "20px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
        boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
    },
    logo: {
        color: "#ef4444",
        fontSize: "1.1rem",
        fontWeight: "bold",
        marginBottom: "32px",
    },
    icon: { fontSize: "3rem", marginBottom: "16px" },
    title: {
        color: "#111111",
        fontSize: "1.5rem",
        fontWeight: "normal",
        marginBottom: "10px",
    },
    sub: {
        color: "rgba(17,17,17,0.45)",
        fontSize: "0.9rem",
        marginBottom: "24px",
    },
    errorText: {
        color: "#ef4444",
        fontSize: "0.9rem",
        marginBottom: "24px",
    },
    btn: {
        background: "#ef4444",
        border: "none",
        color: "#ffffff",
        padding: "12px 28px",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: "bold",
        fontFamily: "'Georgia', serif",
    },
    dots: { display: "flex", justifyContent: "center", gap: "8px" },
    dot: {
        display: "inline-block",
        width: "8px",
        height: "8px",
        background: "#ef4444",
        borderRadius: "50%",
        animation: "bounce 1.4s ease-in-out infinite",
    },
};
