export default function DonePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5", display: "flex", flexDirection: "column" }}>
      <header style={{ backgroundColor: "#1a2d6c", height: "60px", display: "flex", alignItems: "center", padding: "0 24px", gap: "12px" }}>
        <span style={{ color: "#d65a31", fontWeight: 800, fontSize: "20px" }}>TQ</span>
        <span style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>
          Work Analysis &amp; Task Intelligence
        </span>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>✓</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1a2d6c", margin: "0 0 12px" }}>
            Thank you!
          </h1>
          <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.7, margin: "0 0 8px" }}>
            Your task analysis has been submitted successfully.
          </p>
          <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, margin: 0 }}>
            The TQ team will review your responses and be in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
