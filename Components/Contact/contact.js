import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "../../Styles/contact.css";

// Rename the component to start with an uppercase letter
const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

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
    <div className="container">
      <div className="form-container">
        <h1>Contact Us</h1> {/* Apply styling to the heading */}
        <form ref={form} onSubmit={sendEmail}>
          <label>Name</label>
          <input type="text" name="from_name" />{" "}
          {/* Apply styling to the input */}
          <label>Email</label>
          <input type="email" name="from_email" />
          <label>Message</label>
          <textarea name="message" /> {/* Apply styling to the textarea */}
          <input type="submit" value="Send" />{" "}
          {/* Apply styling to the button */}
        </form>
      </div>
    </div>
  );
};

export default Contact;
