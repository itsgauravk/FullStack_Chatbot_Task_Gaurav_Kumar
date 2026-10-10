import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import AdminDashboard from "../components/AdminDashboard";
import {
  ApiError,
  clearAdminPassword,
  getAdminPassword,
  getEnquiries,
  setAdminPassword,
} from "../api";

export default function Admin() {
  const [authed, setAuthed] = useState(() => getAdminPassword() !== "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  // If the server ever rejects the password, go back to the login screen
  useEffect(() => {
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener("admin-unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("admin-unauthorized", onUnauthorized);
  }, []);

  async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) {
      setError("Please enter the admin password.");
      return;
    }
    setChecking(true);
    setError("");
    setAdminPassword(password);
    try {
      await getEnquiries();
      setAuthed(true);
      setPassword("");
    } catch (err) {
      clearAdminPassword();
      setError(
        err instanceof ApiError && err.message === "Unauthorized"
          ? "Incorrect password."
          : err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  function logout() {
    clearAdminPassword();
    setAuthed(false);
  }

  if (!authed) {
    return (
      <section className="page page-narrow">
        <form className="form login-card" onSubmit={handleLogin}>
          <h1>Admin login</h1>
          <p className="muted">Enter the admin password to view enquiries.</p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={checking}>
            {checking ? "Checking..." : "Log in"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <>
      <div className="logout-bar">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={logout}
        >
          Log out
        </button>
      </div>
      <AdminDashboard />
    </>
  );
}
