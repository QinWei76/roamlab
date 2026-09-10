import Link from "next/link";
import styles from "./product.module.css";


const topPicks = [
  {
    badge: "BEST OVERALL",
    brand: "ECOFLOW",
    name: "DELTA 2",
    capacity: "1024Wh",
    output: "1800W",
    weight: "27 lb",
    description:
      "A balanced power system for multi-day trips, refrigerators and serious car camping.",
    image: "/delta2.jpg",
    affiliateUrl:
      "https://www.ecoflow.com/us/delta-2-portable-power-station",
  },

  {
    badge: "BEST ROAD TRIP",
    brand: "JACKERY",
    name: "Explorer 1000 Plus",
    capacity: "1264Wh",
    output: "2000W",
    weight: "32 lb",
    description:
      "Reliable power for longer adventures without moving into a full off-grid setup.",
    image: "/jackery-1000-plus.jpg",
    affiliateUrl:
      "https://www.jackery.com/products/jackery-explorer-1000-plus-portable-power-station",
  },

  {
    badge: "BEST VALUE",
    brand: "BLUETTI",
    name: "AC180",
    capacity: "1152Wh",
    output: "1800W",
    weight: "37.9 lb",
    description:
      "Strong output and practical capacity for flexible camping systems.",
    image: "/bluetti-ac180.jpg",
    affiliateUrl:
      "https://www.bluettipower.com/products/ac180",
  },
];



const specs = [
  {
    label: "POWER CLASS",
    value: "1000Wh+",
  },
  {
    label: "TRIP LENGTH",
    value: "2–5 NIGHTS",
  },
  {
    label: "ROAMLAB FIT",
    value: "ROAD TRIP",
  },
];



const pros = [
  "Enough power for refrigerators and larger devices",
  "Excellent balance between capacity and portability",
  "Ideal for multi-day vehicle camping",
];


const cons = [
  "Heavier than compact power systems",
  "Requires more storage space",
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
            src="/mid-size-power-hero.jpg"
            alt="Mid size power system"
            className={styles.heroImage}
          />


        </div>





        <div className={styles.heroContent}>


          <p className={styles.eyebrow}>
            ROAMLAB POWER GUIDE
          </p>



          <h1>
            Power For Longer Trips
          </h1>



          <p className={styles.subtitle}>

            More energy for refrigerators,
            camp kitchens and multi-day adventures.

          </p>





          <div className={styles.heroMeta}>


            {specs.map((item)=>(

              <div key={item.label}>

                <span>
                  {item.label}
                </span>


                <strong>
                  {item.value}
                </strong>


              </div>

            ))}


          </div>




          <a
            href="#top-picks"
            className={styles.primaryButton}
          >
            SEE TOP PICKS →
          </a>



        </div>


      </section>
            <section className={styles.bestFor}>


        <div>


          <p className={styles.eyebrow}>
            BEST FOR
          </p>



          <h2>
            Stay Longer.
            <br />
            Bring More.
          </h2>


        </div>





        <p>

          Mid-size power systems are built for
          campers who want more independence.
          Run refrigerators, camera gear,
          lighting and small appliances during
          longer adventures.

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

            The ideal upgrade from compact power.
            More capacity without carrying a
            full off-grid battery system.

          </p>



        </div>





        <div className={styles.specGrid}>


          {specs.map((item)=>(


            <div
              className={styles.specCard}
              key={item.label}
            >


              <span>
                {item.label}
              </span>



              <strong>
                {item.value}
              </strong>



            </div>


          ))}



        </div>


      </section>





      <section className={styles.whySection}>


        <div className={styles.whyImageWrap}>


          <img

            src="/delta2.jpg"

            alt="Mid size camping power setup"

            className={styles.whyImage}

          />


        </div>





        <div className={styles.whyContent}>


          <p className={styles.eyebrow}>
            WHY MOVE UP
          </p>



          <h2>

            Power More.
            <br />
            Stay Longer.

          </h2>




          <p>

            Mid-size power gives you the freedom
            to bring more equipment without
            constantly worrying about battery limits.

          </p>





          <div className={styles.useList}>


            <span>
              Refrigerator
            </span>


            <span>
              Camera Gear
            </span>


            <span>
              Camp Lighting
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

          For many vehicle campers,
          mid-size power offers the best balance
          between capability and portability.

        </p>



      </section>
            <section
        id="top-picks"
        className={styles.topPicks}
      >


        <div className={styles.topPicksIntro}>


          <p className={styles.eyebrow}>
            ROAMLAB RECOMMENDATIONS
          </p>



          <h2>
            Top Picks For Mid-Size Power
          </h2>




          <p>

            Three reliable choices for campers
            who need more capacity, more freedom,
            and longer adventures.

          </p>


        </div>





        <div className={styles.pickGrid}>


          {topPicks.map((product)=>(


            <article
              className={styles.pickCard}
              key={product.name}
            >


              <div className={styles.pickImageWrap}>


                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.pickImage}
                />



                <span className={styles.pickBadge}>

                  {product.badge}

                </span>


              </div>





              <div className={styles.pickContent}>


                <p className={styles.productBrand}>

                  {product.brand}

                </p>




                <h3>

                  {product.name}

                </h3>





                <div className={styles.productSpecs}>


                  <div>


                    <span>
                      CAPACITY
                    </span>



                    <strong>
                      {product.capacity}
                    </strong>


                  </div>





                  <div>


                    <span>
                      OUTPUT
                    </span>



                    <strong>
                      {product.output}
                    </strong>


                  </div>





                  <div>


                    <span>
                      WEIGHT
                    </span>



                    <strong>
                      {product.weight}
                    </strong>


                  </div>



                </div>





                <p className={styles.productDescription}>

                  {product.description}

                </p>





                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className={styles.productButton}
                >

                  VIEW PRODUCT →

                </a>



              </div>



            </article>


          ))}


        </div>





        <p className={styles.disclosure}>

          Affiliate disclosure: RoamLab may earn
          a commission from qualifying purchases
          made through links on this page.

        </p>


      </section>





      <section className={styles.decision}>


        <p className={styles.eyebrow}>
          QUICK DECISION
        </p>




        <h2>
          Which Mid-Size Power
          Should You Choose?
        </h2>





        <div className={styles.decisionGrid}>


          <div>


            <span>
              01
            </span>


            <strong>
              Want the best overall balance?
            </strong>


            <p>
              Choose the EcoFlow DELTA 2.
            </p>


          </div>





          <div>


            <span>
              02
            </span>


            <strong>
              Planning longer road trips?
            </strong>


            <p>
              Explorer 1000 Plus gives you extra capacity.
            </p>


          </div>





          <div>


            <span>
              03
            </span>


            <strong>
              Need strong output value?
            </strong>


            <p>
              BLUETTI AC180 delivers practical power.
            </p>


          </div>



        </div>


      </section>





      <section className={styles.nextStep}>


        <div>


          <p className={styles.eyebrow}>
            KEEP BUILDING
          </p>




          <h2>
            Need Even More Power?
          </h2>



        </div>





        <div className={styles.nextActions}>


          <Link
            href="/gear/product/compact-power"
            className={styles.secondaryButton}
          >

            ← BACK TO COMPACT POWER

          </Link>





          <Link
            href="/gear/product/large-power"
            className={styles.primaryButton}
          >

            NEXT: LARGE POWER →

          </Link>



        </div>



      </section>





    </main>


  );


}
