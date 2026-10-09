import { Schema, model } from "mongoose";

export const USER_TYPES = ["Student", "Customer", "Other"] as const;
export const STATUSES = ["New", "Contacted", "In Progress", "Closed"] as const;

const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    userType: { type: String, enum: USER_TYPES, required: true },
    interest: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: STATUSES, default: "New" },
  },
  { timestamps: true }
);

export const Enquiry = model("Enquiry", enquirySchema);
