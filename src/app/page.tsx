import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">

      <div className="canvas">

        <img
          src="/wild-desk.jpg"
          alt="RoamLab"
          className="image"
        />


        <svg
          className="layer"
          viewBox="0 0 1412 1114"
        >

          {/* 徽章测试区域 */}

          <Link href="/badges">

            <circle
              cx="135"
              cy="120"
              r="70"
              className="hot"
            />

          </Link>


          {/* 越野车测试区域 */}

          <Link href="/ways-in">

            <rect
              x="220"
              y="300"
              width="260"
              height="160"
              className="hot"
            />

          </Link>


        </svg>


      </div>


      <style jsx>{`

        .page{
          width:100%;
          background:#0b0b0b;
        }


        .canvas{

          position:relative;
          width:100%;
          max-width:1412px;
          margin:auto;

        }


        .image{

          width:100%;
          height:auto;
          display:block;

        }


        .layer{

          position:absolute;
          inset:0;

          width:100%;
          height:100%;

        }


        .hot{

          fill:transparent;

          stroke:transparent;

          cursor:pointer;

          transition:.25s;

        }


        .hot:hover{

          fill:rgba(220,140,50,.08);

          stroke:#d88b32;

          stroke-width:3;

        }


      `}</style>


    </main>
  );
}
