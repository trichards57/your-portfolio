export type RoleType = "EAC" | "AFA" | "CRU";

export interface Shift {
  crewMate?: string;
  date: string;
  duration: number;
  event: string;
  id: string;
  location?: string;
  role: RoleType;
}

export interface ShiftSummary extends Shift {
  loggedCalls: number;
}

export type NewShift = Omit<Shift, "id">;
