import type { Enquiry, EnquiryInput } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
const ADMIN_KEY = "dronetv-admin-password";

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

export function getAdminPassword(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setAdminPassword(password: string) {
  try {
    sessionStorage.setItem(ADMIN_KEY, password);
  } catch {
    // Ignore storage errors
  }
}

export function clearAdminPassword() {
  try {
    sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    // Ignore storage errors
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  admin = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (admin) headers["x-admin-password"] = getAdminPassword();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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
    if (admin && res.status === 401) {
      clearAdminPassword();
      window.dispatchEvent(new Event("admin-unauthorized"));
    }
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
    `/api/enquiries${query ? `?${query}` : ""}`,
    {},
    true
  );
}

export function updateEnquiryStatus(id: string, status: string) {
  return request<{ message: string; enquiry: Enquiry }>(
    `/api/enquiries/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true
  );
}

export function deleteEnquiry(id: string) {
  return request<{ message: string }>(
    `/api/enquiries/${id}`,
    { method: "DELETE" },
    true
  );
}
