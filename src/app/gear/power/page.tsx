import Link from "next/link";
import styles from "./power.module.css";

const useCases = [
  {
    number: "01",
    title: "Weekend Camping",
    description:
      "Phones, lights and small electronics for a simple one or two-night setup.",
    range: "300–500Wh",
  },
  {
    number: "02",
    title: "Road Trips",
    description:
      "Keep cameras, laptops, lighting and travel electronics powered for several days.",
    range: "500–1000Wh",
  },
  {
    number: "03",
    title: "Off-Grid Camping",
    description:
      "A larger energy reserve for refrigeration, communication and extended stays.",
    range: "1000Wh+",
  },
];

const recommendations = [
  {
    tag: "LIGHTWEIGHT",
    title: "Compact Power",
    subtitle: "Best for short trips",
    capacity: "300–500Wh",
    output: "300–700W",
    ideal: "Phones · Lights · Camera",
    image: "/power-ecoflow.jpg",
    href: "/gear/product/compact-power",
  },
  {
    tag: "BEST ALL-ROUND",
    title: "Mid-Size Power",
    subtitle: "Best for most campers",
    capacity: "700–1000Wh",
    output: "1000–1800W",
    ideal: "Fridge · Laptop · Camp setup",
    image: "/power.jpg",
    href: "/gear/product/mid-size-power",
  },
  {
    tag: "OFF-GRID",
    title: "High-Capacity Power",
    subtitle: "Best for longer adventures",
    capacity: "1000Wh+",
    output: "1800W+",
    ideal: "Fridge · Cooking · Multi-day use",
    image: "/power-ecoflow.jpg",
    href: "/gear/product/high-capacity-power",
  },
];

const checklist = [
  "Battery capacity",
  "AC output",
  "USB-C charging",
  "12V vehicle output",
  "Solar input",
  "Recharge speed",
  "Weight & portability",
];

export default function PowerPage() {
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
        <strong>POWER</strong>
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <img
          src="/power.jpg"
          alt="Portable power for outdoor adventures"
          className={styles.heroImage}
        />

        <div className={styles.heroShade} />

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>GEAR LAB / POWER</p>

          <h1>
            Power Your
            <br />
            Adventure
          </h1>

          <p className={styles.heroDescription}>
            From a weekend escape to an extended off-grid camp,
            <br />
            choose a power system around what you actually need to run.
          </p>

          <a href="#power-guide" className={styles.primaryButton}>
            FIND YOUR POWER SYSTEM →
          </a>
        </div>

        <div className={styles.heroData}>
          <div>
            <span>START HERE</span>
            <strong>YOUR TRIP</strong>
          </div>

          <div>
            <span>THEN MATCH</span>
            <strong>YOUR LOAD</strong>
          </div>

          <div>
            <span>THEN CHOOSE</span>
            <strong>CAPACITY</strong>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section id="power-guide" className={styles.intro}>
        <div className={styles.introLabel}>
          <p className={styles.eyebrow}>POWER FIELD GUIDE</p>
          <span>01</span>
        </div>

        <div className={styles.introContent}>
          <h2>Start With The Trip, Not The Battery.</h2>

          <p>
            The right portable power station depends less on the biggest
            number on the box and more on how you travel. Start with trip
            length, the devices you need to run, and how often you can
            recharge.
          </p>
        </div>
      </section>

      {/* USE CASES */}
      <section className={styles.useCases}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>CHOOSE YOUR USE CASE</p>
            <h2>How Much Power Do You Need?</h2>
          </div>

          <p>
            Use these ranges as a starting point.
            <br />
            Your actual setup may vary.
          </p>
        </div>

        <div className={styles.useCaseGrid}>
          {useCases.map((item) => (
            <article className={styles.useCaseCard} key={item.number}>
              <div className={styles.useCaseTop}>
                <span>{item.number}</span>
                <strong>{item.range}</strong>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* WHAT TO LOOK FOR */}
      <section className={styles.specSection}>
        <div className={styles.specImageWrap}>
          <img
            src="/power-ecoflow.jpg"
            alt="Portable power station"
            className={styles.specImage}
          />
        </div>

        <div className={styles.specContent}>
          <p className={styles.eyebrow}>WHAT TO LOOK FOR</p>

          <h2>
            Seven Things That
            <br />
            Actually Matter
          </h2>

          <div className={styles.checklist}>
            {checklist.map((item, index) => (
              <div className={styles.checkItem} key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className={styles.recommendations}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>ROAMLAB RECOMMENDATIONS</p>
            <h2>Choose Your Power Class</h2>
          </div>

          <p>
            Start with the class that fits your trip.
            <br />
            Then compare specific products.
          </p>
        </div>

        <div className={styles.productGrid}>
          {recommendations.map((product) => (
            <article className={styles.productCard} key={product.title}>
              <div className={styles.productImageWrap}>
                <img
                  src={product.image}
                  alt={product.title}
                  className={styles.productImage}
                />

                <span className={styles.productTag}>{product.tag}</span>
              </div>

              <div className={styles.productBody}>
                <p className={styles.productSubtitle}>{product.subtitle}</p>
                <h3>{product.title}</h3>

                <div className={styles.productSpecs}>
                  <div>
                    <span>CAPACITY</span>
                    <strong>{product.capacity}</strong>
                  </div>

                  <div>
                    <span>OUTPUT</span>
                    <strong>{product.output}</strong>
                  </div>
                </div>

                <div className={styles.ideal}>
                  <span>IDEAL FOR</span>
                  <p>{product.ideal}</p>
                </div>

                <Link href={product.href} className={styles.productButton}>
                  EXPLORE RECOMMENDATIONS →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FIELD NOTE */}
      <section className={styles.fieldNote}>
        <div>
          <p className={styles.eyebrow}>ROAMLAB FIELD NOTE</p>

          <h2>More Capacity Is Not Always Better.</h2>
        </div>

        <p>
          Bigger batteries cost more, weigh more and take longer to recharge.
          A well-matched system is usually better than simply buying the
          largest power station available.
        </p>
      </section>

      {/* NEXT CATEGORY */}
      <section className={styles.nextStep}>
        <div>
          <p className={styles.eyebrow}>CONTINUE BUILDING YOUR SYSTEM</p>
          <h2>Power is only one part of the setup.</h2>
        </div>

        <div className={styles.nextActions}>
          <Link href="/gear" className={styles.secondaryButton}>
            ← GEAR LIBRARY
          </Link>

          <Link href="/gear/lighting" className={styles.primaryButton}>
            NEXT: LIGHTING →
          </Link>
        </div>
      </section>
    </main>
  );
}
