import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "../../Styles/contact.css";


const validateEmail = (email) => email.includes("@");

const Contact = () => {
  const form = useRef();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert("Please enter a valid email address with '@'.");
      return;
    }

    emailjs
      .sendForm("service_42p3sju", "template_t64w4wp", form.current, {
        publicKey: "PV9slaOWlMSALkZ3v",
      })
      .then(
        () => {
          console.log("SUCCESS!");
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  };

  return (
    <div className="contact-container">
      <div className="frame-container">
        <h1>Contact Us</h1>
        <form ref={form} onSubmit={sendEmail}>
          <div className="field input">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              required
            />
          </div>
          <div className="field input">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={70}
              required
            />
          </div>
          <div className="field input">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              required
            />
          </div>
          <input type="submit" value="Send" />
        </form>
      </div>
    </div>
  );
};

export default Contact;
