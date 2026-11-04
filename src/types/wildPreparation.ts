/** RoamLab Advisor V2 — independent preparation task types. */
export type PreparationArea =
  | "mindset" | "physical" | "supplies" | "gear" | "logistics" | "safety";
export type PreparationPriority = "critical" | "important" | "recommended";
export type PreparationPhase = "early" | "weeks-before" | "final-week" | "day-before" | "departure";
export type PreparationStatus = "todo" | "in-progress" | "done" | "not-applicable";

export interface PreparationTask {
  id: string;
  area: PreparationArea;
  title: string;
  reason: string;
  action: string;
  priority: PreparationPriority;
  phase: PreparationPhase;
  status: PreparationStatus;
  /** Optional reference to an existing planning issue; no dependency on it. */
  relatedIssueId?: string;
  /** True when a missing fact must be confirmed before specific advice is possible. */
  needsConfirmation?: boolean;
}

export interface PreparationPlan {
  wildId: string;
  generatedAt: string;
  tasks: PreparationTask[];
}
