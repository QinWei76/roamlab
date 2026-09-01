import Link from "next/link";

export default function HomePage() {
  return (
    <main className="roam-page">

      <div className="roam-canvas">

        {/* 主视觉图片 */}
        <img
          src="/wild-desk.jpg"
          alt="RoamLab Wild Desk"
          className="roam-image"
        />


        {/* SVG 交互层 */}

        <svg
          className="roam-svg"
          viewBox="0 0 1412 1114"
          preserveAspectRatio="xMidYMid meet"
        >


          {/* =====================
              BADGE 徽章
          ===================== */}

          <Link href="/badges">

  <circle
  cx="118"
  cy="190"
  r="82"
  className="hot"
/>
</Link>


          {/* =====================
              VEHICLE 越野车
              测试区域
          ===================== */}

         <Link href="/ways-in">


  <path
    className="hot"
    d="
      M175 405
      L205 360
      L285 325
      L365 320
      L435 350
      L455 395
      L435 425
      L360 440
      L260 435
      L205 500
      Z
    "
  />

</Link>
          {/* =====================
              BACKPACK 背包
          ===================== */}

          <Link href="/prepare">

            <rect
              x="60"
              y="500"
              width="280"
              height="300"
              rx="30"
              className="hot"
            />

          </Link>



          {/* =====================
              FIRST AID 急救包
          ===================== */}

          <Link href="/safety">

            <rect
              x="470"
              y="620"
              width="260"
              height="210"
              rx="25"
              className="hot"
            />

          </Link>



          {/* =====================
              FIELD GUIDE
          ===================== */}

          <Link href="/learn">

            <rect
              x="780"
              y="540"
              width="240"
              height="280"
              rx="20"
              className="hot"
            />

          </Link>



          {/* =====================
              JOURNAL
          ===================== */}

          <Link href="/journal">

            <rect
              x="1120"
              y="470"
              width="220"
              height="350"
              rx="20"
              className="hot"
            />

          </Link>



          {/* =====================
              POLAROID / STORIES
          ===================== */}

          <Link href="/stories">

            <rect
              x="1000"
              y="70"
              width="280"
              height="230"
              rx="20"
              className="hot"
            />

          </Link>



          {/* =====================
              START YOUR WILD
          ===================== */}

          <Link href="/start-here">

            <rect
              x="530"
              y="430"
              width="350"
              height="90"
              rx="25"
              className="hot"
            />

          </Link>


        </svg>

      </div>

    </main>
  );
}
