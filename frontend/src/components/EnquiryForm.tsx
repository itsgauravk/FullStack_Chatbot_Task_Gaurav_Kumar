import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { createEnquiry, ApiError } from "../api";
import { services, courses } from "../data/content";
import { USER_TYPES } from "../types";
import type { EnquiryInput } from "../types";

const emptyForm: EnquiryInput = {
  name: "",
  email: "",
  phone: "",
  userType: "",
  interest: "",
  message: "",
};

const interestOptions = [
  ...services.map((s) => s.title),
  ...courses.map((c) => c.title),
  "Other",
];

function validate(values: EnquiryInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }
  if (!values.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\+?[0-9\s-]{10,15}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number";
  }
  if (!values.userType) errors.userType = "Please choose who you are";
  if (!values.interest) errors.interest = "Please choose a service or course";
  if (!values.message.trim()) errors.message = "Message is required";
  return errors;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function EnquiryForm({ initialValues }: { initialValues?: Partial<EnquiryInput> }) {
  const [values, setValues] = useState<EnquiryInput>({ ...emptyForm, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setFeedback("");

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const res = await createEnquiry(values);
      setStatus("success");
      setFeedback(res.message);
      setValues(emptyForm);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFeedback(err.message);
      } else {
        setFeedback("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label>
          Name
          <input name="name" value={values.name} onChange={handleChange} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
      </div>

      <div className="form-row">
        <label>
          Phone
          <input name="phone" value={values.phone} onChange={handleChange} />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
        <label>
          I am a
          <select
            name="userType"
            value={values.userType}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {USER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.userType && (
            <span className="field-error">{errors.userType}</span>
          )}
        </label>
      </div>

      <label>
        Service or course of interest
        <select
          name="interest"
          value={values.interest}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          {interestOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors.interest && (
          <span className="field-error">{errors.interest}</span>
        )}
      </label>

      <label>
        Message
        <textarea
          name="message"
          rows={4}
          value={values.message}
          onChange={handleChange}
        />
        {errors.message && (
          <span className="field-error">{errors.message}</span>
        )}
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Send enquiry"}
      </button>

      {status === "success" && (
        <p className="alert alert-success">{feedback}</p>
      )}
      {status === "error" && <p className="alert alert-error">{feedback}</p>}
    </form>
  );
}
