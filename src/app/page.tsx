import Link from "next/link";

export default function HomePage() {
  return (
    <main className="roamHome">
      <section className="canvas">

        {/* Background */}
        <img
          src="/wild-desk.jpg"
          alt="RoamLab"
          className="background"
        />


        {/* SVG Interactive Layer */}

        <svg
          className="svgLayer"
          viewBox="0 0 1412 1114"
          preserveAspectRatio="xMidYMid meet"
        >


          {/* =====================
              BADGE
          ===================== */}

          <Link href="/badges">
            <circle
              cx="135"
              cy="120"
              r="70"
              className="hotCircle"
            />
          </Link>



          {/* =====================
              VEHICLE
          ===================== */}

          <Link href="/ways-in">

            <path
              className="hotPath"

              d="
              M230 310
              L300 285
              L390 300
              L455 350
              L470 410
              L430 450
              L330 455
              L250 420
              L220 370
              Z
              "

            />

          </Link>



          {/* =====================
              BACKPACK
          ===================== */}

          <Link href="/prepare">

            <path

              className="hotPath"

              d="
              M70 520
              L150 470
              L260 500
              L330 580
              L310 760
              L220 840
              L100 800
              L55 650
              Z
              "

            />

          </Link>



          {/* =====================
              FIRST AID
          ===================== */}

          <Link href="/safety">

            <path

              className="hotPath"

              d="
              M470 650
              L560 600
              L700 610
              L760 700
              L720 820
              L550 830
              L470 760
              Z
              "

            />

          </Link>



          {/* =====================
              FIELD GUIDE
          ===================== */}

          <Link href="/learn">

            <path

              className="hotPath"

              d="
              M780 560
              L940 540
              L1020 600
              L1000 820
              L850 830
              L790 760
              Z
              "

            />

          </Link>



          {/* =====================
              JOURNAL
          ===================== */}

          <Link href="/journal">

            <path

              className="hotPath"

              d="
              M1110 470
              L1320 480
              L1380 550
              L1350 820
              L1180 830
              L1130 760
              Z
              "

            />

          </Link>



          {/* =====================
              POLAROID / STORIES
          ===================== */}

          <Link href="/stories">

            <path

              className="hotPath"

              d="
              M980 70
              L1250 60
              L1300 270
              L1050 300
              Z
              "

            />

          </Link>



          {/* =====================
              CENTER CTA
          ===================== */}

          <Link href="/start-here">

            <rect

              x="530"
              y="430"
              width="350"
              height="90"

              rx="20"

              className="cta"

            />

          </Link>



        </svg>


      </section>
    </main>
  );
}
