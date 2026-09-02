import Link from "next/link";

const vehicleTypes = [
  {
    title: "SUV",
    description:
      "Flexible, practical and ideal for most first-time wild trips.",
  },
  {
    title: "TRUCK",
    description:
      "More payload, more gear and better flexibility for remote setups.",
  },
  {
    title: "VAN",
    description:
      "More interior space and comfort for longer stays outside.",
  },
  {
    title: "AWD / CROSSOVER",
    description:
      "Great for gravel roads, forest access and lighter adventure travel.",
  },
  {
    title: "2WD",
    description:
      "Still capable — with the right route, weather and preparation.",
  },
];

const tripStyles = [
  "Weekend Escape",
  "Remote Camp",
  "Multi-Day Wild",
  "Road + Hike",
];

const crewSizes = ["Solo", "2 People", "3–4 People", "5+ People"];

const durations = ["1 Day", "2–3 Days", "4–5 Days", "6+ Days"];

export default function DrivePage() {
  return (
    <main className="drive-page">
      <header className="drive-header">
        <Link href="/" className="drive-logo">
          ROAMLAB
        </Link>

        <Link href="/ways-in" className="drive-back">
          ← WAYS IN
        </Link>
      </header>

      <section className="drive-hero">
        <p className="drive-kicker">WAYS IN / DRIVE</p>

        <h1>
          BUILD AROUND
          <br />
          YOUR VEHICLE.
        </h1>

        <p className="drive-intro">
          Your vehicle changes how far you can go, how much you can carry,
          where you can sleep and what kind of backup you need.
        </p>
      </section>

      <section className="drive-form">

        {/* STEP 01 */}

        <div className="drive-step">
          <div className="drive-step-head">
            <span>01</span>

            <div>
              <p>YOUR VEHICLE</p>
              <h2>What are you driving?</h2>
            </div>
          </div>

          <div className="vehicle-choice-grid">
            {vehicleTypes.map((vehicle) => (
              <button key={vehicle.title} className="vehicle-choice">
                <span className="vehicle-choice-title">
                  {vehicle.title}
                </span>

                <span className="vehicle-choice-description">
                  {vehicle.description}
                </span>
              </button>
            ))}
          </div>

          <div className="vehicle-model">
            <label htmlFor="vehicle-model">
              VEHICLE MODEL
            </label>

            <input
              id="vehicle-model"
              name="vehicle-model"
              type="text"
              placeholder="Example: Toyota RAV4"
            />

            <p>
              This helps RoamLab estimate space, range and practical gear fit.
            </p>
          </div>
        </div>


        {/* STEP 02 */}

        <div className="drive-step">
          <div className="drive-step-head">
            <span>02</span>

            <div>
              <p>TRIP STYLE</p>
              <h2>What kind of trip are you building?</h2>
            </div>
          </div>

          <div className="simple-choice-grid">
            {tripStyles.map((item) => (
              <button key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>


        {/* STEP 03 */}

        <div className="drive-step">
          <div className="drive-step-head">
            <span>03</span>

            <div>
              <p>YOUR CREW</p>
              <h2>Who's going?</h2>
            </div>
          </div>

          <div className="simple-choice-grid">
            {crewSizes.map((item) => (
              <button key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>


        {/* STEP 04 */}

        <div className="drive-step">
          <div className="drive-step-head">
            <span>04</span>

            <div>
              <p>DURATION</p>
              <h2>How long are you going out?</h2>
            </div>
          </div>

          <div className="simple-choice-grid">
            {durations.map((item) => (
              <button key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>


        {/* NEXT */}

        <div className="drive-next">
          <div>
            <p>NEXT</p>

            <h2>
              LET'S BUILD
              <br />
              YOUR WILD SYSTEM.
            </h2>
          </div>

          <Link href="/prepare" className="drive-next-button">
            CONTINUE →
          </Link>
        </div>

      </section>
    </main>
  );
}
