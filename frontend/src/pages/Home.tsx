import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Drone Services",
    text: "Explore the aerial services DroneTV offers for businesses and creators.",
  },
  {
    title: "Training Programmes",
    text: "Find courses for beginners and aspiring professional drone pilots.",
  },
  {
    title: "Quick Answers",
    text: "Ask our assistant about services, courses, registration and contact details.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">DroneTV Support &amp; Lead Assistant</p>
        <h1>Everything about DroneTV, one chat away</h1>
        <p className="hero-text">
          Learn about our drone services and training, get instant answers, and
          send us an enquiry in under a minute.
        </p>
        <div className="hero-actions">
          <Link to="/contact" className="btn btn-primary">
            Send an enquiry
          </Link>
          <Link to="/services" className="btn btn-secondary">
            View services
          </Link>
        </div>
      </section>

      <section className="page">
        <div className="card-grid">
          {highlights.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
