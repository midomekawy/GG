import "./settings.css";

const SettAbout = () => {
  return (
    <div className="settings-content-wrapper" style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "100%",
      padding: "2rem"
    }}>
      <div
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "1.5rem",
          padding: "3rem 4rem",
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)"
        }}
      >
        {/* Mission Badge */}
        <div
          style={{
            display: "inline-block",
            background: "#EDE9FE",
            color: "#6366F1",
            fontSize: "0.6875rem",
            fontWeight: "700",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.5rem 1rem",
            borderRadius: "2rem",
            marginBottom: "1.5rem"
          }}
        >
          OUR MISSION
        </div>

        {/* Logo */}
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            color: "#6366F1",
            letterSpacing: "-0.04em",
            lineHeight: "1",
            marginBottom: "2rem"
          }}
        >
          AiGenda
        </h1>

        {/* Paragraphs */}
        <p
          style={{
            fontSize: "1rem",
            color: "#6B7280",
            lineHeight: "1.7",
            marginBottom: "1.25rem"
          }}
        >
          AIgenda is designed as a minimalist tool to help you reclaim your concentration. By eliminating digital noise, it enables you to enter a state of deep work where your most important tasks receive the undivided attention they deserve.
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "#6B7280",
            lineHeight: "1.7",
            marginBottom: "2.5rem"
          }}
        >
          Beyond simple task tracking, AIgenda's philosophy is built around organized thinking. It offers a clean and flexible structure to map out ideas, helping users move from mental clutter to focused, streamlined productivity—without the friction of complex, traditional tools.
        </p>

        {/* Footer Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            marginBottom: "1rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #F3F4F6"
          }}
        >
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#6366F1"}
            onMouseLeave={(e) => e.target.style.color = "#6B7280"}
          >
            Terms
          </a>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#6366F1"}
            onMouseLeave={(e) => e.target.style.color = "#6B7280"}
          >
            Privacy
          </a>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <a
            href="#"
            style={{
              fontSize: "0.875rem",
              color: "#6B7280",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "#6366F1"}
            onMouseLeave={(e) => e.target.style.color = "#6B7280"}
          >
            Support
          </a>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
          © 2024 FocusFlow Inc. Designed for clarity.
        </p>
      </div>
    </div>
  );
};

export default SettAbout;
