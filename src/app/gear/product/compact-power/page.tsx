import Link from "next/link";
import styles from "./product.module.css";

const specs = [
  { label: "CAPACITY", value: "300–500Wh" },
  { label: "OUTPUT", value: "300–700W" },
  { label: "WEIGHT", value: "Lightweight" },
  { label: "BEST FOR", value: "1–2 night trips" },
];

const pros = [
  "Easy to carry and store",
  "Fast enough for phones, cameras and lights",
  "Good fit for smaller vehicles",
  "Lower cost than larger systems",
];

const cons = [
  "Limited for high-draw appliances",
  "Not ideal for extended off-grid use",
];

export default function CompactPowerPage() {
  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          ROAMLAB
        </Link>

        <nav className={styles.nav}>
          <Link href="/explore">EXPLORE</Link>
          <Link href="/plan">PLAN</Link>
          <Link href="/gear" className={styles.active}>
            GEAR
          </Link>
          <Link href="/prepare">PREPARE</Link>
          <Link href="/safety">SAFETY</Link>
          <Link href="/learn">LEARN</Link>
          <Link href="/journal">JOURNAL</Link>
          <Link href="/stories">STORIES</Link>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/signin" className={styles.signIn}>
            SIGN IN
          </Link>

          <Link href="/ways-in" className={styles.startButton}>
            START YOUR WILD →
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <Link href="/gear">GEAR</Link>
        <span>→</span>
        <Link href="/gear/power">POWER</Link>
        <span>→</span>
        <strong>COMPACT POWER</strong>
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <img
            src="/power-ecoflow.jpg"
            alt="Compact portable power station"
            className={styles.heroImage}
          />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>ROAMLAB POWER PICK</p>

          <h1>Compact Power</h1>

          <p className={styles.subtitle}>
            A lightweight portable power class for short trips,
            simple setups and everyday camp electronics.
          </p>

          <div className={styles.heroMeta}>
            <div>
              <span>POWER CLASS</span>
              <strong>300–500Wh</strong>
            </div>

            <div>
              <span>TRIP LENGTH</span>
              <strong>1–2 NIGHTS</strong>
            </div>

            <div>
              <span>ROAMLAB FIT</span>
              <strong>WEEKEND</strong>
            </div>
          </div>

          <a
            href="#recommendation"
            className={styles.primaryButton}
          >
            SEE RECOMMENDATION →
          </a>
        </div>
      </section>

      {/* BEST FOR */}
      <section className={styles.bestFor}>
        <div>
          <p className={styles.eyebrow}>BEST FOR</p>
          <h2>Simple Trips. Small Loads. Easy Packing.</h2>
        </div>

        <p>
          Compact power stations are ideal when you want reliable charging
          without carrying a large battery. They fit especially well with
          weekend escapes, smaller vehicles and minimalist camp systems.
        </p>
      </section>

      {/* SPECS */}
      <section className={styles.specSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>POWER PROFILE</p>
            <h2>What This Class Gives You</h2>
          </div>

          <p>
            Enough capacity for essential electronics,
            <br />
            without the weight of a large system.
          </p>
        </div>

        <div className={styles.specGrid}>
          {specs.map((spec) => (
            <div className={styles.specCard} key={spec.label}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className={styles.whySection}>
        <div className={styles.whyImageWrap}>
          <img
            src="/power.jpg"
            alt="Portable power setup outdoors"
            className={styles.whyImage}
          />
        </div>

        <div className={styles.whyContent}>
          <p className={styles.eyebrow}>WHY WE LIKE THIS CLASS</p>

          <h2>
            Enough Power
            <br />
            Without Overbuilding
          </h2>

          <p>
            For many first-time car campers, a compact system is the most
            sensible place to begin. It handles the devices you use most often,
            takes up less space, and keeps your overall setup easier to manage.
          </p>

          <div className={styles.useList}>
            <span>Phones</span>
            <span>Headlamps</span>
            <span>Cameras</span>
            <span>Small laptops</span>
            <span>Camp lights</span>
          </div>
        </div>
      </section>

      {/* PROS CONS */}
      <section className={styles.proConSection}>
        <div className={styles.proCard}>
          <p className={styles.eyebrow}>PROS</p>
          <h3>Why It Works</h3>

          <ul>
            {pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.conCard}>
          <p className={styles.eyebrow}>LIMITS</p>
          <h3>Where It Falls Short</h3>

          <ul>
            {cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* VERDICT */}
      <section className={styles.verdict}>
        <div>
          <p className={styles.eyebrow}>ROAMLAB VERDICT</p>

          <h2>
            The Best Starting Point
            <br />
            For Most Short Trips
          </h2>
        </div>

        <p>
          If your setup is mainly phones, lights, camera gear and occasional
          laptop charging, this power class is usually the smartest starting
          point. Move up only if you plan to run refrigeration, cooking gear
          or stay off-grid for longer periods.
        </p>
      </section>

      {/* PRODUCT RECOMMENDATION */}
      <section id="recommendation" className={styles.recommendation}>
        <div className={styles.recommendationImageWrap}>
          <img
            src="/power-ecoflow.jpg"
            alt="Recommended compact power station"
            className={styles.recommendationImage}
          />
        </div>

        <div className={styles.recommendationContent}>
          <p className={styles.eyebrow}>ROAMLAB RECOMMENDATION</p>

          <h2>Compact Portable Power Station</h2>

          <p className={styles.recommendationLead}>
            Look for a reliable unit in the 300–500Wh class with USB-C,
            AC output, vehicle charging and solar input.
          </p>

          <div className={styles.recommendationChecklist}>
            <div>
              <span>✓</span>
              <p>USB-C fast charging</p>
            </div>

            <div>
              <span>✓</span>
              <p>AC outlets</p>
            </div>

            <div>
              <span>✓</span>
              <p>12V vehicle output</p>
            </div>

            <div>
              <span>✓</span>
              <p>Solar charging support</p>
            </div>
          </div>

          <div className={styles.buyArea}>
            <a
              href="#"
              className={styles.primaryButton}
              aria-label="View recommended compact power product"
            >
              VIEW PRODUCT →
            </a>

            <span className={styles.disclosure}>
              Affiliate link. RoamLab may earn a commission at no extra cost
              to you.
            </span>
          </div>
        </div>
      </section>

      {/* NEXT */}
      <section className={styles.nextStep}>
        <div>
          <p className={styles.eyebrow}>KEEP COMPARING</p>
          <h2>Need more capacity?</h2>
        </div>

        <div className={styles.nextActions}>
          <Link href="/gear/power" className={styles.secondaryButton}>
            ← BACK TO POWER
          </Link>

          <Link
            href="/gear/product/mid-size-power"
            className={styles.primaryButton}
          >
            NEXT: MID-SIZE POWER →
          </Link>
        </div>
      </section>
    </main>
  );
}
