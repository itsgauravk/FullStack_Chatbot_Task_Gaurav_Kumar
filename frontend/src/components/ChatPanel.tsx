import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { createEnquiry, ApiError } from "../api";
import { getReply, quickQuestions, GREETING } from "../chatbot/rules";
import { startFlow, answer, steps } from "../chatbot/enquiryFlow";
import type { FlowState } from "../chatbot/enquiryFlow";
import type { EnquiryInput } from "../types";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

interface Saved {
  messages: Message[];
  flow: FlowState | null;
}

const STORAGE_KEY = "dronetv-chat-v2";
const MAX_LENGTH = 500;

const initial: Saved = {
  messages: [{ id: 0, role: "bot", text: GREETING }],
  flow: null,
};

function load(): Saved {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        return { messages: parsed.messages, flow: parsed.flow ?? null };
      }
    }
  } catch {
    // Storage unavailable or broken data: start a fresh chat
  }
  return initial;
}

export default function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<Saved>(load);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, flow } = state;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state]);

  function update(items: Omit<Message, "id">[], nextFlow: FlowState | null) {
    setState((prev) => ({
      messages: [
        ...prev.messages,
        ...items.map((m, i) => ({ ...m, id: prev.messages.length + i })),
      ],
      flow: nextFlow,
    }));
  }

  async function submit(userMsg: Omit<Message, "id">) {
    if (!flow) return;
    setSending(true);
    try {
      const res = await createEnquiry(flow.data as EnquiryInput);
      update(
        [
          userMsg,
          {
            role: "bot",
            text: `Thank you, ${res.enquiry.name}! Your enquiry has been submitted. Our team will get in touch with you soon.`,
          },
        ],
        null
      );
    } catch (err) {
      let msg = "Sorry, I couldn't send your enquiry.";
      if (err instanceof ApiError) {
        const details = Object.values(err.fieldErrors);
        msg = details.length
          ? `${err.message}:\n${details.map((d) => `• ${d}`).join("\n")}`
          : err.message;
      }
      update(
        [
          userMsg,
          {
            role: "bot",
            text: `${msg}\nChoose "Yes, send it" to try again, or Cancel.`,
          },
        ],
        flow
      );
    } finally {
      setSending(false);
    }
  }

  async function send(raw: string) {
    const text = raw.trim().slice(0, MAX_LENGTH);
    if (!text || sending) return;
    setInput("");
    const userMsg = { role: "user" as const, text };

    // Normal chat (no enquiry in progress)
    if (!flow) {
      const reply = getReply(text);
      if (reply.showForm) {
        const started = startFlow(reply.formDefaults ?? {});
        update(
          [
            userMsg,
            { role: "bot", text: reply.text },
            { role: "bot", text: started.prompt },
          ],
          started.flow
        );
      } else {
        update([userMsg, { role: "bot", text: reply.text }], null);
      }
      return;
    }

    // The user can cancel at any time
    if (/^(cancel|stop)$/i.test(text)) {
      update(
        [
          userMsg,
          {
            role: "bot",
            text: "No problem, I've cancelled the enquiry. Ask me anything else!",
          },
        ],
        null
      );
      return;
    }

    // Waiting for the final yes / cancel
    if (flow.confirming) {
      if (/^(yes|y|send|submit|ok)\b/i.test(text)) {
        await submit(userMsg);
      } else {
        update(
          [
            userMsg,
            {
              role: "bot",
              text: 'Please choose "Yes, send it" or "Cancel".',
            },
          ],
          flow
        );
      }
      return;
    }

    // Answer to one of the questions
    const result = answer(flow, text);
    update([userMsg, { role: "bot", text: result.reply }], result.flow);
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  function reset() {
    setState(initial);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  // The buttons under the chat change depending on where we are
  const currentStep =
    flow && !flow.confirming ? steps[flow.stepIndex] : undefined;
  let chips: string[];
  if (!flow) {
    chips = quickQuestions;
  } else if (flow.confirming) {
    chips = ["Yes, send it", "Cancel"];
  } else {
    chips = [...(currentStep?.options ?? [])];
    if (currentStep?.field === "message" && flow.defaults.message) {
      chips.push("Skip");
    }
    chips.push("Cancel");
  }

  return (
    <section className={compact ? "chat-compact" : "page page-narrow"}>
      <div className="chat-header">
        {compact ? <h2 className="chat-title">DroneTV Assistant</h2> : <h1>Chat with us</h1>}
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Clear chat
        </button>
      </div>

      <div className="chat-box">
        {messages.map((m) => (
          <div key={m.id} className={`msg msg-${m.role}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="quick-replies">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            disabled={sending}
            onClick={() => void send(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={input}
          maxLength={MAX_LENGTH}
          onChange={(e) => setInput(e.target.value)}
          placeholder={flow ? "Type your answer..." : "Type your question..."}
          aria-label="Your message"
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>
          Send
        </button>
      </form>
    </section>
  );
}
