import Link from "next/link";
import { navigation as n } from "../../../config/navigation";

export default function MyGearPage() {
  return (
    <main className="my-gear-mobile">
      <style>{`
        .my-gear-mobile {margin:0 auto;width:100%;max-width:600px;min-height:100svh;background:#21170e;position:relative;}
        .my-gear-art {position:relative;width:100%;line-height:0;}
        .my-gear-art img {display:block;width:100%;height:auto;}
        .my-gear-hot {position:absolute;display:block;}
        .my-gear-hot:focus-visible,.my-gear-menu summary:focus-visible {outline:2px solid #fff0d9;outline-offset:-3px;}
        .my-gear-menu {position:absolute;left:87%;top:2%;width:13%;height:8%;z-index:5;}
        .my-gear-menu summary {display:block;width:100%;height:100%;cursor:pointer;list-style:none;}
        .my-gear-menu summary::-webkit-details-marker {display:none;}
        .my-gear-menu nav {position:absolute;right:0;top:100%;width:min(78vw,320px);background:#21170e;color:#fff0d9;padding:12px;line-height:1.4;border:1px solid #a68b65;}
        .my-gear-menu nav a {display:block;color:inherit;padding:10px;text-decoration:none;}
      `}</style>
      <div className="my-gear-art">
        <img src="/my-gear-mobile.webp" width={941} height={1672} alt="RoamLab My Gear — Real Gear, Virtual Gear, Gear Market" fetchPriority="high" />
        <Link className="my-gear-hot" style={{left:"3%",top:"1%",width:"35%",height:"9%"}} href={n.home.href} aria-label="Home"/>
        <Link className="my-gear-hot" style={{left:"74%",top:"2%",width:"13%",height:"8%"}} href={n.me.href} aria-label="Account"/>
        <details className="my-gear-menu">
          <summary aria-label="Toggle navigation menu"/>
          <nav aria-label="Site navigation"><Link href="/gear-room">Gear Room</Link>{Object.values(n).map(item => <Link key={item.id} href={item.href}>{item.label}</Link>)}</nav>
        </details>
      </div>
    </main>
  );
}
