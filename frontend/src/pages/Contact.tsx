import EnquiryForm from "../components/EnquiryForm";

export default function Contact() {
  return (
    <section className="page page-narrow">
      <h1>Contact &amp; Enquiry</h1>
      <p className="page-intro">
        Tell us what you need and we will get back to you.
      </p>
      <EnquiryForm />
    </section>
  );
}
