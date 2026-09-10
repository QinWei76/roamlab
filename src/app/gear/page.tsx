import Link from "next/link";
import styles from "./gear.module.css";

const categories = [
  {
    name: "Power",
    slug: "power",
    image: "/power.jpg",
    description: "Stay charged anywhere.",
  },
  {
    name: "Lighting",
    slug: "lighting",
    image: "/lighting.jpg",
    description: "See more. Do more.",
  },
  {
    name: "Storage",
    slug: "storage",
    image: "/storage.jpg",
    description: "Keep it organized.",
  },
  {
    name: "Sleeping",
    slug: "sleeping",
    image: "/sleeping.jpg",
    description: "Rest well. Go further.",
  },
  {
    name: "Cooking",
    slug: "cooking",
    image: "/cooking.jpg",
    description: "Good food. Better trips.",
  },
  {
    name: "Safety",
    slug: "safety",
    image: "/gear-hero.jpg",
    description: "Be prepared. Stay safe.",
  },
];

const guides = [
  {
    eyebrow: "BEGINNER GUIDE",
    title: "Car Camping Essentials",
    description: "The must-have gear for your first trip.",
    href: "/start-here",
  },
  {
    eyebrow: "GEAR GUIDE",
    title: "Power Solutions Explained",
    description: "Understand portable power before you buy.",
    href: "/gear/power",
  },
  {
    eyebrow: "BUILD YOUR SYSTEM",
    title: "Build Your Complete Setup",
    description: "Plan a complete system around your actual trip.",
    href: "/ways-in",
  },
];

export default function GearPage() {
  return (
    <main className={styles.page}>
      {/* TOP NAVIGATION */}
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

      {/* HERO */}
      <section className={styles.hero}>
        <img
          src="/gear-hero.jpg"
          alt="RoamLab Gear Lab"
          className={styles.heroImage}
        />

        <div className={styles.heroShade} />

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>GEAR LAB</p>

          <h1>
            Better Gear
            <br />
            Brings You Further
          </h1>

          <p className={styles.heroDescription}>
            Curated. Tested. Real-world ready.
            <br />
            Explore the gear, build your setup, and get ready
            <br />
            for your next adventure.
          </p>

          <Link href="#gear-library" className={styles.primaryButton}>
            EXPLORE GEAR →
          </Link>

          <div className={styles.heroPrinciples}>
            <div>
              <strong>REAL-WORLD READY</strong>
              <span>Gear built for actual trips</span>
            </div>

            <div>
              <strong>BUILT AS A SYSTEM</strong>
              <span>Not just individual products</span>
            </div>

            <div>
              <strong>FOR EVERY EXPLORER</strong>
              <span>From weekends to off-grid</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY LIBRARY */}
      <section id="gear-library" className={styles.library}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>BROWSE BY CATEGORY</p>
            <h2>Explore Our Gear Library</h2>
          </div>

          <p>
            From power to shelter, we&apos;ve organized the essentials
            <br />
            to help you build a complete outdoor system.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link
              href={`/gear/${category.slug}`}
              key={category.slug}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImageWrap}>
                <img
                  src={category.image}
                  alt={category.name}
                  className={styles.categoryImage}
                />
              </div>

              <div className={styles.categoryBody}>
                <p className={styles.categoryName}>{category.name}</p>

                <div className={styles.categoryBottom}>
                  <span>{category.description}</span>
                  <strong>→</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED GUIDES */}
      <section className={styles.guides}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>FIELD GUIDES</p>
            <h2>Get Started with Gear Guides</h2>
          </div>

          <p>
            Practical guidance for choosing the right
            <br />
            equipment for your trips.
          </p>
        </div>

        <div className={styles.guideGrid}>
          {guides.map((guide) => (
            <Link
              href={guide.href}
              key={guide.title}
              className={styles.guideCard}
            >
              <p>{guide.eyebrow}</p>
              <h3>{guide.title}</h3>
              <span>{guide.description}</span>

              <strong>→</strong>
            </Link>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <img
          src="/gear-hero.jpg"
          alt=""
          className={styles.finalImage}
        />

        <div className={styles.finalShade} />

        <div className={styles.finalContent}>
          <div>
            <p>GEAR UP. GET OUT.</p>
            <span>The best trips start with the right system.</span>
          </div>

          <Link href="/ways-in" className={styles.primaryButton}>
            START BUILDING YOUR SYSTEM →
          </Link>
        </div>
      </section>
    </main>
  );
}
