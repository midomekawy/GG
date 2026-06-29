import { useState } from "react";
import { 
  Search, 
  Shield, 
  Lightbulb, 
  Receipt, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  Mail,
  MessagesSquare
} from "lucide-react";
import "./settings.css";

const HelpSettings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const popularSearches = ["API keys", "Billing cycle", "Team permissions"];

  const categories = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Security",
      description: "2FA, session management and data privacy.",
      color: "#6366F1"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Productivity Tips",
      description: "Maximize your workflow with power-user tricks.",
      color: "#6366F1"
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      title: "Billing Help",
      description: "Invoices, payment methods, and plan upgrades.",
      color: "#6366F1"
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "API Docs",
      description: "Technical resources and endpoint guides.",
      color: "#6366F1"
    }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I reset my account password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. We'll send you an email with instructions to create a new password."
    },
    {
      id: 2,
      question: "How to invite team members to my workspace?",
      answer: "Go to your workspace settings and click on 'Members'. Enter the email addresses of your team members and select their roles before sending the invitation."
    },
    {
      id: 3,
      question: "What integrations are currently supported?",
      answer: "We currently support Slack, Google Calendar, GitHub, Notion, and Trello integrations. More integrations are being added regularly."
    },
    {
      id: 4,
      question: "Can I export my data to a CSV file?",
      answer: "Yes! Navigate to Settings > Data Export to download your tasks, projects, and time tracking data in CSV format."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="settings-content-wrapper">
      {/* Header */}
      <div className="settings-page-header" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
          How can we help?
        </h2>
      </div>

      {/* Search Section */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <Search 
            className="w-5 h-5" 
            style={{ 
              position: "absolute", 
              left: "1rem", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "#9CA3AF"
            }} 
          />
          <input
            type="text"
            placeholder="Search the knowledge base for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3rem",
              border: "1px solid #E5E7EB",
              borderRadius: "0.75rem",
              fontSize: "0.9375rem",
              background: "white",
              outline: "none",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#6366F1"}
            onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
          />
        </div>
        
        {/* Popular Searches */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>Popular searches:</span>
          {popularSearches.map((tag, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(tag)}
              style={{
                padding: "0.375rem 0.875rem",
                fontSize: "0.75rem",
                color: "#374151",
                background: "#F3F4F6",
                border: "1px solid #E5E7EB",
                borderRadius: "1rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#E5E7EB";
                e.target.style.borderColor = "#D1D5DB";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#F3F4F6";
                e.target.style.borderColor = "#E5E7EB";
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Help Categories */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
          Popular Help Categories
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {categories.map((category, index) => (
            <div
              key={index}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#EDE9FE",
                  borderRadius: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6366F1",
                  marginBottom: "0.75rem"
                }}
              >
                {category.icon}
              </div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                {category.title}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "#6B7280", lineHeight: "1.4" }}>
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
            Frequently Asked Questions
          </h3>
          <button
            style={{
              fontSize: "0.75rem",
              color: "#6366F1",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            View all FAQ
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>
                  {faq.question}
                </span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-4 h-4" style={{ color: "#6B7280", flexShrink: 0 }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: "#6B7280", flexShrink: 0 }} />
                )}
              </button>
              {openFaq === faq.id && (
                <div
                  style={{
                    padding: "0 1.25rem 1rem",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    lineHeight: "1.5",
                    borderTop: "1px solid #F3F4F6",
                    paddingTop: "0.75rem"
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support CTA Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          borderRadius: "1rem",
          padding: "2.5rem",
          textAlign: "center",
          color: "white"
        }}
      >
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
          Still need help?
        </h3>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          Can't find what you're looking for? Our friendly support team is available 24/7 to assist you with any questions.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "white",
              color: "#6366F1",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#F3F4F6"}
            onMouseLeave={(e) => e.target.style.background = "white"}
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "#1F2937",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#374151"}
            onMouseLeave={(e) => e.target.style.background = "#1F2937"}
          >
            <MessagesSquare className="w-4 h-4" />
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
