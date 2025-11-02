import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

// Embed markdown templates as raw strings (no fetch on file://)
import privacy from "./templates/privacy-policy.md?raw";
import tos from "./templates/terms-of-service.md?raw";
import ai from "./templates/ai-use-disclosure.md?raw";
import cookie from "./templates/cookie-policy.md?raw";
import retention from "./templates/retention-security-checklist.md?raw";
import acceptable from "./templates/acceptable-use-policy.md?raw";
import dmca from "./templates/dmca-policy.md?raw";
import dpa from "./templates/data-processing-agreement.md?raw";
import subprocessors from "./templates/subprocessor-list.md?raw";

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
  POLICY_VERSION: "1.0",
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

// Helper to convert markdown to plain text for PDF/DOCX
function markdownToPlainText(md) {
  return md
    .replace(/^#{1,6}\s+(.+)$/gm, '$1\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    .trim();
}

export default function App() {
  const [vals, setVals] = useState(DEFAULTS);
  const [exportFormat, setExportFormat] = useState("markdown");
  const [isGenerating, setIsGenerating] = useState(false);
  const onChange = (e) => setVals(v => ({ ...v, [e.target.name]: e.target.value }));

  const files = [
    ["privacy-policy", "Privacy Policy", privacy],
    ["terms-of-service", "Terms of Service", tos],
    ["ai-use-disclosure", "AI Use Disclosure", ai],
    ["cookie-policy", "Cookie Policy", cookie],
    ["retention-security-checklist", "Data Retention & Security Checklist", retention],
    ["acceptable-use-policy", "Acceptable Use Policy", acceptable],
    ["dmca-policy", "DMCA Copyright Policy", dmca],
    ["data-processing-agreement", "Data Processing Agreement", dpa],
    ["subprocessor-list", "Subprocessor List", subprocessors],
  ];

  const generatePDF = (name, title, content) => {
    const pdf = new jsPDF();
    const text = markdownToPlainText(fill(content, vals));
    const lines = pdf.splitTextToSize(text, 180);

    pdf.setFontSize(16);
    pdf.text(title, 15, 15);
    pdf.setFontSize(10);
    pdf.text(lines, 15, 30);

    return pdf.output('blob');
  };

  const generateDOCX = async (name, title, content) => {
    const text = markdownToPlainText(fill(content, vals));
    const paragraphs = text.split('\n\n').map(p =>
      new Paragraph({
        children: [new TextRun(p)],
        spacing: { after: 200 }
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          ...paragraphs
        ]
      }]
    });

    return await Packer.toBlob(doc);
  };

  const generateZip = async () => {
    setIsGenerating(true);
    const zip = new JSZip();

    for (const [name, title, content] of files) {
      const filledContent = fill(content, vals);

      if (exportFormat === "markdown") {
        zip.file(`${name}.md`, filledContent);
      } else if (exportFormat === "pdf") {
        const pdfBlob = generatePDF(name, title, content);
        zip.file(`${name}.pdf`, pdfBlob);
      } else if (exportFormat === "docx") {
        const docxBlob = await generateDOCX(name, title, content);
        zip.file(`${name}.docx`, docxBlob);
      } else if (exportFormat === "all") {
        zip.file(`markdown/${name}.md`, filledContent);
        const pdfBlob = generatePDF(name, title, content);
        zip.file(`pdf/${name}.pdf`, pdfBlob);
        const docxBlob = await generateDOCX(name, title, content);
        zip.file(`docx/${name}.docx`, docxBlob);
      }
    }

    const readmeContent = `# Startup Policy Pack

Generated for: ${vals.COMPANY_NAME || "Your Company"}
Version: ${vals.POLICY_VERSION}
Date: ${vals.LAST_UPDATED}
Format: ${exportFormat.toUpperCase()}

## Documents Included

${files.map(([, title]) => `- ${title}`).join('\n')}

## Instructions

1. Review each document carefully
2. Customize any sections marked with brackets
3. Have legal counsel review before publishing
4. Update the "Last Updated" date when making changes

**Informational only — not legal advice.**
`;

    zip.file("README.md", readmeContent);

    const blob = await zip.generateAsync({ type: "blob" });
    const companySlug = (vals.COMPANY_NAME || "company").replace(/\s+/g,"-");
    const formatSuffix = exportFormat === "all" ? "all-formats" : exportFormat;
    const zipName = `policy-pack-${companySlug}-v${vals.POLICY_VERSION}-${formatSuffix}.zip`;
    saveAs(blob, zipName);
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

  const Field = ({ name, label, placeholder = "", required = false, type = "text" }) => {
    const inputId = `field-${name}`;

    return (
      <label htmlFor={inputId} style={{ display: "block" }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6
        }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </div>
        <input
          id={inputId}
          type={type}
          className="form-input"
          name={name}
          value={vals[name]}
          onChange={onChange}
          placeholder={placeholder}
        />
      </label>
    );
  };

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
            Generate 9 GDPR-compliant legal documents in minutes with export options (Markdown, PDF, DOCX)
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

          <Section title="Export Settings">
            <div>
              <label htmlFor="policy-version" style={{ display: "block" }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6
                }}>
                  Policy Version
                </div>
                <input
                  id="policy-version"
                  type="text"
                  className="form-input"
                  name="POLICY_VERSION"
                  value={vals.POLICY_VERSION}
                  onChange={onChange}
                  placeholder="1.0"
                />
              </label>
            </div>

            <div>
              <label htmlFor="export-format" style={{ display: "block" }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6
                }}>
                  Export Format <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <select
                  id="export-format"
                  className="form-input"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="markdown">Markdown (.md) - Editable text format</option>
                  <option value="pdf">PDF (.pdf) - Print-ready documents</option>
                  <option value="docx">Word (.docx) - Microsoft Word format</option>
                  <option value="all">All Formats - MD, PDF, and DOCX</option>
                </select>
              </label>
            </div>
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
