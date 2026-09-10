import Link from "next/link";
import styles from "./product.module.css";


const products = [
  {
    badge: "BEST OVERALL",
    brand: "ECOFLOW",
    name: "DELTA 2",
    capacity: "1024Wh",
    output: "1800W",
    weight: "27 lb",
    description:
      "A balanced power station for multi-day camping, refrigerators and serious vehicle adventures.",
    image: "/delta-2.jpg",
    link:
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
      "Reliable capacity for longer road trips and flexible camping systems.",
    image: "/jackery-explorer-1000-plus.jpg",
    link:
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
      "Strong output and practical capacity for campers who want more freedom.",
    image: "/bluetti-ac180.jpg",
    link:
      "https://www.bluettipower.com/products/ac180",
  },
];



const pros = [
  "Runs refrigerators and larger camping devices",
  "Better balance between capacity and portability",
  "Great upgrade from compact systems",
  "Designed for multi-day adventures",
];


const cons = [
  "Heavier than compact power stations",
  "Requires more storage space",
  "Higher investment upfront",
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

            alt="Mid size power camping setup"

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
            href="#products"
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
            Stay Longer.
            <br />
            Bring More.
          </h2>


        </div>





        <p>

          Mid-size power systems are designed
          for campers who want more freedom
          without building a complete off-grid
          system.

          <br /><br />

          Run a fridge.
          Charge camera gear.
          Power your lights.
          Stay comfortable longer.

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
            More capacity, more flexibility,
            and more confidence on the road.

          </p>



        </div>







        <div className={styles.specGrid}>


          <div className={styles.specCard}>


            <span>
              CAPACITY
            </span>


            <strong>
              1000–1200Wh
            </strong>


          </div>





          <div className={styles.specCard}>


            <span>
              OUTPUT
            </span>


            <strong>
              1800–2000W
            </strong>


          </div>





          <div className={styles.specCard}>


            <span>
              BEST FOR
            </span>


            <strong>
              ROAD TRIPS
            </strong>


          </div>



        </div>


      </section>








      <section className={styles.whySection}>


        <div className={styles.whyImageWrap}>


          <img

            src="/delta-2.jpg"

            alt="EcoFlow Delta 2 camping setup"

            className={styles.whyImage}

          />


        </div>






        <div className={styles.whyContent}>


          <p className={styles.eyebrow}>
            WHY MOVE UP
          </p>





          <h2>

            More Freedom.
            <br />
            Longer Adventures.

          </h2>






          <p>

            Compact power is perfect for simple
            weekend trips.

            <br /><br />

            But when your adventures grow,
            mid-size systems give you the ability
            to bring more equipment and stay away
            longer.

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
              Drone
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
          mid-size power is where capability
          and portability finally meet.

          <br /><br />

          Enough energy for real adventures,
          without carrying a full permanent system.

        </p>



      </section>
            <section
        id="products"
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
            building longer and more capable
            vehicle systems.

          </p>


        </div>








        <div className={styles.pickGrid}>


          {products.map((product)=>(


            <article
              key={product.name}
              className={styles.pickCard}
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

                  href={product.link}

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
              Best overall balance
            </strong>


            <p>
              EcoFlow DELTA 2 gives you the
              strongest all-around setup.
            </p>


          </div>





          <div>

            <span>
              02
            </span>


            <strong>
              Best for road trips
            </strong>


            <p>
              Jackery Explorer 1000 Plus adds
              more capacity for longer travel.
            </p>


          </div>





          <div>

            <span>
              03
            </span>


            <strong>
              Best value
            </strong>


            <p>
              BLUETTI AC180 delivers strong
              performance at a practical size.
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
