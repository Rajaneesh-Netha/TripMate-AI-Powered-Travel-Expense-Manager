import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", destination: "", duration: "", budget: "", currency: "INR" });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        async function fetchTrips() {
            try {
                const res = await axios.get("http://localhost:5000/api/trips", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTrips(res.data);
            } catch (err) {
                console.error("Failed to fetch trips:", err);
            } finally {
                setLoadingTrips(false);
            }
        }
        fetchTrips();
    }, [token]);

    function handleFormChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCreateTrip() {
        setFormError("");
        if (!form.name || !form.destination || !form.duration || !form.budget) {
            setFormError("Please fill in all fields."); return;
        }
        setCreating(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/trips",
                { name: form.name, destination: form.destination, duration: Number(form.duration), budget: Number(form.budget), currency: form.currency },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTrips([res.data, ...trips]);
            setShowModal(false);
            setForm({ name: "", destination: "", duration: "", budget: "", currency: "INR" });
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create trip.");
        } finally {
            setCreating(false);
        }
    }

    function handleLogout() { logout(); navigate("/"); }

    const currencySymbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navLogo}>✈ TripMate</div>
                <div style={styles.navRight}>
                    <span style={styles.navUser}>👤 {user?.name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            {/* Content */}
            <div style={styles.content}>
                <div style={styles.headerRow}>
                    <div>
                        <h1 style={styles.heading}>Your Trips</h1>
                        <p style={styles.subheading}>Plan, split, and explore together.</p>
                    </div>
                    <button style={styles.createBtn} onClick={() => setShowModal(true)}>+ Create New Trip</button>
                </div>

                {loadingTrips ? (
                    <p style={styles.hint}>Loading trips...</p>
                ) : trips.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>✈</div>
                        <h3 style={styles.emptyTitle}>No trips yet</h3>
                        <p style={styles.emptyText}>Create your first trip and invite your group!</p>
                        <button style={styles.createBtn} onClick={() => setShowModal(true)}>+ Create Trip</button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {trips.map((trip) => (
                            <div
                                key={trip._id}
                                style={styles.card}
                                onClick={() => navigate(`/trip/${trip._id}`)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(239,68,68,0.12)";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.1)";
                                }}
                            >
                                <div style={styles.cardBadge}>{trip.destination}</div>
                                <h3 style={styles.cardTitle}>{trip.name}</h3>
                                <div style={styles.cardMeta}>
                                    <span>🗓 {trip.duration} days</span>
                                    <span>{currencySymbols[trip.currency] || trip.currency}{Number(trip.budget).toLocaleString()}</span>
                                </div>
                                <div style={styles.cardFooter}>
                                    <span style={styles.memberCount}>👥 {trip.members?.length || 1} member{(trip.members?.length || 1) !== 1 ? "s" : ""}</span>
                                    <span style={styles.arrow}>→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.backdrop} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Create New Trip</h2>
                        <p style={styles.modalSub}>Fill in the details to get started.</p>
                        {formError && <div style={styles.errorBox}>{formError}</div>}

                        {[
                            { label: "Trip Name", name: "name", placeholder: "e.g. Goa Summer Trip", type: "text" },
                            { label: "Destination", name: "destination", placeholder: "e.g. Goa, India", type: "text" },
                            { label: "Duration (days)", name: "duration", placeholder: "e.g. 5", type: "number" },
                            { label: "Budget", name: "budget", placeholder: "e.g. 15000", type: "number" },
                        ].map((field) => (
                            <div key={field.name} style={styles.fieldGroup}>
                                <label style={styles.label}>{field.label}</label>
                                <input style={styles.input} type={field.type} name={field.name}
                                    placeholder={field.placeholder} value={form[field.name]} onChange={handleFormChange} />
                            </div>
                        ))}

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Currency</label>
                            <select style={{ ...styles.input, cursor: "pointer" }} name="currency" value={form.currency} onChange={handleFormChange}>
                                {["INR", "USD", "EUR", "GBP", "JPY"].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div style={styles.modalBtns}>
                            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                            <button style={{ ...styles.createBtn, opacity: creating ? 0.7 : 1 }} onClick={handleCreateTrip} disabled={creating}>
                                {creating ? "Creating..." : "Create Trip →"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "#f9f9f9", fontFamily: "'Georgia', serif", color: "#111111" },
    navbar: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px", background: "#ffffff",
        borderBottom: "1px solid rgba(239,68,68,0.1)",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    },
    navLogo: { color: "#ef4444", fontSize: "1.1rem", fontWeight: "bold" },
    navRight: { display: "flex", alignItems: "center", gap: "16px" },
    navUser: { color: "rgba(17,17,17,0.55)", fontSize: "0.9rem" },
    logoutBtn: {
        background: "#fff5f5", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444",
        padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
        fontSize: "0.85rem", fontFamily: "'Georgia', serif",
    },
    content: { maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" },
    headerRow: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: "40px", flexWrap: "wrap", gap: "16px",
    },
    heading: { fontSize: "2rem", fontWeight: "normal", margin: "0 0 6px 0", color: "#111111" },
    subheading: { color: "rgba(17,17,17,0.45)", fontSize: "0.95rem", margin: 0 },
    createBtn: {
        background: "#ef4444", border: "none", color: "#ffffff",
        padding: "12px 24px", borderRadius: "10px", cursor: "pointer",
        fontSize: "0.95rem", fontWeight: "bold", fontFamily: "'Georgia', serif",
    },
    hint: { color: "rgba(17,17,17,0.35)", textAlign: "center", marginTop: "60px" },
    emptyState: { textAlign: "center", padding: "80px 20px" },
    emptyIcon: { fontSize: "4rem", marginBottom: "16px", opacity: 0.2 },
    emptyTitle: { fontSize: "1.4rem", fontWeight: "normal", marginBottom: "8px", color: "#111111" },
    emptyText: { color: "rgba(17,17,17,0.45)", marginBottom: "32px", fontSize: "0.95rem" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
    card: {
        background: "#ffffff", border: "1px solid rgba(239,68,68,0.1)",
        borderRadius: "16px", padding: "24px", cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    },
    cardBadge: {
        display: "inline-block", background: "#fff5f5", color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px",
        padding: "4px 12px", fontSize: "0.78rem", marginBottom: "12px",
    },
    cardTitle: { fontSize: "1.1rem", fontWeight: "normal", marginBottom: "12px", color: "#111111", margin: "0 0 12px 0" },
    cardMeta: { display: "flex", gap: "16px", color: "rgba(17,17,17,0.5)", fontSize: "0.85rem", marginBottom: "16px", flexWrap: "wrap" },
    cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" },
    memberCount: { fontSize: "0.82rem", color: "rgba(17,17,17,0.4)" },
    arrow: { color: "#ef4444", fontSize: "1.1rem" },
    backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" },
    modal: {
        background: "#ffffff", border: "1px solid rgba(239,68,68,0.12)",
        borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "460px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 16px 64px rgba(0,0,0,0.12)",
    },
    modalTitle: { fontSize: "1.5rem", fontWeight: "normal", marginBottom: "8px", color: "#111111", margin: "0 0 8px 0" },
    modalSub: { color: "rgba(17,17,17,0.45)", fontSize: "0.9rem", marginBottom: "28px", margin: "0 0 28px 0" },
    fieldGroup: { marginBottom: "18px" },
    label: { display: "block", color: "rgba(17,17,17,0.6)", fontSize: "0.83rem", marginBottom: "6px" },
    input: {
        width: "100%", background: "#f8f8f8", border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "10px", padding: "11px 14px", color: "#111111",
        fontSize: "0.9rem", fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box",
    },
    errorBox: { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" },
    modalBtns: { display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" },
    cancelBtn: {
        background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "rgba(17,17,17,0.55)",
        padding: "12px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "'Georgia', serif", fontSize: "0.9rem",
    },
};
