import { Router } from "express";
import mongoose from "mongoose";
import { Enquiry, USER_TYPES, STATUSES } from "../models/Enquiry";
import { enquirySchema, updateEnquirySchema } from "../validation";

const router = Router();

// Makes special characters safe before using them in a search
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/enquiries - get all (supports ?search= &userType= &status=)
router.get("/", async (req, res) => {
  try {
    const { search, userType, status } = req.query;
    const filter: Record<string, unknown> = {};

    if (
      typeof userType === "string" &&
      (USER_TYPES as readonly string[]).includes(userType)
    ) {
      filter.userType = userType;
    }
    if (
      typeof status === "string" &&
      (STATUSES as readonly string[]).includes(status)
    ) {
      filter.status = status;
    }
    if (typeof search === "string" && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { interest: regex },
        { message: regex },
      ];
    }

    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    return res.json({ count: enquiries.length, enquiries });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});

// GET /api/enquiries/:id - get one
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Enquiry not found" });
  }
  try {
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    return res.json({ enquiry });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});

// POST /api/enquiries - create a new enquiry
router.post("/", async (req, res) => {
  const result = enquirySchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res
      .status(400)
      .json({ message: "Please fix the errors below", errors });
  }

  try {
    const enquiry = await Enquiry.create(result.data);
    return res
      .status(201)
      .json({ message: "Enquiry submitted successfully", enquiry });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});


// PATCH /api/enquiries/:id - update an enquiry (for example, change its status)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Enquiry not found" });
  }

  const result = updateEnquirySchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res
      .status(400)
      .json({ message: "Please fix the errors below", errors });
  }
  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const enquiry = await Enquiry.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    });
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    return res.json({ message: "Enquiry updated successfully", enquiry });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});

// DELETE /api/enquiries/:id - delete an enquiry
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Enquiry not found" });
  }
  try {
    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    return res.json({ message: "Enquiry deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});

export default router;
