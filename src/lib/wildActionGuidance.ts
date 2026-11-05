
import type { PreparationTask } from "@/types/wildPreparation";

/**
 * ROAMLAB — ACTION GUIDANCE ENGINE V4
 *
 * Adds practical execution guidance to existing
 * preparation tasks without changing their
 * IDs, status, priority or saved progress.
 */

export interface ActionGuidance {
  taskId: string;
  steps: string[];
  materials: string[];
  completionCriteria: string[];
  fallback: string;
}

type GuidanceContent = Omit<ActionGuidance, "taskId">;

const guidanceLibrary: Record<string, GuidanceContent> = {
  "mindset-contingency": {
    steps: [
      "Discuss the group's expectations, preferred pace and comfort limits.",
      "Agree on who makes decisions when plans need to change.",
      "Define situations that require stopping, turning back or changing the itinerary.",
      "Share the agreed decisions with every participant.",
    ],
    materials: [
      "Draft itinerary",
      "Group contact details",
      "Shared planning notes",
    ],
    completionCriteria: [
      "Every participant understands the plan and its alternatives.",
      "Turnaround criteria and decision responsibilities are recorded.",
    ],
    fallback:
      "If the group cannot agree on a suitable plan, reduce the difficulty or postpone the more demanding activity.",
  },

  "mindset-remote-experience": {
    steps: [
      "Review each participant's experience with similar terrain and trip conditions.",
      "Identify gaps in navigation, camping, vehicle handling and emergency skills.",
      "Choose a route suitable for the least experienced participant.",
      "Prepare a less isolated alternative.",
    ],
    materials: [
      "Participant experience notes",
      "Candidate route information",
      "Alternative itinerary",
    ],
    completionCriteria: [
      "Relevant experience has been discussed with the group.",
      "The chosen route and fallback reflect the group's capabilities.",
    ],
    fallback:
      "Choose an accessible itinerary or seek appropriate professional guidance.",
  },

  "physical-capability": {
    steps: [
      "Identify the activities planned for each day.",
      "Confirm distances, elevation gain, terrain and expected activity duration.",
      "Discuss each participant's current ability and recent relevant experience.",
      "Reduce route demands or adjust the schedule where necessary.",
    ],
    materials: [
      "Route descriptions",
      "Elevation information",
      "Daily activity outline",
    ],
    completionCriteria: [
      "Activity demands have been checked against each participant's abilities.",
      "A manageable alternative is available.",
    ],
    fallback:
      "Select shorter, easier activities with reliable access and exit options.",
  },

  "physical-practice": {
    steps: [
      "Identify the physical demands of the planned activity.",
      "Practice on accessible terrain with appropriate footwear and equipment.",
      "Increase activity gradually while allowing recovery.",
      "Reassess the intended route if practice reveals significant difficulty.",
    ],
    materials: [
      "Suitable footwear",
      "Planned carrying equipment",
      "Practice route",
    ],
    completionCriteria: [
      "Relevant equipment has been tested during practice.",
      "The planned activity has been adjusted to demonstrated capability.",
    ],
    fallback:
      "Reduce the activity difficulty rather than attempting a sudden increase in training load.",
  },

  "supplies-food-water": {
    steps: [
      "List each day's activities, travel time and overnight arrangements.",
      "Identify verified drinking-water sources and resupply locations.",
      "Plan food and water for each participant using expected conditions and activity demands.",
      "Determine appropriate contingency supplies and safe storage requirements.",
      "Check the complete supply plan before departure.",
    ],
    materials: [
      "Daily itinerary",
      "Food inventory",
      "Water containers",
      "Water treatment equipment where appropriate",
      "Resupply information",
    ],
    completionCriteria: [
      "Every day has a documented food and water plan.",
      "Water sources and resupply assumptions have been checked.",
      "Contingency supplies and storage arrangements are accounted for.",
    ],
    fallback:
      "Shorten the itinerary or choose a route with dependable resupply rather than relying on unverified water sources.",
  },

  "supplies-vehicle-fuel": {
    steps: [
      "Estimate the planned driving distance using the actual route.",
      "Check fuel or charging availability along the route.",
      "Inspect the vehicle and required consumables.",
      "Identify backup service locations and alternatives if access changes.",
    ],
    materials: [
      "Vehicle information",
      "Route map",
      "Fuel or charging plan",
      "Vehicle inspection checklist",
    ],
    completionCriteria: [
      "Vehicle range and service access have been reviewed.",
      "A practical backup plan exists.",
    ],
    fallback:
      "Choose a route with more reliable services or reduce remote driving.",
  },

  "gear-review": {
    steps: [
      "Open Gear Room and review the equipment categories.",
      "Identify essential items for the actual activities and expected conditions.",
      "Mark which items are owned, needed, borrowed or rented.",
      "Test critical equipment before departure.",
      "Resolve essential equipment gaps.",
    ],
    materials: [
      "Gear Room checklist",
      "Existing equipment",
      "Trip activity information",
    ],
    completionCriteria: [
      "Essential equipment has been reviewed.",
      "Critical equipment has been tested.",
      "Unresolved essential gaps are identified for action.",
    ],
    fallback:
      "Rent or borrow suitable equipment, change the activity or postpone it if essential equipment is unavailable.",
  },

  "logistics-route": {
    steps: [
      "Choose realistic daily destinations and stopping points.",
      "Check official road, trail and access information.",
      "Verify overnight arrangements, permits and reservations.",
      "Estimate travel time with appropriate breaks and contingency time.",
      "Document an accessible alternative route.",
    ],
    materials: [
      "Route map",
      "Official access information",
      "Reservation details",
      "Daily itinerary",
    ],
    completionCriteria: [
      "Daily travel and overnight arrangements are documented.",
      "Access requirements and alternatives have been reviewed.",
    ],
    fallback:
      "Use a simpler itinerary with confirmed access and services.",
  },

  "logistics-dates": {
    steps: [
      "Select proposed travel dates.",
      "Review seasonal access and activity restrictions.",
      "Check official permit and reservation requirements.",
      "Adjust dates if access or availability does not support the plan.",
    ],
    materials: [
      "Proposed travel dates",
      "Official destination information",
      "Booking records",
    ],
    completionCriteria: [
      "Travel dates are recorded.",
      "Relevant access and booking requirements have been checked.",
    ],
    fallback:
      "Change the travel dates or choose an accessible alternative.",
  },

  "logistics-final-check": {
    steps: [
      "Reconfirm reservations and permissions.",
      "Check official road and trail status.",
      "Review updated destination alerts and restrictions.",
      "Confirm backup arrangements if access has changed.",
    ],
    materials: [
      "Reservation confirmations",
      "Official destination updates",
      "Alternative itinerary",
    ],
    completionCriteria: [
      "Reservations and access have been rechecked close to departure.",
      "The group knows what to do if the original plan changes.",
    ],
    fallback:
      "Switch to a confirmed alternative or delay the affected activity.",
  },

  "safety-communications": {
    steps: [
      "Check communication coverage along the actual route.",
      "Choose suitable primary and backup communication methods.",
      "Share the itinerary with a trusted contact.",
      "Agree on check-in times and missed-check-in actions.",
      "Test communication equipment where possible.",
    ],
    materials: [
      "Itinerary",
      "Contact details",
      "Communication devices",
      "Check-in plan",
    ],
    completionCriteria: [
      "A trusted contact has the itinerary and check-in expectations.",
      "Communication limitations and backup arrangements are understood.",
    ],
    fallback:
      "Choose a less isolated route if reliable emergency communication cannot be arranged for the planned risk level.",
  },

  "safety-conditions": {
    steps: [
      "Check authoritative weather forecasts and local alerts.",
      "Review fire, road, trail and other relevant access conditions.",
      "Compare expected conditions with equipment and group capability.",
      "Define conditions that require delaying, changing or cancelling the plan.",
    ],
    materials: [
      "Official forecasts",
      "Destination alerts",
      "Route information",
    ],
    completionCriteria: [
      "Conditions have been checked close to departure.",
      "Clear change-of-plan criteria are understood.",
    ],
    fallback:
      "Delay, reroute or cancel activities when conditions exceed the group's preparation.",
  },

  "safety-departure": {
    steps: [
      "Confirm everyone understands the itinerary.",
      "Check essential supplies, navigation and communication equipment.",
      "Review first-aid readiness and emergency contacts.",
      "Confirm the latest access and weather information.",
      "Notify the trusted contact of the departure plan.",
    ],
    materials: [
      "Departure checklist",
      "Emergency contacts",
      "Navigation tools",
      "First-aid supplies",
      "Communication equipment",
    ],
    completionCriteria: [
      "Critical departure checks are completed.",
      "The itinerary and check-in plan have been shared.",
    ],
    fallback:
      "Delay departure until critical safety or access issues are resolved.",
  },

  "personal-beginner-practice": {
    steps: [
      "Choose an accessible practice location with a straightforward return route.",
      "Practice packing and using essential equipment.",
      "Follow a short planned route using navigation tools.",
      "Practice group communication and turnaround decisions.",
      "Record problems and adjust the main trip plan.",
    ],
    materials: [
      "Daypack",
      "Navigation tools",
      "Essential trip equipment",
      "Practice itinerary",
    ],
    completionCriteria: [
      "A practice outing has been completed.",
      "Equipment or skill gaps have been identified and addressed.",
    ],
    fallback:
      "Reduce the complexity of the main trip or arrange experienced support.",
  },

  "personal-hiking-route-match": {
    steps: [
      "Identify candidate hiking routes.",
      "Check distance, elevation gain, terrain and current access.",
      "Compare route demands with each participant's experience.",
      "Select a manageable primary route and a shorter alternative.",
    ],
    materials: [
      "Trail descriptions",
      "Maps",
      "Elevation information",
    ],
    completionCriteria: [
      "The chosen route reflects group capability.",
      "A shorter alternative is documented.",
    ],
    fallback:
      "Choose an easier trail or replace the hike with an accessible activity.",
  },

  "personal-hiking-conditioning": {
    steps: [
      "Review the expected hiking duration and terrain.",
      "Practice walking on suitable terrain with intended footwear.",
      "Test the expected carrying equipment.",
      "Allow recovery and adjust activity demands based on practice.",
    ],
    materials: [
      "Hiking footwear",
      "Daypack",
      "Practice route",
    ],
    completionCriteria: [
      "Footwear and carrying equipment have been tested.",
      "The selected hike is consistent with demonstrated ability.",
    ],
    fallback:
      "Choose shorter or less demanding hikes rather than forcing a training target.",
  },

  "personal-camp-setup-practice": {
    steps: [
      "Lay out and inspect all shelter and sleeping equipment.",
      "Practice assembling shelter in an appropriate location.",
      "Test lighting and permitted cooking equipment safely.",
      "Review food storage and campsite rules.",
      "Pack the equipment again using a repeatable checklist.",
    ],
    materials: [
      "Shelter",
      "Sleeping equipment",
      "Lighting",
      "Cooking equipment where permitted",
      "Packing checklist",
    ],
    completionCriteria: [
      "Critical campsite equipment has been assembled and checked.",
      "The group understands basic campsite routines.",
    ],
    fallback:
      "Use an established accommodation option or simplify the camping plan if essential systems cannot be prepared.",
  },

  "personal-backcountry-readiness": {
    steps: [
      "Confirm official backcountry access rules and permit requirements.",
      "Review route difficulty, legal overnight locations and water access.",
      "Assess navigation and emergency communication readiness.",
      "Identify exit routes and a less demanding alternative.",
    ],
    materials: [
      "Official permit information",
      "Detailed route maps",
      "Overnight plan",
      "Emergency communication plan",
    ],
    completionCriteria: [
      "Access and overnight requirements have been verified.",
      "Route, water and exit assumptions have been reviewed.",
    ],
    fallback:
      "Use an established frontcountry itinerary if backcountry requirements cannot be met.",
  },

  "personal-navigation-practice": {
    steps: [
      "Download maps covering the planned route for offline use.",
      "Learn how to identify your current position and follow the route.",
      "Practice navigation in a familiar area.",
      "Prepare and test a suitable backup navigation method.",
      "Review what to do if the planned route becomes unavailable.",
    ],
    materials: [
      "Offline maps",
      "Charged navigation device",
      "Backup map or navigation tool",
    ],
    completionCriteria: [
      "The traveler has practiced locating their position without mobile data.",
      "A backup navigation method is available and understood.",
    ],
    fallback:
      "Select a well-marked, accessible route or travel with appropriately experienced support.",
  },

  "personal-offroad-access": {
    steps: [
      "Verify that the intended road is legally accessible.",
      "Check actual surface conditions and vehicle suitability.",
      "Review vehicle range, tires and recovery requirements.",
      "Plan alternatives that do not depend on difficult terrain.",
    ],
    materials: [
      "Vehicle specifications",
      "Official road information",
      "Route map",
      "Vehicle equipment checklist",
    ],
    completionCriteria: [
      "Road access and vehicle suitability have been reviewed.",
      "A practical alternative route is documented.",
    ],
    fallback:
      "Use maintained roads or change the itinerary when suitability cannot be confirmed.",
  },

  "personal-first-aid-readiness": {
    steps: [
      "Review the first-aid needs associated with planned activities.",
      "Inspect first-aid supplies and learn how to use them.",
      "Consider relevant first-aid training before departure.",
      "Identify emergency contacts and realistic access to professional help.",
    ],
    materials: [
      "First-aid kit",
      "Relevant training resources",
      "Emergency contact plan",
    ],
    completionCriteria: [
      "First-aid supplies have been inspected.",
      "The group understands its limits and how to seek professional help.",
    ],
    fallback:
      "Reduce exposure to remote or demanding activities if adequate emergency readiness cannot be arranged.",
  },

  "personal-group-support": {
    steps: [
      "Discuss practical support needs with the relevant participant.",
      "Review access, pace, rest opportunities and transport arrangements.",
      "Adjust daily activities and identify suitable alternatives.",
      "Confirm that everyone understands the revised plan.",
    ],
    materials: [
      "Daily itinerary",
      "Accessibility and access information",
      "Group planning notes",
    ],
    completionCriteria: [
      "Relevant practical needs are reflected in the itinerary.",
      "Suitable alternatives have been discussed.",
    ],
    fallback:
      "Select more accessible activities or adjust the travel arrangements.",
  },
};

/**
 * Return detailed guidance for a known task.
 *
 * Unknown tasks receive a conservative,
 * generic guidance structure.
 */
export function getActionGuidance(
  task: PreparationTask
): ActionGuidance {
  const guidance = guidanceLibrary[task.id];

  if (guidance) {
    return {
      taskId: task.id,
      ...guidance,
    };
  }

  return {
    taskId: task.id,

    steps: [
      task.action,
      "Confirm any missing trip-specific information.",
      "Review the result before marking this task complete.",
    ],

    materials: [
      "Current Wild Plan",
      "Relevant official destination information",
    ],

    completionCriteria: [
      "The recommended action has been carried out.",
      "Important assumptions and limitations have been reviewed.",
    ],

    fallback:
      "Choose a simpler alternative or seek appropriate assistance if the task cannot be completed safely.",
  };
}
