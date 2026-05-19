import { Link } from "react-router-dom";
import { PublicCommerceShell } from "../PublicCommerceShell";
import HeroSection from "./HeroSection";
import Slideshow from "./Slideshow";
import StorytellingSection from "./StorytellingSection";
import VirtualShowroomSection from "./VirtualShowroomSection";
import "./homepage-premium.css";

const stats = [
  { value: "12", label: "Collections" },
  { value: "5k+", label: "Custom Orders" },
  { value: "45", label: "Delivery Cities" },
  { value: "98%", label: "Client Satisfaction" },
];

const testimonials = [
  {
    quote:
      "The customization process was effortless. Our new dining table is the heartbeat of our home.",
    name: "Eleanor Vance",
    location: "San Francisco, CA",
  },
  {
    quote:
      "Quiet luxury defined. The delivery and installation team were as professional as the designers.",
    name: "Julian Thorne",
    location: "London, UK",
  },
  {
    quote:
      "Seeing the furniture in AR before buying gave us the confidence to choose bold, larger pieces.",
    name: "Maya Rodriguez",
    location: "Barcelona, ES",
  },
];

const featuredCollections = [
  {
    title: "Kitchens",
    subtitle: "Culinary sanctuaries designed for craft.",
    path: "/collections/kitchens",
    className: "hedj-featured-large",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCEAhjFPUItLxxOaR7BMld1mCJr3kY_jYeMzAXgnxovBlFWjCXQ9JAiBSmQRTwYsm2MaN-OBzz7C5KAsCEo7ZOwq4KLzAZwQk5VbLA9GsYw8oad7poGqmpTgcLBfI0z3Mx_odse-0ZPQ--uJtKsoxHznTJpUOpVauDSDlhuFpfxhq7TIpvf_z4gsjjW672p4P5dqUvxsuekYaiQlUndjToy1e25ppoYuODEJfmKcvin2RkA0xSY8UCj7xo5ML4HcsYSZKHO7KSBqk3w",
  },
  {
    title: "Bedrooms",
    subtitle: "Restful spaces of quiet luxury.",
    path: "/collections/bedrooms",
    className: "hedj-featured-wide",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXdzQ9Zlizx8AhwVye2n6B9uYmBIOgm8H9VwGdkUrsmt7FeRvjHnUNKSfQCPAsFVVEjG_yYL1qIvXZOVVDdznc5voK-JnMSrsAmk2GUYid_G81Uy9-V_SI4YX2i2eJfx-dIYGL3Jb2lemFZ7DzBCYGGFeG-GcOgoA2dWQDHwl3AiHRhqlpIjhiXDXSGea0aRTLixZB47PXPTs1ap_4oU4E0BTrJokem9IE7d_kG6hqK2Q24Y0IcWfU92F7QItPDMD2h9qiGK7Dnzc4",
  },
  {
    title: "Outdoor",
    subtitle: "Outdoor pieces for resort-caliber living.",
    path: "/collections/outdoor",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_3HuA3JQgRk0Ic7bvD1RwaSRKKmhgwttQ5COPjWx38phbMwIfipts9AAgJCNKoCa58tU8mGS9hPU2unJACIviXA8oy8UvH8UPwXrpo_5QzB67C3Ai-y_ecHnGEbpGqakIEBkZnSQy9aSsT3_gUsyv4EzqDVCUJp4e9A6YWHMyldYJZPWfTTF1l5zWhHvQS8o4dRNEXgKmA_srPK7Rira5ueXkfXIH4L4gmB5pCME8kJt_wQP3n78vCeDy32vKX9LM_mwOfAHaAlTn",
  },
  {
    title: "Complements",
    subtitle: "Finishing pieces with sculptural presence.",
    path: "/collections/complements",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBizykCGysmS8_SMHrWeAP6kzwuovAWBWkwCaxo-HOoH6lxvCfa9NsZKppDSeUC9ECpAYIfhoenzcgSdD3eBpklxjsnzT4TxyjtJA6TtKQ1yXmFLd2_c9ZFWsrmuP1PkodzinHnBVgetM8E-FVALutlAs8MI2QDNSeg8K-no20Axb4kUYut5-UfhpHXa5TImsAWfKIwPbGO4NN_GkqYVQM2IGoGgynta92NgGzRgTW8s7Bk3oEBFO12omA2E7JGxtjjnFEHYLwaVbCx",
  },
];

const StatsRow = () => (
  <section className="hedj-home-stats" aria-label="Hedj statistics">
    <div className="hedj-home-container hedj-home-stats-grid">
      {stats.map((stat) => (
        <div className="hedj-home-stat" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  </section>
);

const CuratedCollections = () => (
  <section className="hedj-home-section hedj-featured" aria-labelledby="collections-heading">
    <div className="hedj-home-container">
      <div className="hedj-home-section-heading">
        <h2 id="collections-heading">Curated Collections</h2>
        <span aria-hidden="true" />
      </div>

      <div className="hedj-featured-grid">
        {featuredCollections.map((collection) => (
          <Link
            className={`hedj-featured-card ${collection.className || ""}`}
            to={collection.path}
            key={collection.title}
          >
            <img src={collection.image} alt={`${collection.title} collection`} />
            <span className="hedj-featured-shade" aria-hidden="true" />
            <span className="hedj-featured-copy">
              <strong>{collection.title}</strong>
              <small>{collection.subtitle}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="hedj-home-section hedj-testimonials" aria-labelledby="testimonials-heading">
    <div className="hedj-home-container">
      <h2 id="testimonials-heading">Voices of Hedj</h2>
      <div className="hedj-testimonial-grid">
        {testimonials.map((testimonial) => (
          <article className="hedj-testimonial-card" key={testimonial.name}>
            <div className="hedj-testimonial-stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <span className="material-symbols-outlined" key={index}>
                  star
                </span>
              ))}
            </div>
            <p>"{testimonial.quote}"</p>
            <div className="hedj-testimonial-person">
              <span aria-hidden="true" />
              <div>
                <strong>{testimonial.name}</strong>
                <small>{testimonial.location}</small>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => (
  <PublicCommerceShell>
    <main className="hedj-home-page">
      <HeroSection />
      <StatsRow />
      <CuratedCollections />
      <Slideshow />
      <StorytellingSection />
      <VirtualShowroomSection />
      <Testimonials />
    </main>
  </PublicCommerceShell>
);

export default Home;
