import { useMemo, useState } from "react";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { supportApi } from "../services/api";
import "../Styles/commerce-premium.css";

const TRADE_EMAIL = "trade@hedjcommerce.com"; // TODO: replace with the final public trade inbox.

const businessTypes = [
  "Interior Designer",
  "Architect",
  "Real Estate Developer",
  "Hospitality",
  "Office / Commercial",
  "Retail / Showroom",
  "Other",
];

const projectTypes = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Office",
  "Bulk Furniture Order",
  "Custom Furniture Request",
  "Other",
];

const benefits = [
  {
    icon: "sell",
    title: "Trade pricing",
    text: "Preferred purchasing support for approved trade and project accounts.",
  },
  {
    icon: "architecture",
    title: "Project consultation",
    text: "Collaborate on specifications, room planning, and sourcing direction.",
  },
  {
    icon: "inventory_2",
    title: "Bulk coordination",
    text: "Coordinate multi-room, hospitality, office, or staged delivery orders.",
  },
  {
    icon: "new_releases",
    title: "Early collection access",
    text: "Preview new pieces and limited collection releases for upcoming projects.",
  },
  {
    icon: "support_agent",
    title: "Dedicated support",
    text: "Route project questions to a focused trade support workflow.",
  },
  {
    icon: "travel_explore",
    title: "Custom sourcing",
    text: "Request special finishes, materials, or project-specific furniture direction.",
  },
];

const initialForm = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  businessType: "Interior Designer",
  website: "",
  projectType: "Residential",
  estimatedBudget: "",
  message: "",
};

const buildMailto = (form) => {
  const subject = encodeURIComponent(`Trade Program Application: ${form.businessName || form.name}`);
  const body = encodeURIComponent(
    [
      `Full name: ${form.name}`,
      `Business: ${form.businessName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Business type: ${form.businessType}`,
      `Website / Instagram: ${form.website || "Not provided"}`,
      `Project type: ${form.projectType}`,
      `Estimated budget: ${form.estimatedBudget || "Not provided"}`,
      "",
      form.message,
    ].join("\n"),
  );
  return `mailto:${TRADE_EMAIL}?subject=${subject}&body=${body}`;
};

const TradeProgram = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const mailtoHref = useMemo(() => buildMailto(form), [form]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitResult(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.businessName.trim()) nextErrors.businessName = "Business name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!form.message.trim()) nextErrors.message = "Tell us about your project.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);
    try {
      const response = await supportApi.createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: "Trade Program",
        message: [
          form.message,
          "",
          `Business: ${form.businessName}`,
          `Business type: ${form.businessType}`,
          `Website / Instagram: ${form.website || "Not provided"}`,
          `Project type: ${form.projectType}`,
          `Estimated budget: ${form.estimatedBudget || "Not provided"}`,
        ].join("\n"),
        source: "trade_program",
        metadata: {
          businessName: form.businessName,
          businessType: form.businessType,
          website: form.website,
          projectType: form.projectType,
          estimatedBudget: form.estimatedBudget,
        },
      });
      setSubmitResult({
        tone: "success",
        message: response?.inquiry?.ticketNumber
          ? `Application saved. Reference ${response.inquiry.ticketNumber} has been created.`
          : "Application saved. The trade team will review it shortly.",
      });
      setForm(initialForm);
    } catch (error) {
      setSubmitResult({
        tone: "error",
        message:
          error?.message ||
          "Trade applications are not available right now. Please use the email fallback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicCommerceShell active="Contact">
      <main className="trade-page">
        <section className="trade-hero">
          <p className="support-kicker">For Professionals</p>
          <h1>Hedj Trade Program</h1>
          <p>
            For designers, architects, studios, and businesses furnishing projects at
            scale.
          </p>
        </section>

        <section className="support-section">
          <div className="support-card-grid">
            {benefits.map((benefit) => (
              <article className="support-option-card" key={benefit.title}>
                <span className="material-symbols-outlined">{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="trade-application-layout">
          <div className="trade-application-copy">
            <h2>Apply for project access</h2>
            <p>
              Share your business and project details. Applications are saved to the
              support backend when available; otherwise the page shows a clear fallback.
            </p>
          </div>

          <div className="support-form-card">
            <form className="support-form" onSubmit={handleSubmit} noValidate>
              <div className="support-form-grid">
                <div className="commerce-field">
                  <label htmlFor="trade-apply-name">Full Name</label>
                  <input
                    id="trade-apply-name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="support-field-error">{errors.name}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-business-name">Business Name</label>
                  <input
                    id="trade-business-name"
                    value={form.businessName}
                    onChange={(event) => updateField("businessName", event.target.value)}
                    placeholder="Studio Morgan"
                    aria-invalid={Boolean(errors.businessName)}
                  />
                  {errors.businessName && (
                    <p className="support-field-error">{errors.businessName}</p>
                  )}
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-apply-email">Email</label>
                  <input
                    id="trade-apply-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="trade@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="support-field-error">{errors.email}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-apply-phone">Phone</label>
                  <input
                    id="trade-apply-phone"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="+34 600 000 000"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <p className="support-field-error">{errors.phone}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-business-type">Business Type</label>
                  <select
                    id="trade-business-type"
                    value={form.businessType}
                    onChange={(event) => updateField("businessType", event.target.value)}
                  >
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-website">Website / Instagram Optional</label>
                  <input
                    id="trade-website"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                    placeholder="studio.example"
                  />
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-project-type">Project Type</label>
                  <select
                    id="trade-project-type"
                    value={form.projectType}
                    onChange={(event) => updateField("projectType", event.target.value)}
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="commerce-field">
                  <label htmlFor="trade-budget">Estimated Budget Optional</label>
                  <input
                    id="trade-budget"
                    value={form.estimatedBudget}
                    onChange={(event) => updateField("estimatedBudget", event.target.value)}
                    placeholder="25000"
                  />
                </div>

                <div className="commerce-field full">
                  <label htmlFor="trade-message">Message</label>
                  <textarea
                    id="trade-message"
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    rows="6"
                    placeholder="Tell us about the project, timeline, and pieces you are sourcing..."
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <p className="support-field-error">{errors.message}</p>}
                </div>
              </div>

              {submitResult && (
                <div className={`support-form-message ${submitResult.tone}`}>
                  <span className="material-symbols-outlined">
                    {submitResult.tone === "success" ? "check_circle" : "error"}
                  </span>
                  <p>{submitResult.message}</p>
                  {submitResult.tone === "error" && (
                    <a href={mailtoHref}>Email trade support instead</a>
                  )}
                </div>
              )}

              <button className="commerce-button" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default TradeProgram;
