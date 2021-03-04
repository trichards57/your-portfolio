export type Outcome =
  | "DischargedOnScene"
  | "NotFound"
  | "StoodDown"
  | "Conveyed"
  | "Other";

export interface NewJob {
  age?: number;
  blueLights: boolean;
  category: 1 | 2 | 3 | 4 | 5;
  drove: boolean;
  gender?: "Male" | "Female";
  notes: string;
  outcome: Outcome;
  reflectionFlag: boolean;
  shift: string;
}

export interface JobSummary {
  age?: number;
  category: 1 | 2 | 3 | 4 | 5;
  gender?: "Male" | "Female";
  reflectionFlag: boolean;
}
