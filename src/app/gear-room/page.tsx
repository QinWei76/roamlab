"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { navigation as n } from "../../config/navigation";

export default function GearRoomPage() {
  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  function feedback(event: React.MouseEvent<HTMLAnchorElement>, href: string) { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); if (timer.current !== null) return; setPressed(href); timer.current = setTimeout(() => { timer.current = null; setPressed(null); router.push(href); }, 150); }
  return (
    <main className="gear-room-mobile">
      <style>{`
        .gear-room-mobile {margin:0 auto;width:100%;max-width:600px;min-height:100svh;background:#21170e;position:relative;}
        .gear-room-art {position:relative;width:100%;line-height:0;}
        .gear-room-art img {display:block;width:100%;height:auto;pointer-events:none;}
        .gear-room-hot {position:absolute;display:block;z-index:4;pointer-events:auto;}
        .gear-room-feedback {border-radius:12px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background-color 100ms ease,box-shadow 100ms ease;}
        .gear-room-feedback:active,.gear-room-feedback.is-pressed {transition:none;background-color:transparent;box-shadow:none;cursor:pointer;}
        .gear-room-feedback::after {content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(255,169,72,.26),rgba(255,169,72,0) 68%);opacity:0;transition:opacity 100ms ease;}
        .gear-room-feedback:active::after,.gear-room-feedback.is-pressed::after {opacity:1;}
        @media (prefers-reduced-motion:reduce) {.gear-room-feedback {transition:none;}}
        .gear-room-hot:focus-visible,.gear-room-menu summary:focus-visible {outline:2px solid #fff0d9;outline-offset:-3px;}
        .gear-room-menu {position:absolute;left:87%;top:2%;width:13%;height:8%;z-index:5;}
        .gear-room-menu summary {display:block;width:100%;height:100%;cursor:pointer;list-style:none;}
        .gear-room-menu summary::-webkit-details-marker {display:none;}
        .gear-room-menu nav {position:absolute;right:0;top:100%;width:min(78vw,320px);background:#21170e;color:#fff0d9;padding:12px;line-height:1.4;border:1px solid #a68b65;}
        .gear-room-menu nav a {display:block;color:inherit;padding:10px;text-decoration:none;}
        .gear-room-extra-feedback {touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer;}
        .gear-room-menu summary.gear-room-extra-feedback,.gear-room-menu nav a.gear-room-extra-feedback {position:relative;}
        .gear-room-extra-feedback::after {content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(255,169,72,.55),rgba(255,169,72,0) 80%);opacity:0;}
        .gear-room-extra-feedback:active::after,.gear-room-extra-feedback.is-pressed::after,.gear-room-menu[open] summary::after {opacity:1;}
        @media (prefers-reduced-motion:reduce) { .gear-room-extra-feedback::after {transition:none;} }
      `}</style>
      <div className="gear-room-art">
        <img src="/gear-room-mobile.webp" width={941} height={1671} alt="RoamLab Gear Room — My Gear, Gear Loadout, Gear Tips, Gear Exchange" fetchPriority="high" />
        <Link className={`gear-room-hot gear-room-extra-feedback${pressed === n.home.href ? " is-pressed" : ""}`} style={{left:"3%",top:"1%",width:"35%",height:"9%"}} href={n.home.href} onClick={(event) => feedback(event, n.home.href)} aria-label="Home"/>
        <Link className={`gear-room-hot gear-room-extra-feedback${pressed === n.me.href ? " is-pressed" : ""}`} style={{left:"74%",top:"2%",width:"13%",height:"8%"}} href={n.me.href} onClick={(event) => feedback(event, n.me.href)} aria-label="Account"/>
        <Link className={`gear-room-hot gear-room-feedback${pressed === "/gear-room/my-gear" ? " is-pressed" : ""}`} style={{left:"4.6%",top:"48.1%",width:"91.1%",height:"9.8%"}} href="/gear-room/my-gear" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); if (timer.current !== null) return; setPressed("/gear-room/my-gear"); timer.current = setTimeout(() => { timer.current = null; setPressed(null); router.push("/gear-room/my-gear"); }, 150); }} aria-label="My Gear"/>
        <details className="gear-room-menu">
          <summary className="gear-room-extra-feedback" aria-label="Toggle navigation menu"/>
          <nav aria-label="Site navigation">{Object.values(n).map(item => <Link className={`gear-room-extra-feedback${pressed === item.href ? " is-pressed" : ""}`} key={item.id} href={item.href} onClick={(event) => feedback(event, item.href)}>{item.label}</Link>)}</nav>
        </details>
      </div>
    </main>
  );
}
