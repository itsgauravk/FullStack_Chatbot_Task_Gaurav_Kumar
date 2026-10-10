import { services, courses } from "../data/content";
import { USER_TYPES } from "../types";

export type Field =
  | "name"
  | "email"
  | "phone"
  | "userType"
  | "interest"
  | "message";

type Values = Partial<Record<Field, string>>;

export interface FlowState {
  stepIndex: number;
  data: Values;
  defaults: Values;
  confirming: boolean;
}

export interface Step {
  field: Field;
  prompt: string;
  options?: string[];
  validate: (value: string) => string | null;
}

const interestOptions = [
  ...services.map((s) => s.title),
  ...courses.map((c) => c.title),
  "Other",
];

export const steps: Step[] = [
  {
    field: "name",
    prompt: "Let's get your details. What's your name?",
    validate: (v) =>
      !v.trim()
        ? "Please tell me your name."
        : v.trim().length > 100
          ? "That name is too long. Please shorten it."
          : null,
  },
  {
    field: "email",
    prompt: "Thanks! What's your email address?",
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? null
        : "That doesn't look like a valid email address. Please try again.",
  },
  {
    field: "phone",
    prompt: "And your phone number?",
    validate: (v) =>
      /^\+?[0-9\s-]{10,15}$/.test(v.trim())
        ? null
        : "Please enter a valid phone number (10 to 15 digits).",
  },
  {
    field: "userType",
    prompt: "Are you a student, a customer, or something else?",
    options: [...USER_TYPES],
    validate: (v) =>
      (USER_TYPES as readonly string[]).includes(v)
        ? null
        : "Please choose one of the options.",
  },
  {
    field: "interest",
    prompt: "Which service or course are you interested in?",
    options: interestOptions,
    validate: (v) =>
      interestOptions.includes(v) ? null : "Please choose one of the options.",
  },
  {
    field: "message",
    prompt: "Last one: any message for our team?",
    validate: (v) =>
      !v.trim()
        ? "Please type a short message."
        : v.trim().length > 1000
          ? "That is too long. Please keep it under 1000 characters."
          : null,
  },
];

function promptFor(step: Step, defaults: Values): string {
  if (step.field === "message" && defaults.message) {
    return `${step.prompt} Type "skip" if you have nothing to add.`;
  }
  return step.prompt;
}

function summary(data: Values): string {
  return [
    "Please check your details:",
    `Name: ${data.name ?? ""}`,
    `Email: ${data.email ?? ""}`,
    `Phone: ${data.phone ?? ""}`,
    `I am a: ${data.userType ?? ""}`,
    `Interested in: ${data.interest ?? ""}`,
    `Message: ${data.message ?? ""}`,
    "",
    "Shall I send this to our team?",
  ].join("\n");
}

// Moves to the next question (skipping ones we already know the answer to)
function advance(flow: FlowState): { flow: FlowState; prompt: string } {
  const data: Values = { ...flow.data };
  let i = flow.stepIndex + 1;

  while (i < steps.length) {
    const field = steps[i].field;
    const known = flow.defaults[field];
    if ((field === "userType" || field === "interest") && known) {
      data[field] = known;
      i++;
    } else {
      break;
    }
  }

  if (i >= steps.length) {
    return {
      flow: { ...flow, stepIndex: i, data, confirming: true },
      prompt: summary(data),
    };
  }
  return {
    flow: { ...flow, stepIndex: i, data },
    prompt: promptFor(steps[i], flow.defaults),
  };
}

export function startFlow(defaults: Values) {
  return advance({ stepIndex: -1, data: {}, defaults, confirming: false });
}

// Checks one answer and moves on, or asks again if it is not valid
export function answer(
  flow: FlowState,
  raw: string
): { flow: FlowState; reply: string } {
  const step = steps[flow.stepIndex];
  if (!step) {
    return { flow, reply: "Something went wrong. Please type Cancel and try again." };
  }

  let value = raw.trim();
  if (
    step.field === "message" &&
    value.toLowerCase() === "skip" &&
    flow.defaults.message
  ) {
    value = flow.defaults.message;
  }

  const error = step.validate(value);
  if (error) return { flow, reply: error };

  const next = advance({
    ...flow,
    data: { ...flow.data, [step.field]: value },
  });
  return { flow: next.flow, reply: next.prompt };
}
