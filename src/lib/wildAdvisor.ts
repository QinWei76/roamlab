import type { Wild, WildPlanningIssue, WildPlanningSeverity } from "@/types/wild";

/** Pure, deterministic V1 advisor. No network calls or writes. */
export function analyzeWild(wild: Wild): WildPlanningIssue[] {
  const a = wild.plan.adventure;
  const issues: WildPlanningIssue[] = [];
  const add = (id: string, area: WildPlanningIssue["area"], severity: WildPlanningSeverity, title: string, explanation: string, evidence: string[], actionTitle: string, actionDescription: string) => {
    issues.push({
      id: `advisor-v1:${id}`, area, severity, status: "open", title, explanation, evidence,
      suggestions: [{ id: `advisor-v1:${id}:action`, action: "custom", title: actionTitle, description: actionDescription }],
    });
  };

  if (!a.destination?.name?.trim()) {
    add("destination", "destination", "important", "Choose a destination", "A destination is needed before route, access and local requirements can be assessed.", [], "Confirm your destination", "Select a destination and verify its official access information.");
  }
  if (!a.schedule?.startDate) {
    add("dates", "duration", "attention", "Confirm travel dates", "Without travel dates, seasonal conditions, closures and permit windows cannot be checked.", [], "Set your dates", "Choose departure dates before relying on weather or access assumptions.");
  }
  if (!a.crew?.people || a.crew.people < 1) {
    add("crew", "crew", "attention", "Confirm your crew", "Food, water, vehicle capacity and emergency planning depend on the number of travelers.", [], "Set the group size", "Confirm how many people will travel.");
  }
  if (a.tripStyle === "remote") {
    add("remote-experience", "experience", "important", "Review remote-travel experience", "Remote travel can involve reduced services, difficult access and limited communication. The current plan does not establish the group's experience.", ["Trip style: remote"], "Confirm skills and fallback options", "Review group experience, choose a suitable route, identify an accessible fallback and agree on turnaround criteria.");
    if (!wild.plan.safety?.emergencyPlan?.communicationPlan) {
      add("remote-communications", "safety", "important", "Prepare an emergency communication plan", "Remote travel may have unreliable cell service; actual coverage has not been verified.", ["Trip style: remote", "Communication plan: not recorded"], "Document a communication and check-in plan", "Check actual coverage, consider an appropriate backup communication method, and share your route and check-in expectations with a trusted contact.");
    }
  }
  if (!wild.plan.route?.points?.length) {
    add("route", "route", "important", "Build a practical route", "A destination alone does not confirm driving time, daily stops, access restrictions or backup options.", [], "Plan the route and overnight stops", "Identify the intended route, realistic daily travel time, overnight locations, resupply points and a fallback route.");
  }
  if (!wild.plan.conditions?.weatherSummary && wild.plan.conditions?.expectedMinTempC === undefined) {
    add("conditions", "safety", "attention", "Check local conditions", "Weather and temperature have not been confirmed for the planned dates and route.", [], "Check authoritative conditions", "Before departure, review official forecasts, road and trail alerts, and adjust the plan as conditions change.");
  }
  if (!wild.plan.prepare?.gear?.items?.length) {
    add("gear", "gear", "attention", "Review expedition equipment", "The current plan has no saved gear checklist, so equipment readiness cannot yet be assessed.", [], "Build your Gear System", "Review personal, vehicle and camp, and safety equipment in Gear Room; mark what you own, need, rent or can skip.");
  }
  if (!wild.plan.safety?.emergencyPlan?.checkInPlan) {
    add("check-in", "safety", "attention", "Set a check-in and contingency plan", "No check-in procedure has been recorded.", [], "Agree on a check-in plan", "Tell a trusted person your route, expected return and what to do if you miss a check-in.");
  }
  const days = a.schedule?.days;
  if (days && days > 1) {
    add("supplies", "food-water", "attention", "Calculate supplies and resupply", `This is a ${days}-day trip; daily food, water and consumables need to be planned against actual access to supplies.`, [`Duration: ${days} days`], "Build a daily supplies plan", "Estimate per-person food and water needs, identify verified resupply points, and add an appropriate contingency reserve based on conditions.");
  }
  if (a.wayIn === "hike" || a.activities.includes("hike") || a.activities.includes("backpack")) {
    add("physical", "capacity", "attention", "Match physical preparation to the route", "Hiking demands depend on distance, elevation gain, terrain, load and individual capacity; these have not all been verified.", [], "Review fitness and route difficulty", "Confirm distance, ascent, expected pack weight and group ability; plan progressive training and an easier alternative if needed.");
  }
  const cost = wild.plan.cost;
  if (cost?.budgetStatus === "unknown" || cost?.totalWildBudget === undefined) {
    add("budget", "budget", "attention", "Confirm trip budget", "Without a total budget, the plan's affordability cannot be assessed.", [], "Set or estimate a budget", "Estimate transportation, accommodation, food, permits, gear and emergency reserve before committing.");
  } else if (cost.estimatedTotal !== undefined && cost.estimatedTotal > cost.totalWildBudget) {
    add("over-budget", "budget", "important", "Estimated cost exceeds your budget", "Current estimated trip costs exceed the total budget.", [`Estimated: ${cost.estimatedTotal} ${cost.currency}`, `Budget: ${cost.totalWildBudget} ${cost.currency}`], "Rebalance the plan", "Review major costs and compare shorter, closer or lower-cost options; do not automatically remove the emergency reserve.");
  } else if (cost.estimatedTotal === undefined) {
    add("cost-estimate", "budget", "attention", "Estimate full trip costs", "A budget target is not the same as a verified trip cost estimate.", [`Budget: ${cost.totalWildBudget} ${cost.currency}`], "Build a cost estimate", "Estimate transport, lodging, food, permits, equipment and contingency costs.");
  }
  return issues;
}

/** Merge regenerated advice with user decisions; keep unrelated planning issues. */
export function mergeAdvisorIssues(existing: WildPlanningIssue[] = [], generated: WildPlanningIssue[]): WildPlanningIssue[] {
  const previous = new Map(existing.map((issue) => [issue.id, issue]));
  return [
    ...existing.filter((issue) => !issue.id.startsWith("advisor-v1:")),
    ...generated.map((issue) => {
      const old = previous.get(issue.id);
      return old ? { ...issue, status: old.status, createdAt: old.createdAt, updatedAt: old.updatedAt } : issue;
    }),
  ];
}
