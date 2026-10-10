import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Services from "./pages/Services";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/services" element={<Services />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <section className="page">
                <h1>Page not found</h1>
              </section>
            }
          />
        </Routes>
      </main>
      <ChatWidget />
    </BrowserRouter>
  );
}
