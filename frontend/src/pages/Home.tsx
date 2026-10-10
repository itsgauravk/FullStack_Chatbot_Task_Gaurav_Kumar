import { Link } from "react-router-dom";
import { courses, services } from "../data/content";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Drone · GIS · AI Technologies</p>
        <h1>Everything about DroneTV, one chat away</h1>
        <p className="hero-text">
          Learn about our drone services and training programmes, get instant
          answers from our assistant, and send us an enquiry in under a minute.
        </p>
        <div className="hero-actions">
          <Link to="/services" className="btn btn-primary">
            View services
          </Link>
          <Link to="/courses" className="btn btn-secondary">
            Explore courses
          </Link>
        </div>
      </section>

      <section className="page section">
        <h2 className="section-title">What we cover</h2>
        <p className="section-sub">
          Three areas of technology, from drones to maps to artificial
          intelligence.
        </p>
        <div className="card-grid">
          {services.map((s) => (
            <article key={s.id} className="card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </article>
          ))}
        </div>
        <Link to="/services" className="section-link">
          See all services →
        </Link>
      </section>

      <section className="page section">
        <h2 className="section-title">Learn with us</h2>
        <p className="section-sub">
          Training programmes for students and professionals.
        </p>
        <div className="card-grid">
          {courses.map((c) => (
            <article key={c.id} className="card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </article>
          ))}
        </div>
        <Link to="/courses" className="section-link">
          See all courses →
        </Link>
      </section>

      <section className="page">
        <div className="cta-band">
          <div>
            <h2>Have a question?</h2>
            <p>
              Use the chat bubble in the bottom-right corner, or send us a
              message from the contact page.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
