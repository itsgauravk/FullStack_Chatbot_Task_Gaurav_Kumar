import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChatPanel from "./ChatPanel";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MaximizeIcon = () => (
  <svg {...iconProps}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const ShrinkIcon = () => (
  <svg {...iconProps}>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg {...iconProps}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("open-chat", openChat);
    return () => window.removeEventListener("open-chat", openChat);
  }, []);

  // The admin area does not need the chat bubble
  if (pathname === "/admin") return null;

  return (
    <>
      {open && (
        <div
          className={`widget-panel${maximized ? " maximized" : ""}`}
          role="dialog"
          aria-label="Chat with the DroneTV assistant"
        >
          <div className="widget-head">
            <div className="widget-brand">
              <span className="widget-dot" />
              <span className="widget-title">DroneTV Assistant</span>
            </div>
            <div className="widget-actions">
              <button
                type="button"
                className="widget-icon-btn"
                onClick={() => setMaximized((m) => !m)}
                aria-label={maximized ? "Shrink chat" : "Maximize chat"}
                title={maximized ? "Shrink" : "Maximize"}
              >
                {maximized ? <ShrinkIcon /> : <MaximizeIcon />}
              </button>
              <button
                type="button"
                className="widget-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="widget-body">
            <ChatPanel compact />
          </div>
        </div>
      )}
      <button
        type="button"
        className="widget-launcher"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon /> : "💬"}
      </button>
    </>
  );
}
