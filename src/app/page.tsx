
import Link from "next/link";
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
        .mobile-v3-hot {position:absolute;display:block;}
        .mobile-v3 a:focus-visible {outline:2px solid white;outline-offset:-3px;}
        .mobile-v3 a:active {filter:brightness(.9);}
      `}</style>
      <header className="mobile-v3-hero">
        <img src={asset+"hero.webp"} width={873} height={784} alt="RoamLab DigiReal Adventure — Create Your Own Adventure. From Imagination to Reality." fetchPriority="high" />
        <Link className="mobile-v3-hot" style={{left:"78%",top:"2%",width:"11%",height:"12%"}} href={n.me.href} aria-label="Account" />
        <Link className="mobile-v3-hot" style={{left:"89%",top:"2%",width:"11%",height:"12%"}} href="/menu" aria-label="Menu" />
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
