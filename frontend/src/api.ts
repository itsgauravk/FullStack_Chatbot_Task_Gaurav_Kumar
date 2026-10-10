import type { Enquiry, EnquiryInput } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

interface ErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Please check your connection and try again."
    );
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // The server sent no JSON; handled below
  }

  if (!res.ok) {
    const err = (body ?? {}) as ErrorBody;
    const fieldErrors: Record<string, string> = {};
    err.errors?.forEach((e) => {
      fieldErrors[e.field] = e.message;
    });
    throw new ApiError(
      err.message ?? "Something went wrong. Please try again.",
      fieldErrors
    );
  }

  return body as T;
}

export function createEnquiry(input: EnquiryInput) {
  return request<{ message: string; enquiry: Enquiry }>("/api/enquiries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface EnquiryFilters {
  search?: string;
  userType?: string;
  status?: string;
}

export function getEnquiries(filters: EnquiryFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.userType) params.set("userType", filters.userType);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return request<{ count: number; enquiries: Enquiry[] }>(
    `/api/enquiries${query ? `?${query}` : ""}`
  );
}

export function updateEnquiryStatus(id: string, status: string) {
  return request<{ message: string; enquiry: Enquiry }>(
    `/api/enquiries/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export function deleteEnquiry(id: string) {
  return request<{ message: string }>(`/api/enquiries/${id}`, {
    method: "DELETE",
  });
}
