import { Link } from "react-router-dom";
import { courses } from "../data/content";

export default function Courses() {
  return (
    <section className="page">
      <h1>Courses &amp; Training</h1>
      <p className="page-intro">
        Training programmes for students and professionals.
      </p>
      <div className="card-grid">
        {courses.map((c) => (
          <article key={c.id} className="card">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <Link to="/contact" className="card-link">
              Enquire about this course →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
