import "./homepage-premium.css";

const steps = [
  {
    icon: "search",
    title: "Browse",
    text: "Explore our curated collections or start a bespoke project with our designers.",
  },
  {
    icon: "edit_note",
    title: "Customize",
    text: "Select finishes, dimensions, and hardware to perfectly fit your spatial needs.",
  },
  {
    icon: "verified",
    title: "Order",
    text: "Place your order through our secure portal with full transparency on lead times.",
  },
  {
    icon: "local_shipping",
    title: "Deliver & Install",
    text: "White-glove delivery and professional installation for a seamless transition.",
  },
];

const StorytellingSection = () => (
  <section className="hedj-how" aria-labelledby="how-heading">
    <div className="hedj-home-container">
      <h2 id="how-heading">How Hedj Works</h2>
      <div className="hedj-how-grid">
        {steps.map((step) => (
          <article className="hedj-how-step" key={step.title}>
            <span className="hedj-how-icon" aria-hidden="true">
              <span className="material-symbols-outlined">{step.icon}</span>
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default StorytellingSection;
