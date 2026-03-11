import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: form.name, email: form.email, password: form.password,
      });
      const { token, user } = response.data;
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.brand}>✈ TripMate</div>
        <h2 style={styles.heroText}>Plan smarter.<br />Travel together.</h2>
        <p style={styles.heroSub}>Split expenses, generate itineraries,<br />and explore the world with your crew.</p>
        <div style={styles.pillRow}>
          {["✦ AI Itinerary", "💸 Smart Splits", "👥 Group Travel"].map(p => (
            <span key={p} style={styles.pill}>{p}</span>
          ))}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardLogo} onClick={() => navigate("/")}>✈ TripMate</div>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.sub}>Start planning your first trip in minutes.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} type="text" name="name"
              placeholder="Rajaneesh" value={form.name} onChange={handleChange} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password"
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
          </div>

          <button style={{ ...styles.btn, opacity: loading ? 0.75 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", fontFamily: "'Georgia', serif" },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(145deg, #fca5a5 0%, #f87171 50%, #ef4444 100%)",
    display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "60px 56px", color: "#ffffff",
  },
  brand: { fontSize: "1.1rem", fontWeight: "bold", marginBottom: "44px", opacity: 0.95 },
  heroText: { fontSize: "2.4rem", fontWeight: "normal", lineHeight: 1.3, margin: "0 0 20px 0" },
  heroSub: { fontSize: "0.98rem", opacity: 0.8, lineHeight: 1.75, margin: "0 0 32px 0" },
  pillRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  pill: { background: "rgba(255,255,255,0.2)", borderRadius: "999px", padding: "6px 14px", fontSize: "0.78rem", backdropFilter: "blur(4px)" },
  rightPanel: { flex: 1, background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  card: { background: "#ffffff", border: "1px solid rgba(248,113,113,0.18)", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 32px rgba(239,68,68,0.08)" },
  cardLogo: { color: "#ef4444", fontSize: "1rem", fontWeight: "bold", marginBottom: "28px", cursor: "pointer", display: "inline-block" },
  title: { color: "#111111", fontSize: "1.6rem", fontWeight: "normal", margin: "0 0 8px 0" },
  sub: { color: "rgba(17,17,17,0.45)", fontSize: "0.9rem", margin: "0 0 28px 0" },
  errorBox: { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" },
  fieldGroup: { marginBottom: "18px" },
  label: { display: "block", color: "rgba(17,17,17,0.55)", fontSize: "0.83rem", marginBottom: "7px" },
  input: { width: "100%", background: "#fafafa", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#111111", fontSize: "0.95rem", fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", background: "#ef4444", border: "none", color: "#ffffff", padding: "13px", borderRadius: "10px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold", fontFamily: "'Georgia', serif", marginTop: "8px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(239,68,68,0.2)" },
  switchText: { color: "rgba(17,17,17,0.4)", fontSize: "0.88rem", textAlign: "center", margin: 0 },
  link: { color: "#ef4444", cursor: "pointer", textDecoration: "underline" },
};