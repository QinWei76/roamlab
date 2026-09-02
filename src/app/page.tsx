import Link from "next/link";

const ways = [
  {
    number: "01",
    title: "DRIVE",
    eyebrow: "SUV · TRUCK · VAN",
    description:
      "Take the road deeper. Build your wild system around your vehicle, terrain and range.",
    image: "/ways-drive.jpg",
    href: "/ways-in/drive",
    cta: "EXPLORE BY VEHICLE",
  },
  {
    number: "02",
    title: "HIKE",
    eyebrow: "BACKPACKING · TREKKING",
    description:
      "Carry what matters. Go farther with a system built around weight, distance and terrain.",
    image: "/ways-hike.jpg",
    href: "/ways-in/hike",
    cta: "WALK INTO THE WILD",
  },
  {
    number: "03",
    title: "RIDE",
    eyebrow: "BIKEPACKING · GRAVEL",
    description:
      "Move light and cover ground. Prepare for distance, weather, repair and the unexpected.",
    image: "/ways-ride.jpg",
    href: "/ways-in/ride",
    cta: "RIDE FURTHER",
  },
  {
    number: "04",
    title: "PADDLE",
    eyebrow: "KAYAK · CANOE · WATER",
    description:
      "Reach places the road can't. Build around water, exposure, storage and changing conditions.",
    image: "/ways-paddle.jpg",
    href: "/ways-in/paddle",
    cta: "FOLLOW THE WATER",
  },
];

export default function WaysInPage() {
  return (
    <main className="ways-visual-page">
      {/* HEADER */}
      <header className="ways-visual-header">
        <Link href="/" className="ways-visual-logo">
          ROAMLAB
        </Link>

        <Link href="/" className="ways-visual-back">
          ← BACK TO DESK
        </Link>
      </header>

      {/* HERO */}
      <section className="ways-visual-hero">
        <div className="ways-visual-hero-copy">
          <p className="ways-visual-kicker">WAYS IN</p>

          <h1>
            HOW DO YOU
            <br />
            GO WILD?
          </h1>

          <p className="ways-visual-intro">
            Every adventure starts differently. Your way in changes what you
            carry, how you prepare and how far you can go.
          </p>
        </div>

        <div className="ways-visual-index">
          <span>01 — 05</span>
          <p>CHOOSE YOUR WAY IN</p>
        </div>
      </section>

      {/* FOUR WAYS */}
      <section className="ways-visual-grid">
        {ways.map((way) => (
          <Link
            href={way.href}
            className="ways-image-card"
            key={way.title}
          >
            <img
              src={way.image}
              alt={`${way.title} — RoamLab`}
              className="ways-image"
            />

            <div className="ways-image-shade" />

            <span className="ways-card-number">{way.number}</span>

            <div className="ways-card-content">
              <p className="ways-card-eyebrow">{way.eyebrow}</p>

              <h2>{way.title}</h2>

              <p className="ways-card-description">{way.description}</p>

              <div className="ways-card-action">
                <span>{way.cta}</span>
                <strong>→</strong>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* NOT SURE */}
      <section className="ways-unsure">
        <div className="ways-unsure-number">05</div>

        <div className="ways-unsure-copy">
          <p>NOT SURE WHERE TO START?</p>

          <h2>
            TELL US WHAT
            <br />
            WILD LOOKS LIKE
            <br />
            TO YOU.
          </h2>

          <span>
            You don't need to know the route yet. Start with the experience you
            want and RoamLab will help you build the way in.
          </span>
        </div>

        <Link href="/plan" className="ways-unsure-button">
          HELP ME CHOOSE
          <strong>→</strong>
        </Link>
      </section>

      {/* BOTTOM */}
      <section className="ways-bottom">
        <p>THERE'S MORE THAN ONE WAY IN.</p>

        <h2>
          PICK YOUR WAY.
          <br />
          WE'LL HELP WITH
          <br />
          THE REST.
        </h2>

        <Link href="/" className="ways-bottom-link">
          ← RETURN TO WILD DESK
        </Link>
      </section>
    </main>
  );
}
