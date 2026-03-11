import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <span style={styles.logo}>✈ TripMate</span>
        <div style={styles.navLinks}>
          <button style={styles.ghostBtn} onClick={() => navigate("/login")}>Sign In</button>
          <button style={styles.solidBtn} onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        ...styles.hero,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s ease",
      }}>
        <div style={styles.badge}>✦ AI-Powered Group Travel</div>
        <h1 style={styles.heroTitle}>
          Plan trips.<br />
          Not <span style={styles.heroAccent}>arguments.</span>
        </h1>
        <p style={styles.heroSub}>
          TripMate handles the planning, the splitting, and the chaos —
          so you just show up and enjoy the trip.
        </p>
        <div style={styles.heroBtns}>
          <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
            Start Planning Free →
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={styles.statsStrip}>
        {[["🌍", "50+ Destinations"], ["👥", "Group Friendly"], ["✨", "AI Powered"], ["💸", "Smart Splits"]].map(([icon, label]) => (
          <div key={label} style={styles.statItem}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section style={styles.features}>
        {[
          { icon: "✦", title: "AI Itinerary", desc: "Describe your trip. Get a full day-by-day plan instantly, powered by GPT." },
          { icon: "◎", title: "Split Expenses", desc: "Log costs on the go. We calculate who owes whom — no math required." },
          { icon: "⬡", title: "Invite Your Crew", desc: "One magic link. Everyone joins, everyone's in sync, no sign-up friction." },
        ].map((f, i) => (
          <div key={i} style={styles.card}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(248,113,113,0.15)";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.15)";
            }}
          >
            <span style={styles.cardIcon}>{f.icon}</span>
            <h3 style={styles.cardTitle}>{f.title}</h3>
            <p style={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA BANNER */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to travel smarter?</h2>
        <p style={styles.ctaSub}>Free forever. No credit card required.</p>
        <button style={styles.ctaBtn} onClick={() => navigate("/register")}>
          Create Your First Trip →
        </button>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>✈ TripMate</span>
        <span style={styles.footerText}>Built for travellers, by travellers.</span>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#111111",
    fontFamily: "'Georgia', serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 48px",
    borderBottom: "1px solid rgba(248,113,113,0.15)",
    background: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
  },
  logo: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#ef4444",
  },
  navLinks: { display: "flex", gap: "12px" },
  ghostBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#ef4444",
    padding: "10px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "'Georgia', serif",
  },
  solidBtn: {
    background: "#ef4444",
    border: "none",
    color: "#ffffff",
    padding: "10px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    fontFamily: "'Georgia', serif",
  },
  hero: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "100px 32px 60px",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    background: "#fff5f5",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "#ef4444",
    padding: "6px 18px",
    borderRadius: "999px",
    fontSize: "0.8rem",
    marginBottom: "32px",
    letterSpacing: "0.04em",
  },
  heroTitle: {
    fontSize: "clamp(2.8rem, 6vw, 5rem)",
    lineHeight: 1.12,
    fontWeight: "normal",
    marginBottom: "24px",
    color: "#111111",
  },
  heroAccent: {
    color: "#ef4444",
    fontStyle: "italic",
  },
  heroSub: {
    fontSize: "1.1rem",
    color: "rgba(17,17,17,0.55)",
    lineHeight: 1.75,
    marginBottom: "40px",
    maxWidth: "560px",
    margin: "0 auto 40px",
  },
  heroBtns: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "#ef4444",
    border: "none",
    color: "#ffffff",
    padding: "16px 40px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Georgia', serif",
    boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
  },
  secondaryBtn: {
    background: "#fff5f5",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    padding: "16px 32px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontFamily: "'Georgia', serif",
  },
  statsStrip: {
    display: "flex",
    justifyContent: "center",
    gap: "48px",
    flexWrap: "wrap",
    padding: "28px 40px",
    background: "#fff5f5",
    borderTop: "1px solid rgba(248,113,113,0.12)",
    borderBottom: "1px solid rgba(248,113,113,0.12)",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(17,17,17,0.65)",
    fontSize: "0.9rem",
  },
  statLabel: { fontWeight: "normal" },
  features: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: "80px 40px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(248,113,113,0.15)",
    borderRadius: "20px",
    padding: "36px 28px",
    width: "280px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s, border-color 0.2s",
    cursor: "default",
  },
  cardIcon: {
    display: "block",
    fontSize: "1.8rem",
    color: "#f87171",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#111111",
  },
  cardDesc: {
    fontSize: "0.9rem",
    color: "rgba(17,17,17,0.5)",
    lineHeight: 1.65,
    margin: 0,
  },
  cta: {
    textAlign: "center",
    padding: "80px 32px",
    background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)",
    borderTop: "1px solid rgba(248,113,113,0.15)",
    borderBottom: "1px solid rgba(248,113,113,0.15)",
  },
  ctaTitle: {
    fontSize: "2rem",
    fontWeight: "normal",
    marginBottom: "12px",
    color: "#111111",
  },
  ctaSub: {
    color: "rgba(17,17,17,0.5)",
    fontSize: "0.95rem",
    marginBottom: "32px",
  },
  ctaBtn: {
    background: "#ef4444",
    border: "none",
    color: "#ffffff",
    padding: "16px 40px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Georgia', serif",
    boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 48px",
    borderTop: "1px solid rgba(248,113,113,0.12)",
    background: "#ffffff",
  },
  footerLogo: { color: "#ef4444", fontSize: "0.95rem", fontWeight: "bold" },
  footerText: { color: "rgba(17,17,17,0.35)", fontSize: "0.85rem" },
};