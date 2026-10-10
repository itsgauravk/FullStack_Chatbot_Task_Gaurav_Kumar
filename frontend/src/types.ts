export const USER_TYPES = ["Student", "Customer", "Other"] as const;
export const STATUSES = ["New", "Contacted", "In Progress", "Closed"] as const;

export type UserType = (typeof USER_TYPES)[number];
export type Status = (typeof STATUSES)[number];

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  interest: string;
  message: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  userType: UserType | "";
  interest: string;
  message: string;
}
