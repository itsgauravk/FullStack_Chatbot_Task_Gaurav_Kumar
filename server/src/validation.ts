import { z } from "zod";
import { USER_TYPES, STATUSES } from "./models/Enquiry";

// Removes < and > so users cannot inject HTML tags
const clean = (value: string) => value.replace(/[<>]/g, "").trim();

const text = (label: string, max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .max(max, `${label} is too long`)
    );

export const enquirySchema = z.object({
  name: text("Name", 100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,15}$/, "Please enter a valid phone number"),
  userType: z.enum(USER_TYPES),
  interest: text("Service or course of interest", 150),
  message: text("Message", 1000),
});

// For updates, every field is optional, and status can be changed
export const updateEnquirySchema = enquirySchema
  .partial()
  .extend({ status: z.enum(STATUSES).optional() });
