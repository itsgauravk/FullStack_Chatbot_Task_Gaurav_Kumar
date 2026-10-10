import { useEffect, useState } from "react";
import {
  ApiError,
  deleteEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} from "../api";
import { STATUSES, USER_TYPES } from "../types";
import type { Enquiry } from "../types";

const formatDate = (iso: string) => new Date(iso).toLocaleString();
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export default function Admin() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("");
  const [status, setStatus] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [busy, setBusy] = useState(false);

  // Wait a moment after typing before searching
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load the list whenever the search or a filter changes
  useEffect(() => {
    let cancelled = false;
    getEnquiries({ search, userType, status })
      .then((res) => {
        if (cancelled) return;
        setItems(res.enquiries);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load enquiries. Please try again."
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, userType, status, reloadKey]);

  async function changeStatus(newStatus: string) {
    if (!selected) return;
    setBusy(true);
    setNotice("");
    try {
      const res = await updateEnquiryStatus(selected._id, newStatus);
      setSelected(res.enquiry);
      setItems((prev) =>
        prev.map((e) => (e._id === res.enquiry._id ? res.enquiry : e))
      );
      setNotice("Status updated.");
    } catch (err) {
      setNotice(
        err instanceof ApiError ? err.message : "Could not update the status."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected) return;
    if (!window.confirm(`Delete the enquiry from ${selected.name}?`)) return;
    setBusy(true);
    try {
      await deleteEnquiry(selected._id);
      setSelected(null);
      setNotice("Enquiry deleted.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setNotice(
        err instanceof ApiError ? err.message : "Could not delete the enquiry."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page admin">
      <h1>Enquiry Dashboard</h1>
      <p className="page-intro">
        Search, filter and manage the enquiries sent through the chatbot and
        the contact form.
      </p>

      <div className="toolbar">
        <input
          className="toolbar-search"
          placeholder="Search by name, email, phone, interest..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search enquiries"
        />
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {USER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {notice && !selected && <p className="alert alert-success">{notice}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Loading enquiries...</p>
      ) : items.length === 0 && !error ? (
        <p className="muted">No enquiries found.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Interest</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e._id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.userType}</td>
                  <td>{e.interest}</td>
                  <td>
                    <span className={`badge badge-${slug(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>{formatDate(e.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setNotice("");
                        setSelected(e);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Enquiry details"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{selected.name}</h2>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <dl className="details">
              <dt>Email</dt>
              <dd>{selected.email}</dd>
              <dt>Phone</dt>
              <dd>{selected.phone}</dd>
              <dt>Type</dt>
              <dd>{selected.userType}</dd>
              <dt>Interested in</dt>
              <dd>{selected.interest}</dd>
              <dt>Message</dt>
              <dd className="detail-message">{selected.message}</dd>
              <dt>Received</dt>
              <dd>{formatDate(selected.createdAt)}</dd>
              <dt>Last updated</dt>
              <dd>{formatDate(selected.updatedAt)}</dd>
            </dl>

            <label className="status-label">
              Status
              <select
                value={selected.status}
                disabled={busy}
                onChange={(ev) => void changeStatus(ev.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {notice && <p className="alert alert-success">{notice}</p>}

            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={() => void remove()}
            >
              Delete enquiry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
