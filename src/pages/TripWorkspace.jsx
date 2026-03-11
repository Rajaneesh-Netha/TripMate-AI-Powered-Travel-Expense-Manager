import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Food", "Transport", "Accommodation", "Activities", "Shopping", "Misc"];
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

export default function TripWorkspace() {
    const { id: tripId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [activeTab, setActiveTab] = useState("Itinerary");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrip() {
            try {
                const res = await axios.get("http://localhost:5000/api/trips", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const found = res.data.find((t) => t._id === tripId);
                setTrip(found || null);
            } catch (err) {
                console.error("Failed to load trip:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTrip();
    }, [tripId, token]);

    const sym = trip ? (CURRENCY_SYMBOLS[trip.currency] || trip.currency) : "₹";

    if (loading) return <div style={styles.loadingPage}>Loading trip...</div>;
    if (!trip) return <div style={styles.loadingPage}>Trip not found.</div>;

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>← Dashboard</button>
                <div style={styles.navLogo}>✈ TripMate</div>
                <div />
            </nav>

            {/* Trip Header */}
            <div style={styles.tripHeader}>
                <div style={styles.tripBadge}>{trip.destination}</div>
                <h1 style={styles.tripName}>{trip.name}</h1>
                <div style={styles.tripMeta}>
                    <span>🗓 {trip.duration} days</span>
                    <span>💰 {sym}{Number(trip.budget).toLocaleString()} budget</span>
                    <span>👥 {trip.members?.length || 1} member{(trip.members?.length || 1) !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                {["Itinerary", "Expenses", "Members", "Settlement"].map((tab) => (
                    <button key={tab} style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
                {activeTab === "Itinerary" && <ItineraryTab trip={trip} token={token} sym={sym} setTrip={setTrip} />}
                {activeTab === "Expenses" && <ExpensesTab trip={trip} token={token} user={user} sym={sym} />}
                {activeTab === "Members" && <MembersTab trip={trip} />}
                {activeTab === "Settlement" && <SettlementTab trip={trip} token={token} sym={sym} />}
            </div>
        </div>
    );
}

// ── MEMBERS TAB ─────────────────────────────────────────────────────────────
function MembersTab({ trip }) {
    const [copied, setCopied] = useState(false);
    const inviteLink = trip.inviteToken ? `${window.location.origin}/join/${trip.inviteToken}` : null;

    function copyInviteLink() {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div>
            <h2 style={styles.sectionTitle}>Members</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {(trip.members || []).map((member) => {
                    const m = member.name ? member : { name: "Unknown", email: "" };
                    const initials = (m.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                    return (
                        <div key={member._id || member} style={styles.memberCard}>
                            <div style={styles.avatar}>{initials}</div>
                            <div>
                                <div style={{ color: "#111111", fontSize: "0.95rem" }}>{m.name}</div>
                                <div style={{ color: "rgba(17,17,17,0.45)", fontSize: "0.8rem" }}>{m.email}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {inviteLink && (
                <div style={styles.inviteBox}>
                    <p style={{ color: "rgba(17,17,17,0.55)", fontSize: "0.85rem", marginBottom: "12px", margin: "0 0 12px 0" }}>
                        Share this link to invite friends:
                    </p>
                    <div style={styles.inviteRow}>
                        <span style={styles.inviteLinkText}>{inviteLink}</span>
                        <button style={styles.copyBtn} onClick={copyInviteLink}>
                            {copied ? "✓ Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── EXPENSES TAB ─────────────────────────────────────────────────────────────
function ExpensesTab({ trip, token, user, sym }) {
    const [expenses, setExpenses] = useState([]);
    const [loadingExp, setLoadingExp] = useState(true);
    const [form, setForm] = useState({ description: "", amount: "", category: "Food", splitAmong: [] });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        async function fetchExpenses() {
            try {
                const res = await axios.get(`http://localhost:5000/api/expenses/${trip._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExpenses(res.data);
            } catch (err) {
                console.error("Failed to fetch expenses:", err);
            } finally {
                setLoadingExp(false);
            }
        }
        fetchExpenses();
    }, [trip._id, token]);

    function toggleMember(memberId) {
        setForm(prev => ({
            ...prev,
            splitAmong: prev.splitAmong.includes(memberId)
                ? prev.splitAmong.filter(id => id !== memberId)
                : [...prev.splitAmong, memberId],
        }));
    }

    async function handleAddExpense() {
        setFormError("");
        if (!form.description || !form.amount) { setFormError("Please enter a description and amount."); return; }
        if (form.splitAmong.length === 0) { setFormError("Select at least one person to split with."); return; }
        setSubmitting(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/expenses",
                { trip: trip._id, description: form.description, amount: Number(form.amount), category: form.category, splitAmong: form.splitAmong },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExpenses([res.data, ...expenses]);
            setForm({ description: "", amount: "", category: "Food", splitAmong: [] });
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to add expense.");
        } finally {
            setSubmitting(false);
        }
    }

    const categoryColors = {
        Food: "#ef4444", Transport: "#2563eb", Accommodation: "#7c3aed",
        Activities: "#059669", Shopping: "#db2777", Misc: "#6b7280",
    };

    return (
        <div>
            <h2 style={styles.sectionTitle}>Expenses</h2>

            {/* Form */}
            <div style={styles.expForm}>
                <h3 style={styles.subSectionTitle}>Add Expense</h3>
                {formError && <div style={styles.errorBox}>{formError}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Description</label>
                        <input style={styles.input} placeholder="e.g. Dinner" value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Amount ({sym})</label>
                        <input style={styles.input} type="number" placeholder="0.00" value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Category</label>
                    <select style={{ ...styles.input, cursor: "pointer" }} value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Split Among</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {(trip.members || []).map((member) => {
                            const mid = member._id || member;
                            const selected = form.splitAmong.includes(mid);
                            return (
                                <button key={mid} onClick={() => toggleMember(mid)} style={{
                                    ...styles.splitChip,
                                    background: selected ? "#fff5f5" : "#f8f8f8",
                                    border: selected ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(0,0,0,0.1)",
                                    color: selected ? "#ef4444" : "rgba(17,17,17,0.5)",
                                }}>
                                    {member.name || "Member"}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button style={{ ...styles.actionBtn, opacity: submitting ? 0.7 : 1 }}
                    onClick={handleAddExpense} disabled={submitting}>
                    {submitting ? "Adding..." : "+ Add Expense"}
                </button>
            </div>

            {/* List */}
            <div style={{ marginTop: "28px" }}>
                {loadingExp ? (
                    <p style={styles.hint}>Loading expenses...</p>
                ) : expenses.length === 0 ? (
                    <p style={styles.hint}>No expenses yet. Add the first one above.</p>
                ) : (
                    expenses.map((exp) => (
                        <div key={exp._id} style={styles.expCard}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <span style={{ ...styles.categoryBadge, background: `${categoryColors[exp.category] || "#6b7280"}18`, color: categoryColors[exp.category] || "#6b7280", borderColor: `${categoryColors[exp.category] || "#6b7280"}40` }}>
                                        {exp.category}
                                    </span>
                                    <div style={{ color: "#111111", fontSize: "1rem", marginTop: "6px" }}>{exp.description}</div>
                                    <div style={{ color: "rgba(17,17,17,0.4)", fontSize: "0.8rem", marginTop: "4px" }}>
                                        Paid by {exp.paidBy?.name || "Unknown"} · Split {exp.splitAmong?.length || 1} ways
                                    </div>
                                </div>
                                <div style={{ color: "#ef4444", fontSize: "1.1rem", fontWeight: "bold" }}>
                                    {sym}{Number(exp.amount).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ── SETTLEMENT TAB ───────────────────────────────────────────────────────────
function SettlementTab({ trip, token, sym }) {
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [settled, setSettled] = useState({});

    useEffect(() => {
        async function fetchSettlement() {
            try {
                const res = await axios.get(`http://localhost:5000/api/expenses/settle/${trip._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSettlements(res.data);
            } catch (err) {
                setError("Could not load settlement data."); console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSettlement();
    }, [trip._id, token]);

    return (
        <div>
            <h2 style={styles.sectionTitle}>Settlement</h2>
            <p style={{ color: "rgba(17,17,17,0.45)", fontSize: "0.9rem", marginBottom: "28px" }}>
                Minimum transactions needed to settle all debts.
            </p>
            {loading && <p style={styles.hint}>Calculating...</p>}
            {error && <div style={styles.errorBox}>{error}</div>}
            {!loading && settlements.length === 0 && !error && (
                <div style={styles.emptySettle}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎉</div>
                    <p style={{ color: "rgba(17,17,17,0.45)" }}>All settled up! No outstanding debts.</p>
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {settlements.map((s, i) => {
                    const key = `${s.from}-${s.to}-${i}`;
                    const isSettled = settled[key];
                    return (
                        <div key={key} style={{ ...styles.settleCard, opacity: isSettled ? 0.4 : 1 }}>
                            <div style={styles.settleRow}>
                                <div>
                                    <span style={styles.settleName}>{s.from}</span>
                                    <span style={styles.settleOwes}> owes </span>
                                    <span style={styles.settleName}>{s.to}</span>
                                </div>
                                <span style={styles.settleAmount}>{sym}{Number(s.amount).toFixed(2)}</span>
                            </div>
                            <button
                                style={{ ...styles.settledBtn, ...(isSettled ? styles.settledBtnDone : {}) }}
                                onClick={() => setSettled(prev => ({ ...prev, [key]: !prev[key] }))}>
                                {isSettled ? "✓ Settled" : "Mark as Settled"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── ITINERARY TAB ────────────────────────────────────────────────────────────
function ItineraryTab({ trip, token, sym, setTrip }) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [openDay, setOpenDay] = useState(0);
    const itinerary = trip.itinerary || [];

    async function generateItinerary() {
        setError(""); setGenerating(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/trips/${trip._id}/itinerary`, {},
                { headers: { Authorization: `Bearer ${token}` } });
            setTrip(prev => ({ ...prev, itinerary: res.data.itinerary }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate itinerary. Check your OpenAI key.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0, margin: 0 }}>Itinerary</h2>
                <button style={{ ...styles.actionBtn, opacity: generating ? 0.7 : 1 }}
                    onClick={generateItinerary} disabled={generating}>
                    {generating ? "✨ Generating..." : itinerary.length > 0 ? "↺ Regenerate" : "✨ Generate with AI"}
                </button>
            </div>
            {error && <div style={styles.errorBox}>{error}</div>}
            {generating && (
                <div style={styles.generatingBox}>
                    <div style={{ color: "#ef4444", fontSize: "1rem" }}>✨ Crafting your perfect itinerary...</div>
                    <p style={{ color: "rgba(17,17,17,0.4)", fontSize: "0.85rem", marginTop: "8px", marginBottom: 0 }}>
                        This may take 15–30 seconds
                    </p>
                </div>
            )}
            {!generating && itinerary.length === 0 && (
                <div style={styles.emptyItinerary}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🗺️</div>
                    <p style={{ color: "rgba(17,17,17,0.5)", marginBottom: "8px" }}>No itinerary yet.</p>
                    <p style={{ color: "rgba(17,17,17,0.35)", fontSize: "0.85rem", margin: 0 }}>
                        Click "Generate with AI" to create a day-by-day plan for {trip.destination}.
                    </p>
                </div>
            )}
            {!generating && itinerary.map((day, dayIndex) => (
                <div key={dayIndex} style={styles.dayCard}>
                    <div style={styles.dayHeader} onClick={() => setOpenDay(openDay === dayIndex ? -1 : dayIndex)}>
                        <span style={styles.dayLabel}>Day {day.day}</span>
                        <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{openDay === dayIndex ? "▲" : "▼"}</span>
                    </div>
                    {openDay === dayIndex && (
                        <div style={styles.activitiesList}>
                            {(day.activities || []).map((act, actIndex) => (
                                <div key={actIndex} style={styles.activityCard}>
                                    <div style={styles.activityTime}>{act.time}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={styles.activityTitle}>{act.title}</div>
                                        <div style={styles.activityDesc}>{act.description}</div>
                                    </div>
                                    {act.estimatedCost != null && (
                                        <div style={styles.activityCost}>~{sym}{act.estimatedCost}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
    page: { minHeight: "100vh", background: "#f9f9f9", fontFamily: "'Georgia', serif", color: "#111111" },
    loadingPage: { minHeight: "100vh", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(17,17,17,0.4)", fontFamily: "'Georgia', serif" },
    navbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", background: "#ffffff", borderBottom: "1px solid rgba(239,68,68,0.1)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 },
    backBtn: { background: "transparent", border: "none", color: "rgba(17,17,17,0.45)", cursor: "pointer", fontFamily: "'Georgia', serif", fontSize: "0.9rem" },
    navLogo: { color: "#ef4444", fontWeight: "bold", fontSize: "1rem" },
    tripHeader: { padding: "40px 40px 32px", borderBottom: "1px solid rgba(239,68,68,0.08)", background: "linear-gradient(180deg, #fff5f5 0%, #f9f9f9 100%)" },
    tripBadge: { display: "inline-block", background: "#fff5f5", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px", padding: "4px 14px", fontSize: "0.8rem", marginBottom: "12px" },
    tripName: { fontSize: "2rem", fontWeight: "normal", margin: "0 0 12px 0", color: "#111111" },
    tripMeta: { display: "flex", gap: "24px", color: "rgba(17,17,17,0.5)", fontSize: "0.9rem", flexWrap: "wrap" },
    tabBar: { display: "flex", gap: "4px", padding: "14px 32px", background: "#ffffff", borderBottom: "1px solid rgba(239,68,68,0.08)", overflowX: "auto" },
    tabBtn: { background: "transparent", border: "none", color: "rgba(17,17,17,0.45)", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Georgia', serif", fontSize: "0.95rem", whiteSpace: "nowrap", transition: "all 0.15s" },
    tabActive: { background: "#fff5f5", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" },
    tabContent: { maxWidth: "860px", margin: "0 auto", padding: "40px 24px" },
    sectionTitle: { fontSize: "1.4rem", fontWeight: "normal", marginBottom: "24px", color: "#111111" },
    subSectionTitle: { fontSize: "0.95rem", fontWeight: "normal", marginBottom: "16px", color: "rgba(17,17,17,0.6)" },
    hint: { color: "rgba(17,17,17,0.35)", textAlign: "center", padding: "40px 0", fontSize: "0.9rem" },
    errorBox: { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" },
    // Members
    memberCard: { display: "flex", alignItems: "center", gap: "14px", background: "#ffffff", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "12px", padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#fff5f5", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: "0.85rem", flexShrink: 0 },
    inviteBox: { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "20px" },
    inviteRow: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
    inviteLinkText: { color: "rgba(17,17,17,0.55)", fontSize: "0.82rem", wordBreak: "break-all", flex: 1, background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.15)" },
    copyBtn: { background: "#ef4444", border: "none", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: "bold", fontSize: "0.85rem", flexShrink: 0 },
    // Expenses
    expForm: { background: "#ffffff", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" },
    fieldGroup: { marginBottom: "16px" },
    label: { display: "block", color: "rgba(17,17,17,0.55)", fontSize: "0.82rem", marginBottom: "6px" },
    input: { width: "100%", background: "#f8f8f8", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", padding: "10px 14px", color: "#111111", fontSize: "0.9rem", fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box" },
    splitChip: { padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "0.83rem", fontFamily: "'Georgia', serif", transition: "all 0.15s" },
    actionBtn: { background: "#ef4444", border: "none", color: "#ffffff", padding: "11px 22px", borderRadius: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold", fontFamily: "'Georgia', serif", transition: "opacity 0.2s" },
    expCard: { background: "#ffffff", border: "1px solid rgba(239,68,68,0.08)", borderRadius: "12px", padding: "16px 20px", marginBottom: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    categoryBadge: { display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", border: "1px solid" },
    // Settlement
    settleCard: { background: "#ffffff", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", transition: "opacity 0.3s" },
    settleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" },
    settleName: { color: "#111111", fontSize: "0.95rem" },
    settleOwes: { color: "rgba(17,17,17,0.4)", fontSize: "0.85rem" },
    settleAmount: { color: "#ef4444", fontWeight: "bold", fontSize: "1.05rem" },
    settledBtn: { background: "#f8f8f8", border: "1px solid rgba(0,0,0,0.1)", color: "rgba(17,17,17,0.55)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Georgia', serif", fontSize: "0.83rem", transition: "all 0.2s" },
    settledBtnDone: { background: "#f0fdf4", border: "1px solid rgba(5,150,105,0.3)", color: "#059669" },
    emptySettle: { textAlign: "center", padding: "60px 20px" },
    // Itinerary
    generatingBox: { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "28px", textAlign: "center", marginBottom: "24px" },
    emptyItinerary: { textAlign: "center", padding: "60px 20px" },
    dayCard: { background: "#ffffff", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "14px", marginBottom: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    dayHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", cursor: "pointer", userSelect: "none" },
    dayLabel: { color: "#111111", fontSize: "1rem", fontWeight: "bold" },
    activitiesList: { borderTop: "1px solid rgba(239,68,68,0.08)", padding: "16px 22px", background: "#fefefe", display: "flex", flexDirection: "column", gap: "16px" },
    activityCard: { display: "flex", gap: "16px", alignItems: "flex-start" },
    activityTime: { color: "#ef4444", fontSize: "0.8rem", minWidth: "60px", paddingTop: "2px", flexShrink: 0 },
    activityTitle: { color: "#111111", fontSize: "0.95rem", marginBottom: "4px" },
    activityDesc: { color: "rgba(17,17,17,0.5)", fontSize: "0.83rem", lineHeight: "1.5" },
    activityCost: { color: "rgba(239,68,68,0.75)", fontSize: "0.83rem", flexShrink: 0, paddingTop: "2px" },
};
