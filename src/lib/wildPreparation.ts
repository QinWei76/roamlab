import type { Wild } from "@/types/wild";
import type { PreparationPlan, PreparationTask, PreparationStatus } from "@/types/wildPreparation";

type Draft = Omit<PreparationTask, "status">;

/** Pure, offline, rule-based preparation guidance. No storage writes or live-data claims. */
export function generatePreparationPlan(wild: Wild): PreparationPlan {
  const a = wild.plan.adventure;
  const remote = a.tripStyle === "remote";
  const days = a.schedule?.days;
  const people = a.crew?.people;
  const hasRoute = Boolean(wild.plan.route?.points?.length);
  const hasGear = Boolean(wild.plan.prepare?.gear?.items?.length);
  const hasDates = Boolean(a.schedule?.startDate);
  const tasks: Draft[] = [];
  const add = (task: Draft) => tasks.push(task);

  add({ id: "mindset-contingency", area: "mindset", title: "Agree on expectations and turnaround rules", reason: "Weather, fatigue and access can change an outdoor trip.", action: "Discuss comfort levels, decision-making, and when the group will turn back or change plans.", priority: remote ? "important" : "recommended", phase: "early" });
  if (remote) add({ id: "mindset-remote-experience", area: "mindset", title: "Confirm remote-travel experience", reason: "Remote travel can involve limited services and difficult access; experience is not recorded.", action: "Review each person's relevant experience and choose a route and fallback suitable for the least experienced participant.", priority: "important", phase: "early", needsConfirmation: true });

  add({ id: "physical-capability", area: "physical", title: "Match activities to the group's physical capacity", reason: "Duration and destination alone do not establish trail difficulty or fitness requirements.", action: "Confirm planned activities, distances, elevation and each participant's current ability; adjust the plan before choosing a training load.", priority: "important", phase: "weeks-before", needsConfirmation: true });
  if (a.activities.some(x => ["hike", "backpack", "trail-run", "climb"].includes(x)) || a.wayIn === "hike") {
    add({ id: "physical-practice", area: "physical", title: "Practice the planned activity gradually", reason: "Relevant practice can reveal pacing, footwear and load issues before departure.", action: "Build up gradually toward the expected terrain and carrying load, allowing recovery; avoid abrupt increases.", priority: "recommended", phase: "weeks-before" });
  }

  add({ id: "supplies-food-water", area: "supplies", title: "Plan daily food and water with resupply", reason: `${days ? `The plan lasts ${days} day(s)` : "Trip length is not confirmed"}${people ? ` for ${people} person(s)` : " and crew size is not confirmed"}; access to safe water and resupply has not been verified.`, action: "Identify confirmed water and food sources, estimate needs for each person and activity day, and carry a contingency reserve appropriate to conditions.", priority: "important", phase: "weeks-before", needsConfirmation: true });
  if (a.wayIn === "drive") add({ id: "supplies-vehicle-fuel", area: "supplies", title: "Confirm fuel and vehicle consumables", reason: "A vehicle-based trip depends on actual route distance and service availability.", action: "Check vehicle condition, route distance, fuel or charging stops and contingency supplies before departure.", priority: remote ? "important" : "recommended", phase: "final-week", needsConfirmation: true });

  add({ id: "gear-review", area: "gear", title: hasGear ? "Review and test your saved gear" : "Build your Gear System", reason: hasGear ? "A saved gear list exists, but suitability and working condition still require review." : "No saved equipment list is available to verify readiness.", action: hasGear ? "Check essential items against actual weather and activities; test critical equipment and resolve missing items." : "Open Gear Room, identify essential personal, camp/vehicle and safety equipment, and mark owned, needed, rented or skipped items.", priority: "important", phase: "weeks-before" });

  if (!hasRoute) add({ id: "logistics-route", area: "logistics", title: "Build a realistic route and fallback", reason: "A destination is not a confirmed itinerary.", action: "Confirm access roads or trails, daily travel time, overnight stops, permissions, resupply and an accessible alternative.", priority: "important", phase: "early", needsConfirmation: true });
  if (!hasDates) add({ id: "logistics-dates", area: "logistics", title: "Confirm travel dates and seasonal access", reason: "Without dates, permits, closures and seasonal conditions cannot be checked reliably.", action: "Set or narrow travel dates, then check official access rules, reservation requirements and seasonal restrictions.", priority: "important", phase: "early", needsConfirmation: true });
  add({ id: "logistics-final-check", area: "logistics", title: "Reconfirm reservations and access", reason: "Access, services and restrictions can change close to departure.", action: "Check official park or land-manager updates, bookings, road or trail status and alternate plans.", priority: "important", phase: "final-week" });

  if (!wild.plan.safety?.emergencyPlan?.communicationPlan) add({ id: "safety-communications", area: "safety", title: "Establish emergency communications", reason: "No communication plan is recorded; coverage may be unreliable, particularly in remote areas.", action: "Verify actual coverage, choose an appropriate backup, share your itinerary with a trusted contact and agree on missed-check-in actions.", priority: "important", phase: "weeks-before", needsConfirmation: true });
  add({ id: "safety-conditions", area: "safety", title: "Review current conditions and exit criteria", reason: "A planning tool cannot assume live weather, fire, road or trail conditions.", action: "Consult authoritative forecasts and local alerts shortly before departure; identify thresholds for delaying, rerouting or cancelling.", priority: "important", phase: "day-before", needsConfirmation: true });
  add({ id: "safety-departure", area: "safety", title: "Complete a departure safety check", reason: "Final checks catch last-minute changes and missing essentials.", action: "Confirm people, route, navigation, first aid, communication, supplies and a trusted contact's check-in expectations.", priority: "important", phase: "departure" });

  return { wildId: wild.id, generatedAt: new Date().toISOString(), tasks: tasks.map(task => ({ ...task, status: "todo" })) };
}

/** Preserve task decisions when regenerating the same Wild's plan. */
export function mergePreparationPlan(next: PreparationPlan, previous?: PreparationPlan): PreparationPlan {
  if (!previous || previous.wildId !== next.wildId) return next;
  const statuses = new Map<string, PreparationStatus>(previous.tasks.map(t => [t.id, t.status]));
  return { ...next, tasks: next.tasks.map(t => ({ ...t, status: statuses.get(t.id) ?? t.status })) };
}

/** Return an updated copy; the caller chooses when and where to persist it. */
export function setPreparationTaskStatus(plan: PreparationPlan, taskId: string, status: PreparationStatus): PreparationPlan {
  return { ...plan, tasks: plan.tasks.map(t => t.id === taskId ? { ...t, status } : t) };
}
