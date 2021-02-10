export interface ShiftSummary {
  id: number;
  date: string;
  event: string;
  location: string;
  duration: number;
  role: "EAC" | "AFA" | "CRU";
  crewMate: string;
  loggedCalls: number;
}
