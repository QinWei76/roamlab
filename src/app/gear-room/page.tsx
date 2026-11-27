import Link from "next/link";
import { navigation as n } from "../../config/navigation";

export default function GearRoomPage() {
  return (
    <main className="gear-room-mobile">
      <style>{`
        .gear-room-mobile {margin:0 auto;width:100%;max-width:600px;min-height:100svh;background:#21170e;position:relative;}
        .gear-room-art {position:relative;width:100%;line-height:0;}
        .gear-room-art img {display:block;width:100%;height:auto;}
        .gear-room-hot {position:absolute;display:block;}
        .gear-room-feedback {border-radius:12px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background-color 100ms ease,box-shadow 100ms ease;}
        .gear-room-feedback:active {background-color:rgba(0,0,0,.20);box-shadow:inset 0 0 0 2px rgba(255,149,45,.85),inset 0 0 18px rgba(255,149,45,.18);}
        @media (prefers-reduced-motion:reduce) {.gear-room-feedback {transition:none;}}
        .gear-room-hot:focus-visible,.gear-room-menu summary:focus-visible {outline:2px solid #fff0d9;outline-offset:-3px;}
        .gear-room-menu {position:absolute;left:87%;top:2%;width:13%;height:8%;z-index:5;}
        .gear-room-menu summary {display:block;width:100%;height:100%;cursor:pointer;list-style:none;}
        .gear-room-menu summary::-webkit-details-marker {display:none;}
        .gear-room-menu nav {position:absolute;right:0;top:100%;width:min(78vw,320px);background:#21170e;color:#fff0d9;padding:12px;line-height:1.4;border:1px solid #a68b65;}
        .gear-room-menu nav a {display:block;color:inherit;padding:10px;text-decoration:none;}
      `}</style>
      <div className="gear-room-art">
        <img src="/gear-room-mobile.webp" width={941} height={1671} alt="RoamLab Gear Room — My Gear, Gear Loadout, Gear Tips, Gear Exchange" fetchPriority="high" />
        <Link className="gear-room-hot" style={{left:"3%",top:"1%",width:"35%",height:"9%"}} href={n.home.href} aria-label="Home"/>
        <Link className="gear-room-hot" style={{left:"74%",top:"2%",width:"13%",height:"8%"}} href={n.me.href} aria-label="Account"/>
        <Link className="gear-room-hot gear-room-feedback" style={{left:"4.5%",top:"49.4%",width:"91.5%",height:"10.2%"}} href="/gear-room/my-gear" aria-label="My Gear"/>
        <details className="gear-room-menu">
          <summary aria-label="Toggle navigation menu"/>
          <nav aria-label="Site navigation">{Object.values(n).map(item => <Link key={item.id} href={item.href}>{item.label}</Link>)}</nav>
        </details>
      </div>
    </main>
  );
}
