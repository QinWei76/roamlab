import Link from "next/link";

const ways = [
  {
    number: "01",
    title: "DRIVE",
    description:
      "Take your vehicle beyond the pavement. Build around its space, range and capability.",
    href: "/ways-in/drive",
    meta: "SUV · TRUCK · VAN · AWD · 2WD",
  },
  {
    number: "02",
    title: "HIKE",
    description:
      "Carry what matters. Plan around weight, distance, terrain and self-reliance.",
    href: "/ways-in/hike",
    meta: "BACKPACKING · TREKKING · MULTI-DAY",
  },
  {
    number: "03",
    title: "RIDE",
    description:
      "Cover more ground with less. Build a system for distance, weather and repair.",
    href: "/ways-in/ride",
    meta: "BIKEPACKING · GRAVEL · OFF-ROAD",
  },
  {
    number: "04",
    title: "PADDLE",
    description:
      "Reach wild places by water. Prepare for exposure, flotation and dry storage.",
    href: "/ways-in/paddle",
    meta: "KAYAK · CANOE · WATER ACCESS",
  },
  {
    number: "05",
    title: "NOT SURE YET",
    description:
      "Tell us where you want to go and what kind of experience you want. We'll help you choose.",
    href: "/plan",
    meta: "LET ROAMLAB GUIDE YOU",
  },
];

export default function WaysInPage() {
  return (
    <main className="ways-page">
      <header className="ways-header">
        <Link href="/" className="ways-logo">
          ROAMLAB
        </Link>

        <Link href="/" className="ways-back">
          ← BACK TO DESK
        </Link>
      </header>

      <section className="ways-hero">
        <p className="ways-kicker">WAYS IN</p>

        <h1>
          HOW DO YOU
          <br />
          GO WILD?
        </h1>

        <p className="ways-intro">
          Your way in changes everything you need to prepare.
          Choose how you want to enter the wild.
        </p>
      </section>

      <section className="ways-list">
        {ways.map((way) => (
          <Link
            href={way.href}
            key={way.title}
            className="way-card"
          >
            <div className="way-number">{way.number}</div>

            <div className="way-main">
              <p className="way-meta">{way.meta}</p>

              <h2>{way.title}</h2>

              <p className="way-description">
                {way.description}
              </p>
            </div>

            <div className="way-arrow">→</div>
          </Link>
        ))}
      </section>

      <section className="ways-footer">
        <p>NOT ABOUT THE VEHICLE.</p>

        <h2>
          IT'S ABOUT HOW
          <br />
          YOU GET OUT THERE.
        </h2>

        <Link href="/plan" className="ways-cta">
          START YOUR WILD →
        </Link>
      </section>
    </main>
  );
}
