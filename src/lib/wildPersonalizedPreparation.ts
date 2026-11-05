
import type {
  PreparationPlan,
  PreparationTask,
} from "@/types/wildPreparation";

import type {
  TravelerReadinessProfile,
} from "@/types/wildTravelerProfile";

/**
 * ROAMLAB — PERSONALIZED PREPARATION ENGINE
 *
 * Pure, rule-based personalization.
 *
 * This module:
 * - Does not modify the original plan
 * - Does not write to localStorage
 * - Preserves existing task IDs and statuses
 * - Adds stable IDs for new tasks
 * - Does not claim to verify live conditions
 */

type Draft = Omit<PreparationTask, "status">;

export function personalizePreparationPlan(
  plan: PreparationPlan,
  profile: TravelerReadinessProfile | null
): PreparationPlan {
  if (!profile || profile.wildId !== plan.wildId) {
    return plan;
  }

  const tasks: PreparationTask[] = plan.tasks.map(
    (task) => ({ ...task })
  );

  const existingIds = new Set(
    tasks.map((task) => task.id)
  );

  function add(task: Draft) {
    if (existingIds.has(task.id)) return;

    existingIds.add(task.id);

    tasks.push({
      ...task,
      status: "todo",
    });
  }

  function update(
    id: string,
    changes: Partial<PreparationTask>
  ) {
    const index = tasks.findIndex(
      (task) => task.id === id
    );

    if (index === -1) return;

    tasks[index] = {
      ...tasks[index],
      ...changes,
      id: tasks[index].id,
      status: tasks[index].status,
    };
  }

  const beginner =
    profile.experience === "beginner";

  const remoteExperienceGap =
    profile.skills.remoteTravel === "none" ||
    profile.skills.remoteTravel === "basic";

  const navigationGap =
    profile.skills.navigation === "none" ||
    profile.skills.navigation === "basic";

  const firstAidGap =
    profile.skills.firstAid === "none" ||
    profile.skills.firstAid === "basic";

  const campingGap =
    profile.skills.camping === "none" ||
    profile.skills.camping === "basic";

  const camping =
    profile.activities.includes("camping");

  const hiking =
    profile.activities.includes("day-hiking") ||
    profile.activities.includes("backcountry-hiking");

  const backcountry =
    profile.activities.includes("backcountry-hiking");

  const offRoad =
    profile.activities.includes("off-road-driving");

  /**
   * 1. MINDSET & EXPERIENCE
   */

  if (beginner) {
    update("mindset-contingency", {
      priority: "important",
      action:
        "Before departure, discuss what each traveler is " +
        "comfortable attempting, who makes route decisions, " +
        "and clear conditions for turning back. " +
        "Choose a manageable first itinerary.",
    });

    add({
      id: "personal-beginner-practice",
      area: "mindset",
      title: "Complete a low-risk practice outing",
      reason:
        "A short practice outing can reveal gaps in " +
        "equipment, confidence and trip routines.",
      action:
        "Plan a short outing in accessible conditions. " +
        "Practice navigation, packing, group decisions " +
        "and returning on schedule before attempting " +
        "more demanding travel.",
      priority: "important",
      phase: "weeks-before",
    });
  }

  if (remoteExperienceGap) {
    update("mindset-remote-experience", {
      priority: "important",
      reason:
        "The traveler reports limited remote-travel " +
        "experience. The full group's experience " +
        "still needs confirmation.",
      action:
        "Review the experience of every participant. " +
        "Consider a less isolated route, a shorter " +
        "first outing or support from a qualified guide. " +
        "Establish clear turnaround criteria.",
      needsConfirmation: true,
    });
  }

  /**
   * 2. PHYSICAL PREPARATION
   */

  if (hiking) {
    add({
      id: "personal-hiking-route-match",
      area: "physical",
      title: "Match hiking routes to current ability",
      reason:
        "The traveler has selected hiking, but " +
        "route distance, elevation and trail " +
        "conditions still require confirmation.",
      action:
        "Identify candidate trails and verify their " +
        "distance, elevation gain, terrain and " +
        "expected duration. Choose an achievable " +
        "route for the least prepared participant " +
        "and include a shorter alternative.",
      priority: "important",
      phase: "early",
      needsConfirmation: true,
    });
  }

  if (
    hiking &&
    (profile.fitness === "light" ||
      profile.fitness === "moderate")
  ) {
    add({
      id: "personal-hiking-conditioning",
      area: "physical",
      title: "Practice walking with expected equipment",
      reason:
        "Hiking readiness depends on terrain, " +
        "duration, carrying load and recovery.",
      action:
        "Practice progressively on suitable terrain " +
        "with the footwear and pack intended for " +
        "the trip. Check comfort, pacing and recovery. " +
        "Avoid sudden increases in effort.",
      priority: "recommended",
      phase: "weeks-before",
    });
  }

  /**
   * 3. CAMPING & GEAR
   */

  if (camping && (beginner || campingGap)) {
    add({
      id: "personal-camp-setup-practice",
      area: "gear",
      title: "Practice your complete campsite setup",
      reason:
        "Camping requires equipment familiarity " +
        "and a reliable overnight routine.",
      action:
        "Before departure, practice setting up shelter, " +
        "sleeping equipment, lighting and cooking systems " +
        "where permitted. Check that equipment works " +
        "and that everyone understands their tasks.",
      priority: "important",
      phase: "weeks-before",
    });
  }

  if (backcountry) {
    add({
      id: "personal-backcountry-readiness",
      area: "logistics",
      title: "Confirm backcountry access and overnight plan",
      reason:
        "Backcountry travel may require permits, " +
        "route-specific preparation and greater " +
        "self-sufficiency.",
      action:
        "Verify official access rules, required permits, " +
        "legal overnight locations, water availability, " +
        "route difficulty and exit options. " +
        "Do not assume reservations or access are available.",
      priority: "important",
      phase: "early",
      needsConfirmation: true,
    });
  }

  /**
   * 4. NAVIGATION & REMOTE TRAVEL
   */

  if (navigationGap && (hiking || offRoad)) {
    add({
      id: "personal-navigation-practice",
      area: "safety",
      title: "Practice navigation before departure",
      reason:
        "The traveler reports limited navigation " +
        "experience, while the selected activities " +
        "may require independent route finding.",
      action:
        "Download suitable offline maps, learn to " +
        "locate your position and follow a planned route. " +
        "Practice in a familiar area and prepare " +
        "a backup navigation method.",
      priority: "important",
      phase: "weeks-before",
    });
  }

  if (offRoad) {
    add({
      id: "personal-offroad-access",
      area: "logistics",
      title: "Verify vehicle and route suitability",
      reason:
        "Off-road travel depends on actual road " +
        "conditions, vehicle capability and legal access.",
      action:
        "Check official road access information, " +
        "vehicle limitations, tire and recovery equipment, " +
        "fuel range and alternative routes. " +
        "Do not enter unknown terrain based solely " +
        "on a map.",
      priority: "important",
      phase: "early",
      needsConfirmation: true,
    });
  }

  /**
   * 5. FIRST AID & EMERGENCY READINESS
   */

  if (firstAidGap) {
    add({
      id: "personal-first-aid-readiness",
      area: "safety",
      title: "Improve first-aid readiness",
      reason:
        "The traveler reports limited first-aid " +
        "experience. A first-aid kit alone does " +
        "not establish the ability to use it.",
      action:
        "Review basic first-aid procedures, consider " +
        "appropriate training, check essential supplies " +
        "and identify how professional help can " +
        "be contacted along the planned route.",
      priority: "important",
      phase: "weeks-before",
    });
  }

  /**
   * 6. GROUP SUPPORT
   */

  if (profile.additionalSupportNeeded === true) {
    add({
      id: "personal-group-support",
      area: "mindset",
      title: "Adapt the itinerary for group support needs",
      reason:
        "The traveler has indicated that someone " +
        "may need additional planning support.",
      action:
        "Discuss practical requirements privately " +
        "with the relevant participant. Review pace, " +
        "accessibility, rest opportunities, transport " +
        "and realistic alternatives without assuming " +
        "a specific medical condition.",
      priority: "important",
      phase: "early",
      needsConfirmation: true,
    });
  }

  return {
    ...plan,
    tasks,
  };
}
