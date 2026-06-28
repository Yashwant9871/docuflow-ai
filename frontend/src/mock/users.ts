import type { User } from "./types";

export const demoUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@docuflow.ai", role: "ADMIN", initials: "AU" },
  { id: "u2", name: "Process User", email: "processor@docuflow.ai", role: "PROCESSOR", initials: "PU" },
  { id: "u3", name: "Review User", email: "reviewer@docuflow.ai", role: "REVIEWER", initials: "RU" },
  { id: "u4", name: "Approval User", email: "approver@docuflow.ai", role: "APPROVER", initials: "AP" },
];
