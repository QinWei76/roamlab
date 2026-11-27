"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { navigation as n } from "../../../config/navigation";

export default function MyGearPage() {
  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  function feedback(event: React.MouseEvent<HTMLAnchorElement>, href: string) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); if (timer.current !== null) return; setPressed(href); timer.current = setTimeout(() => { timer.current = null; setPressed(null); router.push(href); }, 150); }
  return (
    <main className="my-gear-mobile">
      <style>{`
        .my-gear-mobile {margin:0 auto;width:100%;max-width:600px;min-height:100svh;background:#21170e;position:relative;}
        .my-gear-art {position:relative;width:100%;line-height:0;}
        .my-gear-art img {display:block;width:100%;height:auto;pointer-events:none;}
        .my-gear-hot {position:absolute;display:block;z-index:4;pointer-events:auto;}
        .my-gear-hot:focus-visible,.my-gear-menu summary:focus-visible {outline:2px solid #fff0d9;outline-offset:-3px;}
        .my-gear-menu {position:absolute;left:87%;top:2%;width:13%;height:8%;z-index:5;}
        .my-gear-menu summary {display:block;width:100%;height:100%;cursor:pointer;list-style:none;}
        .my-gear-menu summary::-webkit-details-marker {display:none;}
        .my-gear-menu nav {position:absolute;right:0;top:100%;width:min(78vw,320px);background:#21170e;color:#fff0d9;padding:12px;line-height:1.4;border:1px solid #a68b65;}
        .my-gear-menu nav a {display:block;color:inherit;padding:10px;text-decoration:none;}
        .my-gear-extra-feedback {touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer;}
        .my-gear-menu summary.my-gear-extra-feedback,.my-gear-menu nav a.my-gear-extra-feedback {position:relative;}
        .my-gear-extra-feedback::after {content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(255,169,72,.55),rgba(255,169,72,0) 80%);opacity:0;}
        .my-gear-extra-feedback:active::after,.my-gear-extra-feedback.is-pressed::after,.my-gear-menu[open] summary::after {opacity:1;}
        @media (prefers-reduced-motion:reduce) { .my-gear-extra-feedback::after {transition:none;} }
      `}</style>
      <div className="my-gear-art">
        <img src="/my-gear-mobile.webp?v=2" width={941} height={1672} alt="RoamLab My Gear — Real Gear, Virtual Gear, Gear Market" fetchPriority="high" />
        <Link className={`my-gear-hot my-gear-extra-feedback${pressed === n.home.href ? " is-pressed" : ""}`} style={{left:"3%",top:"1%",width:"35%",height:"9%"}} href={n.home.href} onClick={(event) => feedback(event, n.home.href)} aria-label="Home"/>
        <Link className={`my-gear-hot my-gear-extra-feedback${pressed === n.me.href ? " is-pressed" : ""}`} style={{left:"74%",top:"2%",width:"13%",height:"8%"}} href={n.me.href} onClick={(event) => feedback(event, n.me.href)} aria-label="Account"/>
        <details className="my-gear-menu">
          <summary className="my-gear-extra-feedback" aria-label="Toggle navigation menu"/>
          <nav aria-label="Site navigation"><Link className={`my-gear-extra-feedback${pressed === "/gear-room" ? " is-pressed" : ""}`} href="/gear-room" onClick={(event) => feedback(event, "/gear-room")}>Gear Room</Link>{Object.values(n).map(item => <Link className={`my-gear-extra-feedback${pressed === item.href ? " is-pressed" : ""}`} key={item.id} href={item.href} onClick={(event) => feedback(event, item.href)}>{item.label}</Link>)}</nav>
        </details>
      </div>
    </main>
  );
}
