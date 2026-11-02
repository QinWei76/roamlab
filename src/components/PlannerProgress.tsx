import Link from "next/link";

type PlannerProgressProps = {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  vehicle?: string;
  trip?: string;
  crew?: string;
  people?: number;
};

export default function PlannerProgress({
  currentStep,
  vehicle,
  trip,
  crew,
  people,
}: PlannerProgressProps) {
  const budgetHref = "/wild-plan/budget";

  const vehicleHref = "/ways-in/drive";

  const tripHref = vehicle
    ? `/ways-in/drive/setup?vehicle=${vehicle}`
    : null;

  const crewHref =
    vehicle && trip
      ? `/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`
      : null;

  const durationHref =
    vehicle && trip && crew
      ? `/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}${
          people ? `&people=${people}` : ""
        }`
      : null;

  function stepClass(step: number) {
    return `planner-step ${
      currentStep === step
        ? "is-current"
        : currentStep > step
        ? "is-done"
        : ""
    }`;
  }

  function stepNumber(step: number) {
    return currentStep > step ? "✓" : String(step);
  }

  return (
    <div className="planner-progress">
      <div className="planner-progress-inner">

        {/* 1 — BUDGET */}
        <Link
          href={budgetHref}
          className={stepClass(1)}
        >
          <span className="planner-step-number">
            {stepNumber(1)}
          </span>

          <span className="planner-step-label">
            BUDGET
          </span>
        </Link>

        <span className="planner-line" />

        {/* 2 — VEHICLE */}
        <Link
          href={vehicleHref}
          className={stepClass(2)}
        >
          <span className="planner-step-number">
            {stepNumber(2)}
          </span>

          <span className="planner-step-label">
            VEHICLE
          </span>
        </Link>

        <span className="planner-line" />

        {/* 3 — TRIP STYLE */}
        {tripHref ? (
          <Link
            href={tripHref}
            className={stepClass(3)}
          >
            <span className="planner-step-number">
              {stepNumber(3)}
            </span>

            <span className="planner-step-label">
              TRIP STYLE
            </span>
          </Link>
        ) : (
          <div className={stepClass(3)}>
            <span className="planner-step-number">
              {stepNumber(3)}
            </span>

            <span className="planner-step-label">
              TRIP STYLE
            </span>
          </div>
        )}

        <span className="planner-line" />

        {/* 4 — CREW */}
        {crewHref ? (
          <Link
            href={crewHref}
            className={stepClass(4)}
          >
            <span className="planner-step-number">
              {stepNumber(4)}
            </span>

            <span className="planner-step-label">
              CREW
            </span>
          </Link>
        ) : (
          <div className={stepClass(4)}>
            <span className="planner-step-number">
              {stepNumber(4)}
            </span>

            <span className="planner-step-label">
              CREW
            </span>
          </div>
        )}

        <span className="planner-line" />

        {/* 5 — DURATION */}
        {durationHref ? (
          <Link
            href={durationHref}
            className={stepClass(5)}
          >
            <span className="planner-step-number">
              {stepNumber(5)}
            </span>

            <span className="planner-step-label">
              DURATION
            </span>
          </Link>
        ) : (
          <div className={stepClass(5)}>
            <span className="planner-step-number">
              {stepNumber(5)}
            </span>

            <span className="planner-step-label">
              DURATION
            </span>
          </div>
        )}

        <span className="planner-line" />

        {/* 6 — DESTINATION */}
        <div className={stepClass(6)}>
          <span className="planner-step-number">
            {stepNumber(6)}
          </span>

          <span className="planner-step-label">
            DESTINATION
          </span>
        </div>

        <span className="planner-line" />

        {/* 7 — WILD PLAN */}
        <div className={stepClass(7)}>
          <span className="planner-step-number">
            {stepNumber(7)}
          </span>

          <span className="planner-step-label">
            WILD PLAN
          </span>
        </div>

      </div>
    </div>
  );
}
