"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, type ComponentProps } from "react";

function Link(props: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  return <NextLink {...props} className={`${props.className ?? ""} roam-press${pressed ? " is-pressed" : ""}`} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || typeof props.href !== "string") return; event.preventDefault(); if (timer.current !== null) return; const href = props.href; setPressed(true); timer.current = setTimeout(() => { timer.current = null; setPressed(false); router.push(href); }, 150); }} />;
}
import "./mobile-home.css";
import { navigation as n } from "../config/navigation";

function DesktopHome() {
  return (
    <main className="roam-page">
      <section className="roam-desk">
        <img
          src="/wild-desk.jpg"
          alt="RoamLab adventure workbench"
          className="roam-background"
          draggable={false}
        />

        <Link href="/badges" className="desk-zone zone-badge" aria-label="Achievements" />
        <Link href="/start-here/discover" className="desk-zone zone-explore" aria-label="Explore" />
        <Link href="/prepare" className="desk-zone zone-checklist" aria-label="Checklist" />
        <Link href="/ways-in" className="desk-zone zone-vehicle" aria-label="Ways In" />
        <Link href="/prepare" className="desk-zone zone-backpack" aria-label="Prepare" />
        <Link href="/safety" className="desk-zone zone-firstaid" aria-label="Safety" />
        <Link href="/learn" className="desk-zone zone-guide" aria-label="Learn" />
        <Link href="/journal" className="desk-zone zone-journal" aria-label="Journal" />
        <Link href="/journal" className="desk-zone zone-stories" aria-label="Stories" />
        <Link href="/wild-plan" className="desk-zone zone-plan" aria-label="Plan Your Wild" />

        <Link href="/start-here/discover" className="top-zone top-explore" aria-label="Explore" />
        <Link href="/wild-plan" className="top-zone top-plan" aria-label="Plan" />
        <Link href="/prepare" className="top-zone top-prepare" aria-label="Prepare" />
        <Link href="/safety" className="top-zone top-safety" aria-label="Safety" />
        <Link href="/learn" className="top-zone top-learn" aria-label="Learn" />
        <Link href="/journal" className="top-zone top-journal" aria-label="Journal" />
        <Link href="/journal" className="top-zone top-stories" aria-label="Stories" />
        <Link href="/badges" className="top-zone top-badges" aria-label="Badges" />
        <Link href="/start-here" className="top-zone top-signin" aria-label="Get Started" />
        <Link href="/start-here" className="top-zone top-start" aria-label="Start" />
        <Link href="/start-here" className="center-start-zone" aria-label="Start Your Wild" />
      </section>
    </main>
  );
}

const asset = "/roamlab-mobile-v3-assets/";
const primary = [["create-explorer", n.createExplorer], ["build-adventure", n.buildAdventure], ["explore-together", n.exploreTogether]] as const;
const tabs = [["nav-home", n.home], ["nav-adventures", n.myAdventures], ["nav-gear", n.gearLab], ["nav-stories", n.myStories], ["nav-me", n.me]] as const;
function MobileHome() {
  return (
    <main className="mobile-v3">
      <style>{`
        .mobile-v3 {width:100%;margin:0;padding:0;background:#21170e;min-height:100svh;line-height:0;}
        .mobile-v3 img {display:block;width:100%;height:auto;margin:0;padding:0;}
        .mobile-v3 a,.mobile-v3 span {display:block;min-width:0;}
        .mobile-v3-hero,.mobile-v3-band {position:relative;}
        .mobile-v3-primary {display:grid;grid-template-columns:298fr 288fr 287fr;}
        .mobile-v3-tabs {display:grid;grid-template-columns:190fr 174fr 176fr 174fr 159fr;padding-bottom:env(safe-area-inset-bottom);}
        .mobile-v3-hot {position:absolute;display:block;z-index:2;}
        .mobile-v3-menu {position:absolute;left:89%;top:2%;width:11%;height:12%;z-index:5;}
        .mobile-v3-menu summary {display:block;width:100%;height:100%;cursor:pointer;list-style:none;}
        .mobile-v3-menu summary::-webkit-details-marker {display:none;}
        .mobile-v3-menu nav {position:absolute;right:0;top:100%;width:min(78vw,320px);background:#21170e;color:#fff0d9;padding:12px;line-height:1.4;border:1px solid #a68b65;}
        .mobile-v3-menu nav a {color:inherit;padding:10px;text-decoration:none;}
        .mobile-v3-primary {position:relative;z-index:1;}
        .mobile-v3-primary a {position:relative;}
        .mobile-v3-hero {z-index:3;}
        .mobile-v3 a:focus-visible {outline:2px solid white;outline-offset:-3px;}
        .mobile-v3-tabs a,.mobile-v3-menu nav a,.mobile-v3-menu summary {position:relative;}
        .mobile-v3-hot {z-index:4;pointer-events:auto;}
        .mobile-v3-hero > img,.mobile-v3-band > img {pointer-events:none;}
        .mobile-v3-menu summary {touch-action:manipulation;}
        .roam-press,.mobile-v3-menu summary { -webkit-tap-highlight-color:transparent;cursor:pointer;touch-action:manipulation;}
        .roam-press::after,.mobile-v3-menu summary::after {content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(255,169,72,.48),rgba(255,169,72,0) 75%);opacity:0;}
        .roam-press:active::after,.roam-press.is-pressed::after,.mobile-v3-menu summary:active::after,.mobile-v3-menu[open] summary::after {opacity:1;}
      `}</style>
      <header className="mobile-v3-hero">
        <img src={asset+"hero.webp"} width={873} height={784} alt="RoamLab DigiReal Adventure — Create Your Own Adventure. From Imagination to Reality." fetchPriority="high" />
        <Link className="mobile-v3-hot" style={{left:"78%",top:"2%",width:"11%",height:"12%"}} href={n.me.href} aria-label="Account" />
        <details className="mobile-v3-menu">
          <summary aria-label="Toggle navigation menu" />
          <nav aria-label="Site navigation">{Object.values(n).map(item => <Link key={item.id} href={item.href}>{item.label}</Link>)}</nav>
        </details>
      </header>
      <nav className="mobile-v3-primary" aria-label="Adventure tools">
        {primary.map(([file,item]) => <Link key={file} href={item.href}><img src={asset+file+".webp"} alt={item.label}/></Link>)}
      </nav>
      <section className="mobile-v3-band" aria-label="Real adventures and stories">
        <img src={asset+"story-and-real-band.webp"} width={873} height={348} alt="" />
        <Link className="mobile-v3-hot" style={{inset:"0 0 54% 0"}} href={n.bringToLife.href} aria-label={n.bringToLife.label}/>
        <Link className="mobile-v3-hot" style={{inset:"46% 0 0 0"}} href={n.shareStory.href} aria-label={n.shareStory.label}/>
      </section>
      <nav className="mobile-v3-tabs" aria-label="Main navigation">
        {tabs.map(([file,item]) => <Link key={file} href={item.href} aria-current={file==="nav-home"?"page":undefined}><img src={asset+file+".webp"} alt={item.label}/></Link>)}
      </nav>
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <div className="roam-desktop-layout">
        <DesktopHome />
      </div>

      <div className="roam-mobile-layout">
        <MobileHome />
      </div>
    </>
  );
}
