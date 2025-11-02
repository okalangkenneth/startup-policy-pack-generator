import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Embed markdown templates as raw strings (no fetch on file://)
import privacy from "./templates/privacy-policy.md?raw";
import tos from "./templates/terms-of-service.md?raw";
import ai from "./templates/ai-use-disclosure.md?raw";
import cookie from "./templates/cookie-policy.md?raw";
import retention from "./templates/retention-security-checklist.md?raw";

const DEFAULTS = {
  COMPANY_NAME: "",
  PRODUCT_NAME: "",
  WEBSITE_URL: "",
  CONTACT_EMAIL: "",
  COMPANY_ADDRESS: "",
  DPO_NAME: "",
  DPO_EMAIL: "",
  PAYMENT_PROCESSOR: "Stripe",
  PROCESSORS_URL: "",
  RETENTION_SUMMARY: "Account lifetime + 12 months",
  SUPERVISORY_AUTHORITY_NAME: "Integritetsskyddsmyndigheten (IMY)",
  SUPERVISORY_AUTHORITY_URL: "https://www.imy.se/",
  COOKIE_POLICY_URL: "",
  LAST_UPDATED: new Date().toISOString().slice(0,10),
  SERVICE_DESCRIPTION: "Hosted web application providing [what it does]",
  PRICING_URL: "",
  REFUND_POLICY_URL: "",
  GOVERNING_LAW: "Sweden",
  VENUE: "Stockholm, Sweden",
  AI_USE_AREAS: "content assistance, summarization",
  VALUE_PROPOSITION: "faster drafting and review",
  AREA_1: "content generation",
  AREA_2: "classification/tagging",
  AREA_3: "spam detection",
  AI_PROVIDERS: "OpenAI, Anthropic, Azure OpenAI",
  ANALYTICS_TOOL: "Plausible",
  AD_TOOL: "—",
  COOKIE_RETENTION: "13 months",
  RETENTION_ACCOUNT: "12 months",
  RETENTION_LOGS: "90 days",
  RETENTION_SUPPORT: "24 months",
  DELETION_FREQUENCY: "weekly",
  ANONYMIZATION_DELAY: "30 days",
  SECURITY_CONTACT_EMAIL: "",
  IR_TRIAGE_HOURS: "72",
  BACKUP_FREQUENCY: "daily"
};

function fill(template, map) {
  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\[${k}\\]`, "g"), v ?? "");
  }
  return out;
}

export default function App() {
  const [vals, setVals] = useState(DEFAULTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const onChange = (e) => setVals(v => ({ ...v, [e.target.name]: e.target.value }));

  const generateZip = async () => {
    setIsGenerating(true);
    const zip = new JSZip();

    const files = [
      ["privacy-policy.md", privacy],
      ["terms-of-service.md", tos],
      ["ai-use-disclosure.md", ai],
      ["cookie-policy.md", cookie],
      ["retention-security-checklist.md", retention],
    ];

    for (const [name, content] of files) {
      zip.file(name, fill(content, vals));
    }

    zip.file("README.md",
`# Startup Policy Pack

Generated for: ${vals.COMPANY_NAME} on ${vals.LAST_UPDATED}.
Open each .md, review, and publish.

**Informational only — not legal advice.**
`);

    const blob = await zip.generateAsync({ type: "blob" });
    const name = `policy-pack-${(vals.COMPANY_NAME || "company").replace(/\s+/g,"-")}.zip`;
    saveAs(blob, name);
    setIsGenerating(false);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
      padding: "40px 16px",
    },
    card: {
      maxWidth: 800,
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: 16,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      overflow: "hidden",
    },
    header: {
      background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
      color: "#ffffff",
      padding: "40px 32px",
      textAlign: "center",
    },
    title: {
      margin: 0,
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 8,
    },
    subtitle: {
      margin: 0,
      fontSize: 16,
      opacity: 0.95,
      fontWeight: 400,
    },
    content: {
      padding: "32px",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: "#1a1a1a",
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: "2px solid #4a5568",
    },
    fieldGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 16,
    },
    button: {
      width: "100%",
      padding: "16px 32px",
      fontSize: 16,
      fontWeight: 600,
      color: "#ffffff",
      background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 4px 15px rgba(45, 55, 72, 0.4)",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(45, 55, 72, 0.6)",
    },
    footer: {
      marginTop: 24,
      padding: 16,
      background: "#f8f9fa",
      borderRadius: 8,
      textAlign: "center",
    },
    footerText: {
      margin: 0,
      fontSize: 13,
      color: "#666",
      lineHeight: 1.6,
    },
  };

  const Field = ({ name, label, placeholder = "", required = false, type = "text" }) => (
    <label style={{ display: "block" }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 6
      }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      <input
        type={type}
        style={{
          width: "100%",
          padding: "12px",
          border: "2px solid #e5e7eb",
          borderRadius: 8,
          fontSize: 15,
          transition: "border-color 0.2s, box-shadow 0.2s",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4a5568";
          e.target.style.boxShadow = "0 0 0 3px rgba(74, 85, 104, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
        name={name}
        value={vals[name]}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );

  const Section = ({ title, children }) => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.fieldGrid}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Startup Policy Pack</h1>
          <p style={styles.subtitle}>
            Generate GDPR-compliant privacy policies, terms of service, and compliance documents in minutes
          </p>
        </header>

        <div style={styles.content}>
          <Section title="Company Information">
            <Field name="COMPANY_NAME" label="Company Name" required placeholder="Acme Inc." />
            <Field name="PRODUCT_NAME" label="Product/App Name" required placeholder="MyApp" />
            <Field name="WEBSITE_URL" label="Website URL" required placeholder="https://example.com" type="url" />
            <Field name="SERVICE_DESCRIPTION" label="Service Description" placeholder="Web app for project management" />
          </Section>

          <Section title="Contact Details">
            <Field name="CONTACT_EMAIL" label="Contact Email" required placeholder="contact@example.com" type="email" />
            <Field name="COMPANY_ADDRESS" label="Company Address" required placeholder="123 Main St, City, Country" />
            <Field name="SECURITY_CONTACT_EMAIL" label="Security Contact" placeholder="security@example.com" type="email" />
            <Field name="DPO_EMAIL" label="Data Protection Officer Email" placeholder="dpo@example.com" type="email" />
          </Section>

          <Section title="Legal & Compliance">
            <Field name="GOVERNING_LAW" label="Governing Law" placeholder="Sweden" />
            <Field name="VENUE" label="Legal Venue" placeholder="Stockholm, Sweden" />
            <Field name="SUPERVISORY_AUTHORITY_NAME" label="Supervisory Authority" placeholder="Your GDPR authority" />
            <Field name="SUPERVISORY_AUTHORITY_URL" label="Authority URL" placeholder="https://authority.com" type="url" />
          </Section>

          <Section title="Business Details">
            <Field name="PRICING_URL" label="Pricing Page URL" placeholder="https://example.com/pricing" type="url" />
            <Field name="REFUND_POLICY_URL" label="Refund Policy URL" placeholder="https://example.com/refunds" type="url" />
            <Field name="PAYMENT_PROCESSOR" label="Payment Processor" placeholder="Stripe" />
            <Field name="PROCESSORS_URL" label="Subprocessors List URL" placeholder="https://example.com/processors" type="url" />
          </Section>

          <Section title="Data & Privacy Settings">
            <Field name="RETENTION_SUMMARY" label="Data Retention Period" placeholder="Account lifetime + 12 months" />
            <Field name="ANALYTICS_TOOL" label="Analytics Tool" placeholder="Plausible, Google Analytics" />
            <Field name="COOKIE_RETENTION" label="Cookie Retention" placeholder="13 months" />
            <Field name="COOKIE_POLICY_URL" label="Cookie Policy URL" placeholder="https://example.com/cookies" type="url" />
          </Section>

          <Section title="AI Usage (if applicable)">
            <Field name="AI_PROVIDERS" label="AI Providers" placeholder="OpenAI, Anthropic, Azure OpenAI" />
            <Field name="AI_USE_AREAS" label="AI Use Cases" placeholder="content assistance, summarization" />
          </Section>

          <button
            onClick={generateZip}
            disabled={isGenerating}
            style={{
              ...styles.button,
              opacity: isGenerating ? 0.7 : 1,
              cursor: isGenerating ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => !isGenerating && (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            {isGenerating ? "Generating..." : "Generate Policy Pack ZIP"}
          </button>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              <strong>Note:</strong> This generator creates informational templates only and does not constitute legal advice.
              Please review all generated documents with your legal counsel before publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
