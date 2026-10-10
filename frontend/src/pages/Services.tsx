import { Link } from "react-router-dom";
import { services } from "../data/content";

export default function Services() {
  return (
    <section className="page">
      <h1>Our Services</h1>
      <p className="page-intro">
        A look at what DroneTV covers across drone, GIS and AI technologies.
      </p>
      <div className="card-grid">
        {services.map((s) => (
          <article key={s.id} className="card">
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <Link to="/contact" className="card-link">
              Ask about this service →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
