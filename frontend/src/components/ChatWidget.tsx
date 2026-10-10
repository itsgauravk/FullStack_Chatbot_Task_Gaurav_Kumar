import { useState } from "react";
import { useLocation } from "react-router-dom";
import ChatPanel from "./ChatPanel";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // The full chat page and the admin area do not need the bubble
  if (pathname === "/chat" || pathname === "/admin") return null;

  return (
    <>
      {open && (
        <div
          className="widget-panel"
          role="dialog"
          aria-label="Chat with the DroneTV assistant"
        >
          <button
            type="button"
            className="widget-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
          <ChatPanel compact />
        </div>
      )}
      <button
        type="button"
        className="widget-launcher"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
