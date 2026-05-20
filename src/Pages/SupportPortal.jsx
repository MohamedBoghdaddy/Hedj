import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import { supportApi } from "../services/api";
import "../Styles/commerce-premium.css";

const SUPPORT_EMAIL = "support@hedjcommerce.com"; // TODO: replace with the final public support inbox.
const SHOWROOM_PHONE = "+34 932 155 000";
const SHOWROOM_ADDRESS = "Carrer de Mallorca, 259, 08008 Barcelona, Spain";

const supportTypes = [
  "Order Issue",
  "Delivery Question",
  "Product Inquiry",
  "Return / Exchange",
  "Account Help",
  "Trade Program",
  "Other",
];

const supportOptions = [
  {
    icon: "receipt_long",
    title: "Order Support",
    description: "Get help with order status, changes, invoices, or item details.",
    type: "Order Issue",
  },
  {
    icon: "local_shipping",
    title: "Delivery & Installation",
    description: "Coordinate delivery windows, access notes, and installation questions.",
    type: "Delivery Question",
  },
  {
    icon: "chair",
    title: "Product Questions",
    description: "Ask about materials, finishes, dimensions, stock, or custom options.",
    type: "Product Inquiry",
  },
  {
    icon: "assignment_return",
    title: "Returns & Exchanges",
    description: "Start a return conversation or check exchange eligibility.",
    type: "Return / Exchange",
  },
  {
    icon: "favorite",
    title: "Wishlist / Account Help",
    description: "Resolve account, wishlist, login, and saved-product issues.",
    type: "Account Help",
  },
  {
    icon: "corporate_fare",
    title: "Trade & Bulk Orders",
    description: "Discuss project purchasing, trade applications, and bulk support.",
    type: "Trade Program",
  },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Sign in to your account dashboard for available order details, or submit an order support request with your order number.",
  },
  {
    question: "Can I change or cancel an order?",
    answer:
      "Changes depend on production and delivery status. Contact support as soon as possible with your order number.",
  },
  {
    question: "How do I request a return?",
    answer:
      "Use the Returns & Exchanges support type and include your order number, item name, and reason for the request.",
  },
  {
    question: "Do you offer custom furniture?",
    answer:
      "Yes. Send product requirements, dimensions, preferred materials, and timeline through Product Inquiry or Trade Program.",
  },
  {
    question: "How do I contact the showroom?",
    answer:
      "Call the Barcelona studio or send a support request. For in-person visits, include preferred dates in your message.",
  },
  {
    question: "How does the trade program work?",
    answer:
      "Trade applicants can request project support, bulk coordination, and trade review through the Trade Program page.",
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  type: "Order Issue",
  orderNumber: "",
  message: "",
};

const buildMailto = (form) => {
  const subject = encodeURIComponent(`Hedj support request: ${form.type || "Support"}`);
  const body = encodeURIComponent(
    [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "Not provided"}`,
      `Support type: ${form.type}`,
      `Order number: ${form.orderNumber || "Not provided"}`,
      "",
      form.message,
    ].join("\n"),
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};

const SupportPortal = () => {
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
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.type) nextErrors.type = "Choose a support type.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    return nextErrors;
  };

  const handleOptionClick = (type) => {
    updateField("type", type);
    document.getElementById("support-request")?.scrollIntoView({ behavior: "smooth" });
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
        ...form,
        source: "support_portal",
      });
      setSubmitResult({
        tone: "success",
        message: response?.inquiry?.ticketNumber
          ? `Request saved. Ticket ${response.inquiry.ticketNumber} has been created.`
          : "Request saved. Our team will review it shortly.",
      });
      setForm(initialForm);
    } catch (error) {
      setSubmitResult({
        tone: "error",
        message:
          error?.message ||
          "Support requests are not available right now. Please use the email fallback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicCommerceShell active="Contact">
      <main className="support-page">
        <section className="support-hero">
          <p className="support-kicker">Digital Support</p>
          <h1>Client Support Portal</h1>
          <p>
            Get help with orders, products, delivery, returns, showroom visits, or trade
            inquiries.
          </p>
        </section>

        <section className="support-section">
          <div className="support-section-header">
            <h2>How can we help?</h2>
            <p>Choose a topic to start your request with the right context.</p>
          </div>

          <div className="support-card-grid">
            {supportOptions.map((option) => (
              <article className="support-option-card" key={option.title}>
                <span className="material-symbols-outlined">{option.icon}</span>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <button type="button" onClick={() => handleOptionClick(option.type)}>
                  Start Request
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="support-two-column" id="support-request">
          <div className="support-form-card">
            <div className="support-section-header compact">
              <h2>Support Request</h2>
              <p>Requests are saved to the Hedj backend when the API is available.</p>
            </div>

            <form className="support-form" onSubmit={handleSubmit} noValidate>
              <div className="support-form-grid">
                <div className="commerce-field">
                  <label htmlFor="support-name">Full Name</label>
                  <input
                    id="support-name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Jane Harper"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="support-field-error">{errors.name}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="support-email">Email</label>
                  <input
                    id="support-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="support-field-error">{errors.email}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="support-phone">Phone Optional</label>
                  <input
                    id="support-phone"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="+34 600 000 000"
                    autoComplete="tel"
                  />
                </div>

                <div className="commerce-field">
                  <label htmlFor="support-type">Support Type</label>
                  <select
                    id="support-type"
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                    aria-invalid={Boolean(errors.type)}
                  >
                    {supportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="support-field-error">{errors.type}</p>}
                </div>

                <div className="commerce-field">
                  <label htmlFor="support-order">Order Number Optional</label>
                  <input
                    id="support-order"
                    value={form.orderNumber}
                    onChange={(event) => updateField("orderNumber", event.target.value)}
                    placeholder="HJ-1024"
                  />
                </div>

                <div className="commerce-field full">
                  <label htmlFor="support-message">Message</label>
                  <textarea
                    id="support-message"
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    rows="6"
                    placeholder="Tell us what you need help with..."
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
                    <a href={mailtoHref}>Email support instead</a>
                  )}
                </div>
              )}

              <button className="commerce-button" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Submit Request"}
              </button>
            </form>
          </div>

          <aside className="support-shortcuts-card">
            <h2>Contact Shortcuts</h2>
            <a href={`tel:${SHOWROOM_PHONE.replace(/\s/g, "")}`}>
              <span className="material-symbols-outlined">call</span>
              <span>
                <strong>Call</strong>
                {SHOWROOM_PHONE}
              </span>
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <span className="material-symbols-outlined">mail</span>
              <span>
                <strong>Email</strong>
                {SUPPORT_EMAIL}
              </span>
            </a>
            <Link to="/contact">
              <span className="material-symbols-outlined">storefront</span>
              <span>
                <strong>Visit showroom</strong>
                {SHOWROOM_ADDRESS}
              </span>
            </Link>
          </aside>
        </section>

        <section className="support-section">
          <div className="support-section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers before you open a request.</p>
          </div>

          <div className="support-faq-grid">
            {faqs.map((faq) => (
              <article className="support-faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default SupportPortal;
