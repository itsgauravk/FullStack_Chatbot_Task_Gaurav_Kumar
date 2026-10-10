import { services, courses, contactInfo } from "../data/content";
import type { EnquiryInput } from "../types";

export interface BotReply {
  text: string;
  showForm?: boolean;
  formDefaults?: Partial<EnquiryInput>;
}

interface Rule {
  id: string;
  keywords: string[];
  reply: BotReply;
}

export const GREETING =
  "Hi! I'm the DroneTV assistant. Pick a question below or type your own.";

export const quickQuestions = [
  "What services does DroneTV provide?",
  "What courses / training are available?",
  "How can I contact DroneTV?",
  "How can I register?",
  "I am interested in a service.",
  "I am a student.",
  "I want to speak with someone.",
];

const list = (items: { title: string }[]) =>
  items.map((i) => `• ${i.title}`).join("\n");

const rules: Rule[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey"],
    reply: { text: GREETING },
  },
  {
    id: "services",
    keywords: ["services", "provide", "offer"],
    reply: {
      text: `DroneTV covers these areas:\n${list(services)}\n\nTell me "I am interested in a service" if you would like us to get in touch.`,
    },
  },
  {
    id: "courses",
    keywords: ["courses", "course", "training", "learn", "classes"],
    reply: {
      text: `These courses and training programmes are available:\n${list(courses)}\n\nAsk "How can I register?" to join one.`,
    },
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "reach", "address"],
    reply: {
      text: `You can find DroneTV online at ${contactInfo.website}.\n\nWould you rather have someone contact you? Choose "I want to speak with someone." and leave your details.`,
    },
  },
  {
    id: "register",
    keywords: ["register", "registration", "sign up", "enrol", "enroll", "admission"],
    reply: {
      text: "Registering is easy:\n1. Choose the course you want\n2. Share your details with me right here in the chat\n3. Our team will contact you with the next steps",
      showForm: true,
      formDefaults: {
        userType: "Student",
        message: "I would like to register for a course.",
      },
    },
  },
  {
    id: "interest",
    keywords: ["interested", "interest", "service", "buy", "need"],
    reply: {
      text: "Great! I will just need a few details, and our team will reach out.",
      showForm: true,
      formDefaults: {
        userType: "Customer",
        message: "I am interested in your services.",
      },
    },
  },
  {
    id: "student",
    keywords: ["student", "college", "school", "internship"],
    reply: {
      text: `Welcome, student! Here is what we offer for learners:\n${list(courses)}\n\nI will take a few details and our team will send you more information.`,
      showForm: true,
      formDefaults: {
        userType: "Student",
        message: "I am a student and would like to know about training.",
      },
    },
  },
  {
    id: "human",
    keywords: ["speak", "someone", "human", "person", "agent", "talk", "call me"],
    reply: {
      text: "Sure, a real person can help. I will take a few details and a member of our team will get in touch with you.",
      showForm: true,
      formDefaults: {
        message: "I would like to speak with someone from the team.",
      },
    },
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank", "bye"],
    reply: { text: "You're welcome! Feel free to ask anything else." },
  },
];

export const FALLBACK: BotReply = {
  text: "Sorry, I didn't understand that. You can pick one of the suggested questions, or send us an enquiry and our team will help.",
};

export function getReply(input: string): BotReply {
  const text = input.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = new Set(text.split(/\s+/).filter(Boolean));

  let best: Rule | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      const hit = kw.includes(" ") ? text.includes(kw) : words.has(kw);
      if (hit) score += 1;
    }
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }

  return best ? best.reply : FALLBACK;
}
