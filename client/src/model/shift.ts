export type RoleType = "EAC" | "AFA" | "CRU";

export interface Shift {
  id: string;
  date: string;
  event: string;
  location?: string;
  duration: number;
  role: RoleType;
  crewMate?: string;
}

export interface ShiftSummary extends Shift {
  loggedCalls: number;
}

export interface NewShift extends Omit<Shift, "id"> {}
