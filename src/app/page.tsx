import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildCanvas">
        {/* =========================================
            MASTER IMAGE
            ========================================= */}

        <img
          src="/wild-desk.jpg"
          alt="RoamLab"
          className="wildImage"
          draggable={false}
        />

        {/* =========================================
            SVG INTERACTION LAYER
            ========================================= */}

        <svg
          className="interactionLayer"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="false"
        >
          {/* =======================================
              BADGE
              ======================================= */}

          <Link href="/badges" aria-label="Achievements">
            <circle
              cx="145"
              cy="125"
              r="72"
              className="hotspotCircle"
            />
          </Link>

          {/* =======================================
              EXPLORE LABEL
              ======================================= */}

          <Link href="/explore" aria-label="Explore">
            <rect
              x="105"
              y="270"
              width="190"
              height="78"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              VEHICLE
              ======================================= */}

          <Link href="/ways-in" aria-label="Ways In">
            <path
              d="
                M245 330
                L310 315
                L390 325
                L445 355
                L470 400
                L455 435
                L410 455
                L335 458
                L275 445
                L235 415
                L225 375
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              WAYS IN LABEL
              ======================================= */}

          <Link href="/ways-in" aria-label="Ways In">
            <rect
              x="335"
              y="400"
              width="150"
              height="75"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              WILD WALL / POLAROID
              ======================================= */}

          <Link href="/stories" aria-label="The Wild Wall">
            <path
              d="
                M1040 75
                L1265 65
                L1325 110
                L1310 285
                L1250 315
                L1055 295
                L1015 240
                L1020 120
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              PLAN / COMPASS
              ======================================= */}

          <Link href="/plan" aria-label="Plan Your Wild">
            <circle
              cx="1080"
              cy="340"
              r="90"
              className="hotspotCircle"
            />
          </Link>

          {/* =======================================
              PLAN LABEL
              ======================================= */}

          <Link href="/plan" aria-label="Plan Your Wild">
            <rect
              x="1160"
              y="350"
              width="190"
              height="78"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              BACKPACK
              ======================================= */}

          <Link href="/prepare" aria-label="Prepare">
            <path
              d="
                M95 500
                L150 470
                L235 475
                L300 505
                L335 565
                L340 665
                L315 755
                L265 815
                L185 835
                L115 805
                L75 745
                L65 630
                L70 550
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              PREPARE LABEL
              ======================================= */}

          <Link href="/prepare" aria-label="Prepare">
            <rect
              x="255"
              y="555"
              width="185"
              height="78"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              FIRST AID
              ======================================= */}

          <Link href="/safety" aria-label="Safety">
            <path
              d="
                M570 630
                L610 600
                L735 600
                L785 635
                L800 745
                L765 810
                L620 820
                L560 780
                L545 690
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              SAFETY LABEL
              ======================================= */}

          <Link href="/safety" aria-label="Safety">
            <rect
              x="600"
              y="735"
              width="175"
              height="75"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              FIELD GUIDE
              ======================================= */}

          <Link href="/learn" aria-label="Learn">
            <path
              d="
                M850 555
                L1000 545
                L1050 585
                L1035 805
                L995 835
                L855 820
                L820 780
                L825 600
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              LEARN LABEL
              ======================================= */}

          <Link href="/learn" aria-label="Learn">
            <rect
              x="835"
              y="735"
              width="175"
              height="75"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              JOURNAL
              ======================================= */}

          <Link href="/journal" aria-label="My Wild Journal">
            <path
              d="
                M1190 455
                L1385 470
                L1430 520
                L1415 770
                L1370 825
                L1195 810
                L1155 760
                L1160 510
                Z
              "
              className="hotspotPath"
            />
          </Link>

          {/* =======================================
              JOURNAL LABEL
              ======================================= */}

          <Link href="/journal" aria-label="My Wild Journal">
            <rect
              x="1200"
              y="735"
              width="205"
              height="78"
              rx="12"
              className="hotspotRect"
            />
          </Link>

          {/* =======================================
              CENTER CTA
              ======================================= */}

          <Link href="/start-here" aria-label="Start Your Wild">
            <rect
              x="625"
              y="465"
              width="350"
              height="95"
              rx="18"
              className="hotspotCta"
            />
          </Link>

          {/* =======================================
              TOP NAVIGATION
              ======================================= */}

          <Link href="/explore" aria-label="Explore">
            <rect
              x="290"
              y="0"
              width="100"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/plan" aria-label="Plan">
            <rect
              x="400"
              y="0"
              width="90"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/prepare" aria-label="Prepare">
            <rect
              x="495"
              y="0"
              width="115"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/safety" aria-label="Safety">
            <rect
              x="615"
              y="0"
              width="100"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/learn" aria-label="Learn">
            <rect
              x="720"
              y="0"
              width="100"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/journal" aria-label="Journal">
            <rect
              x="825"
              y="0"
              width="115"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/stories" aria-label="Stories">
            <rect
              x="945"
              y="0"
              width="105"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/badges" aria-label="Badges">
            <rect
              x="1055"
              y="0"
              width="110"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/signin" aria-label="Sign In">
            <rect
              x="1170"
              y="0"
              width="130"
              height="70"
              className="navArea"
            />
          </Link>

          <Link href="/start-here" aria-label="Start Your Wild">
            <rect
              x="1310"
              y="0"
              width="260"
              height="75"
              rx="35"
              className="navStartArea"
            />
          </Link>
        </svg>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        body {
          background: #0b0b0b;
        }

        .wildHome {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #0b0b0b;
        }

        /*
          =========================================
          MASTER CANVAS
          =========================================

          The image controls the canvas height.
          Nothing is stretched or cropped.
        */

        .wildCanvas {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          overflow: hidden;
          line-height: 0;
        }

        .wildImage {
          display: block;
          width: 100%;
          height: auto;
          margin: 0;
          padding: 0;
          user-select: none;
          pointer-events: none;
        }

        /*
          =========================================
          SVG INTERACTION LAYER
          =========================================
        */

        .interactionLayer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 20;
          overflow: visible;
        }

        /*
          =========================================
          OBJECT HOTSPOTS
          =========================================

          Invisible by default.
        */

        .hotspotPath,
        .hotspotCircle,
        .hotspotRect,
        .hotspotCta {
          fill: rgba(244, 156, 52, 0);
          stroke: rgba(244, 156, 52, 0);
          stroke-width: 2;
          cursor: pointer;

          transition:
            fill 180ms ease,
            stroke 180ms ease,
            filter 180ms ease;
        }

        /*
          Hover:
          extremely subtle.
        */

        .hotspotPath:hover,
        .hotspotCircle:hover,
        .hotspotRect:hover,
        .hotspotCta:hover {
          fill: rgba(244, 156, 52, 0.035);
          stroke: rgba(244, 156, 52, 0.55);
          filter:
            drop-shadow(0 0 8px rgba(244, 156, 52, 0.28));
        }

        /*
          CTA is slightly stronger.
        */

        .hotspotCta:hover {
          fill: rgba(244, 156, 52, 0.055);
          stroke: rgba(244, 156, 52, 0.65);
        }

        /*
          =========================================
          NAVIGATION
          =========================================
        */

        .navArea,
        .navStartArea {
          fill: rgba(0, 0, 0, 0);
          stroke: rgba(0, 0, 0, 0);
          cursor: pointer;

          transition:
            fill 160ms ease,
            stroke 160ms ease;
        }

        .navArea:hover {
          fill: rgba(244, 156, 52, 0.035);
        }

        .navStartArea:hover {
          fill: rgba(244, 156, 52, 0.055);
          stroke: rgba(244, 156, 52, 0.4);
          stroke-width: 1.5;
        }

        /*
          =========================================
          ACTIVE CLICK
          =========================================
        */

        .hotspotPath:active,
        .hotspotCircle:active,
        .hotspotRect:active,
        .hotspotCta:active,
        .navArea:active,
        .navStartArea:active {
          opacity: 0.75;
        }

        /*
          =========================================
          MOBILE
          =========================================
        */

        @media (max-width: 768px) {
          .wildCanvas {
            min-width: 1000px;
          }

          .wildHome {
            overflow-x: auto;
          }

          .hotspotPath:hover,
          .hotspotCircle:hover,
          .hotspotRect:hover,
          .hotspotCta:hover {
            fill: rgba(244, 156, 52, 0);
            stroke: rgba(244, 156, 52, 0);
            filter: none;
          }
        }
      `}</style>
    </main>
  );
}
