import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        DroneTV Assistant
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
    </header>
  );
}
