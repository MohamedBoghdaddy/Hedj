import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import catalogPdf from "../Assets/collection/HEDJ-Company Profile-2024 Q01.pdf";
import { supportApi } from "../services/api";
import "../Styles/commerce-premium.css";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqGImkMhTp9S6mQA8BWrjbQMIPMDTFuVvRdDq0UUcGqj27pIHR9IRQ5W1TK-kw6OkC_EdGUJOXYKndbaM5xUcvlZ2vFhR-_C46fE_hmtTA2Rj4uz3nuSKfiuMcbLEXYMIUilLC3FWslCP2HD9sCwSPZljFcjLz64dOB5rpKBB4jQyrj-h7g-a_s9pJegyolckmfQ1nT7XniMZgTj_9-PTvkN2DG6uFYSQSgM7Q3uC7zcjg3nETkS963Ww55bz3FPRDY1uXhxK2IBLA";

const showroomImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDq505amVI6agVd0VdMGmoY1_RqEMZNbvc66YIDeiNF3xb1aLp4byGYw3-AKdgZL7FtwMr0lHaObA4PQOg_kASd9sC__T66fXPzuUQUR_SRiiCoBDfrNXqxDKgO-QEBZIMxdQeiUxDnPB81ApiYWflNkWnI0Qo99UEBwR6FJZqGME7dabMsVFBnWz6LaHan864ebn1FoK-KoZmeZSqfvCpyjnTzw6g73BCttzz5F-vkkPOpHbBS6PdY4LK4jsReRawCxnlWgL2auJ-x";

const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATlgo0_32EtW6LwofAuS4kIq_gskGIkNAc39XsSOWFM1O3saq40XNgeJ5RBvK_MjJakXdeuXeJUwyVZAlJU7jKBOjLx_i0HIEoJpXVKCnj_iF2n8JxH3gwOpgXKOOx8w3JZlkT3tw-frUPWxTsJYqPmwRMV4gQUSolLJUSvIFFQeUpuQ8hEyFDs1zCrcMDpmi-SeGleGB-llApEGSJZzHwVTGmEdPwOCnivadKuqVu8BTwoJ3Ir2pPGhP5C07WR06qgRbGL5q04RB7";

const SUPPORT_EMAIL = "support@hedjcommerce.com"; // TODO: replace with the final public support inbox.

const topicToSupportType = {
  "Product Inquiry": "Product Inquiry",
  "Custom Furniture": "Product Inquiry",
  "Interior Consultation": "Other",
  "Partnership Request": "Other",
  "Media & Press": "Other",
};

const buildContactMailto = ({ name, email, topic, message }) => {
  const subject = encodeURIComponent(`Hedj inquiry: ${topic || "Contact"}`);
  const body = encodeURIComponent(
    [`Name: ${name}`, `Email: ${email}`, `Topic: ${topic}`, "", message].join("\n"),
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};

const Contact = () => {
  const [submitState, setSubmitState] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <PublicCommerceShell active="Contact">
      <main>
        <section className="contact-hero">
          <div className="contact-hero-image">
            <img src={heroImage} alt="High-end interior design studio" />
            <div className="contact-hero-gradient" />
          </div>

          <div className="contact-hero-content">
            <h1>How can we help you design your space?</h1>
            <p>
              Connect with our consultants to bring your vision to life through curated
              furniture and bespoke interior solutions.
            </p>
          </div>
        </section>

        <section className="contact-layout">
          <div className="contact-form-card">
            <form
              className="contact-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const payload = {
                  name: String(formData.get("name") || "").trim(),
                  email: String(formData.get("email") || "").trim(),
                  topic: String(formData.get("topic") || "Product Inquiry").trim(),
                  message: String(formData.get("message") || "").trim(),
                };

                setSubmitting(true);
                setSubmitState(null);
                try {
                  const response = await supportApi.createInquiry({
                    name: payload.name,
                    email: payload.email,
                    type: topicToSupportType[payload.topic] || "Other",
                    message: payload.message,
                    source: "contact_page",
                    metadata: { topic: payload.topic },
                  });
                  setSubmitState({
                    tone: "success",
                    message: response?.inquiry?.ticketNumber
                      ? `Inquiry saved. Reference ${response.inquiry.ticketNumber} has been created.`
                      : "Inquiry saved. An interior consultant will review it shortly.",
                  });
                  event.currentTarget.reset();
                } catch (error) {
                  setSubmitState({
                    tone: "error",
                    message:
                      error?.message ||
                      "We could not save your inquiry right now. Please use the email fallback.",
                    mailto: buildContactMailto(payload),
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="contact-form-row">
                <div className="commerce-field">
                  <label htmlFor="contact-name">Full Name</label>
                  <input id="contact-name" name="name" placeholder="John Doe" type="text" required />
                </div>

                <div className="commerce-field">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    placeholder="hello@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="commerce-field">
                <label htmlFor="contact-topic">Topic of Interest</label>
                <select id="contact-topic" name="topic" defaultValue="Product Inquiry">
                  <option>Product Inquiry</option>
                  <option>Custom Furniture</option>
                  <option>Interior Consultation</option>
                  <option>Partnership Request</option>
                  <option>Media & Press</option>
                </select>
              </div>

              <div className="commerce-field">
                <label htmlFor="contact-message">Your Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell us about your project..."
                  rows="4"
                  required
                />
              </div>

              <div>
                <button className="contact-submit" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Inquiry"}
                </button>

                {submitState && (
                  <div
                    className={
                      submitState.tone === "success" ? "contact-success" : "contact-error"
                    }
                  >
                    <span className="material-symbols-outlined">
                      {submitState.tone === "success" ? "verified_user" : "error"}
                    </span>
                    <span>{submitState.message}</span>
                    {submitState.mailto && <a href={submitState.mailto}>Email us instead</a>}
                  </div>
                )}
              </div>
            </form>
          </div>

          <aside className="contact-side">
            <div className="contact-showroom-card">
              <div className="contact-showroom-image">
                <img src={showroomImage} alt="Barcelona showroom" />
                <span className="contact-showroom-badge">Showroom</span>
              </div>

              <div className="contact-showroom-body">
                <h2>Barcelona Studio</h2>

                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <span className="material-symbols-outlined">location_on</span>
                    <p>
                      Carrer de Mallorca, 259
                      <br />
                      08008 Barcelona, Spain
                    </p>
                  </div>

                  <div className="contact-info-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <p>
                      <strong>Opening Hours</strong>
                      Mon - Fri: 10:00 - 19:00
                      <br />
                      Sat: 11:00 - 18:00
                    </p>
                  </div>

                  <div className="contact-info-item">
                    <span className="material-symbols-outlined">call</span>
                    <p>+34 932 155 000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-links-card">
              <p className="contact-links-title">Digital Support</p>

              <Link className="contact-link" to="/support">
                <span>Client Support Portal</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <Link className="contact-link" to="/trade-login">
                <span>Trade Program Login</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <a className="contact-link" href={catalogPdf} download>
                <span>Download Catalog 2024</span>
                <span className="material-symbols-outlined">download</span>
              </a>
            </div>
          </aside>
        </section>

        <section className="contact-map">
          <img src={mapImage} alt="Barcelona map location" />
          <div className="contact-map-overlay">
            <div className="contact-map-button">Open in Google Maps</div>
          </div>
        </section>
      </main>
    </PublicCommerceShell>
  );
};

export default Contact;
