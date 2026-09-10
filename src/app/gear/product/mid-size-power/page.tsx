import Link from "next/link";
import styles from "./product.module.css";


const affiliateLinks = {
  ecoflow:
    "https://www.ecoflow.com/us/delta-2-portable-power-station",

  jackery:
    "https://www.jackery.com/products/jackery-explorer-1000-plus-portable-power-station",

  bluetti:
    "https://www.bluettipower.com/products/ac180",
};



const specs = [
  {
    label: "CAPACITY",
    value: "1000–1200Wh",
  },
  {
    label: "OUTPUT",
    value: "1800–2000W",
  },
  {
    label: "WEIGHT",
    value: "27–38 lb",
  },
  {
    label: "BEST FOR",
    value: "2–5 night trips",
  },
];



const pros = [
  "Enough capacity for multi-day camping",
  "Can support refrigerators and larger devices",
  "Better balance between power and portability",
  "Ideal upgrade from compact systems",
];



const cons = [
  "Heavier than entry-level power stations",
  "Requires more storage space",
];



const topPicks = [
  {
    badge: "BEST OVERALL",
    brand: "ECOFLOW",
    name: "DELTA 2",
    capacity: "1024Wh",
    output: "1800W",
    weight: "27 lb",
    description:
      "A balanced choice for serious weekend trips and multi-day car camping. Strong output, expandable capacity and excellent flexibility.",
    image: "/power-ecoflow.jpg",
    affiliateUrl: affiliateLinks.ecoflow,
  },

  {
    badge: "BEST ROAD TRIP",
    brand: "JACKERY",
    name: "Explorer 1000 Plus",
    capacity: "1264Wh",
    output: "2000W",
    weight: "32 lb",
    description:
      "A reliable option for travelers who need more capacity without moving into a full off-grid system.",
    image: "/power.jpg",
    affiliateUrl: affiliateLinks.jackery,
  },

  {
    badge: "BEST VALUE",
    brand: "BLUETTI",
    name: "AC180",
    capacity: "1152Wh",
    output: "1800W",
    weight: "37.9 lb",
    description:
      "Strong output and practical capacity for campers who want more freedom on longer trips.",
    image: "/power.jpg",
    affiliateUrl: affiliateLinks.bluetti,
  },
];




export default function MidSizePowerPage() {


  return (

    <main className={styles.page}>


      <header className={styles.header}>


        <Link
          href="/"
          className={styles.logo}
        >
          ROAMLAB
        </Link>



        <nav className={styles.nav}>


          <Link href="/explore">
            EXPLORE
          </Link>


          <Link href="/plan">
            PLAN
          </Link>


          <Link
            href="/gear"
            className={styles.active}
          >
            GEAR
          </Link>


          <Link href="/prepare">
            PREPARE
          </Link>


          <Link href="/safety">
            SAFETY
          </Link>


          <Link href="/learn">
            LEARN
          </Link>


          <Link href="/journal">
            JOURNAL
          </Link>


          <Link href="/stories">
            STORIES
          </Link>


        </nav>





        <div className={styles.headerActions}>


          <Link
            href="/signin"
            className={styles.signIn}
          >
            SIGN IN
          </Link>



          <Link
            href="/ways-in"
            className={styles.startButton}
          >
            START YOUR WILD →
          </Link>


        </div>


      </header>





      <div className={styles.breadcrumb}>


        <Link href="/gear">
          GEAR
        </Link>


        <span>
          →
        </span>


        <Link href="/gear/power">
          POWER
        </Link>


        <span>
          →
        </span>


        <strong>
          MID-SIZE POWER
        </strong>


      </div>





      <section className={styles.hero}>


        <div className={styles.heroImageWrap}>


          <img

            src="/power-ecoflow.jpg"

            alt="Mid size portable power station"

            className={styles.heroImage}

          />


        </div>





        <div className={styles.heroContent}>


          <p className={styles.eyebrow}>
            ROAMLAB POWER GUIDE
          </p>



          <h1>
            Mid-Size Power
          </h1>



          <p className={styles.subtitle}>

            More capacity for longer trips,
            refrigerators and multi-day adventures.

          </p>




          <div className={styles.heroMeta}>


            <div>

              <span>
                POWER CLASS
              </span>


              <strong>
                1000Wh+
              </strong>


            </div>




            <div>

              <span>
                TRIP LENGTH
              </span>


              <strong>
                2–5 NIGHTS
              </strong>


            </div>





            <div>

              <span>
                ROAMLAB FIT
              </span>


              <strong>
                ROAD TRIP
              </strong>


            </div>


          </div>





          <a

            href="#top-picks"

            className={styles.primaryButton}

          >

            SEE TOP PICKS →

          </a>


        </div>


      </section>
      </section>


      <section className={styles.bestFor}>


        <div>

          <p className={styles.eyebrow}>
            BEST FOR
          </p>


          <h2>
            More Power.
            Longer Adventures.
          </h2>

        </div>



        <p>

          Mid-size power stations are the sweet spot
          for campers who want more freedom without
          carrying a full off-grid battery system.
          Perfect for refrigerators, cameras, lights
          and longer road trips.

        </p>


      </section>





      <section className={styles.specSection}>


        <div className={styles.sectionHeading}>


          <div>

            <p className={styles.eyebrow}>
              POWER PROFILE
            </p>


            <h2>
              Built For Multi-Day Trips
            </h2>

          </div>




          <p>

            A practical upgrade path from compact power.
            <br />
            More capacity without overbuilding.

          </p>


        </div>





        <div className={styles.specGrid}>


          {specs.map((spec)=>(

            <div
              className={styles.specCard}
              key={spec.label}
            >

              <span>
                {spec.label}
              </span>


              <strong>
                {spec.value}
              </strong>


            </div>

          ))}


        </div>


      </section>





      <section className={styles.whySection}>


        <div className={styles.whyImageWrap}>


          <img

            src="/power.jpg"

            alt="Mid size camping power setup"

            className={styles.whyImage}

          />


        </div>





        <div className={styles.whyContent}>


          <p className={styles.eyebrow}>
            WHY MOVE UP
          </p>



          <h2>
            More Freedom
            <br />
            Away From The Grid
          </h2>




          <p>

            When weekend trips become longer,
            mid-size power gives you the flexibility
            to run more equipment without constantly
            worrying about battery limits.

          </p>




          <div className={styles.useList}>


            <span>
              Fridge
            </span>


            <span>
              Camera Gear
            </span>


            <span>
              Lighting
            </span>


            <span>
              Laptop
            </span>


            <span>
              Small Appliances
            </span>


          </div>



        </div>


      </section>





      <section className={styles.proConSection}>


        <div className={styles.proCard}>


          <p className={styles.eyebrow}>
            PROS
          </p>



          <h3>
            Why It Works
          </h3>



          <ul>


            {pros.map((item)=>(

              <li key={item}>
                {item}
              </li>

            ))}


          </ul>


        </div>





        <div className={styles.conCard}>


          <p className={styles.eyebrow}>
            LIMITS
          </p>



          <h3>
            Where It Falls Short
          </h3>



          <ul>


            {cons.map((item)=>(

              <li key={item}>
                {item}
              </li>

            ))}


          </ul>


        </div>


      </section>





      <section className={styles.verdict}>


        <div>


          <p className={styles.eyebrow}>
            ROAMLAB VERDICT
          </p>



          <h2>
            The Sweet Spot
            <br />
            For Most Campers
          </h2>


        </div>




        <p>

          Mid-size power is where many campers
          find the best balance. Enough energy
          for real trips, while still remaining
          practical for everyday vehicles.

        </p>



      </section>
