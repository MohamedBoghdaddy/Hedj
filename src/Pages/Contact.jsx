import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../Components/PublicCommerceShell";
import "../Styles/commerce-premium.css";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqGImkMhTp9S6mQA8BWrjbQMIPMDTFuVvRdDq0UUcGqj27pIHR9IRQ5W1TK-kw6OkC_EdGUJOXYKndbaM5xUcvlZ2vFhR-_C46fE_hmtTA2Rj4uz3nuSKfiuMcbLEXYMIUilLC3FWslCP2HD9sCwSPZljFcjLz64dOB5rpKBB4jQyrj-h7g-a_s9pJegyolckmfQ1nT7XniMZgTj_9-PTvkN2DG6uFYSQSgM7Q3uC7zcjg3nETkS963Ww55bz3FPRDY1uXhxK2IBLA";

const showroomImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDq505amVI6agVd0VdMGmoY1_RqEMZNbvc66YIDeiNF3xb1aLp4byGYw3-AKdgZL7FtwMr0lHaObA4PQOg_kASd9sC__T66fXPzuUQUR_SRiiCoBDfrNXqxDKgO-QEBZIMxdQeiUxDnPB81ApiYWflNkWnI0Qo99UEBwR6FJZqGME7dabMsVFBnWz6LaHan864ebn1FoK-KoZmeZSqfvCpyjnTzw6g73BCttzz5F-vkkPOpHbBS6PdY4LK4jsReRawCxnlWgL2auJ-x";

const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATlgo0_32EtW6LwofAuS4kIq_gskGIkNAc39XsSOWFM1O3saq40XNgeJ5RBvK_MjJakXdeuXeJUwyVZAlJU7jKBOjLx_i0HIEoJpXVKCnj_iF2n8JxH3gwOpgXKOOx8w3JZlkT3tw-frUPWxTsJYqPmwRMV4gQUSolLJUSvIFFQeUpuQ8hEyFDs1zCrcMDpmi-SeGleGB-llApEGSJZzHwVTGmEdPwOCnivadKuqVu8BTwoJ3Ir2pPGhP5C07WR06qgRbGL5q04RB7";

const Contact = () => {
  const [sent, setSent] = useState(false);

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
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <div className="contact-form-row">
                <div className="commerce-field">
                  <label htmlFor="contact-name">Full Name</label>
                  <input id="contact-name" placeholder="John Doe" type="text" required />
                </div>

                <div className="commerce-field">
                  <label htmlFor="contact-email">Email Address</label>
                  <input id="contact-email" placeholder="hello@example.com" type="email" required />
                </div>
              </div>

              <div className="commerce-field">
                <label htmlFor="contact-topic">Topic of Interest</label>
                <select id="contact-topic" defaultValue="Product Inquiry">
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
                  placeholder="Tell us about your project..."
                  rows="4"
                  required
                />
              </div>

              <div>
                <button className="contact-submit" type="submit">
                  Send Inquiry
                </button>

                {sent && (
                  <p className="contact-success">
                    <span className="material-symbols-outlined">verified_user</span>
                    Thank you. An interior consultant will reach out within 24 hours.
                  </p>
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

              <Link className="contact-link" to="/trade">
                <span>Trade Program Login</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <Link className="contact-link" to="/catalog">
                <span>Download Catalog 2024</span>
                <span className="material-symbols-outlined">download</span>
              </Link>
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
