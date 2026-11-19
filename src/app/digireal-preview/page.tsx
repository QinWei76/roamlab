import Link from "next/link";
import "./preview.css";

const areas = [
  { label: "Create Your Explorer — preview", className: "explorer", href: "/start-here" },
  { label: "Build Your Adventure — existing planner", className: "adventure", href: "/wild-plan" },
  { label: "Explore Together — preview", className: "together", href: "/start-here" },
  { label: "Bring It to Life — real trip planning", className: "real", href: "/ways-in" },
  { label: "Share Your Story — journal", className: "story", href: "/journal" },
];

const tabs = [
  { label: "Home", href: "/digireal-preview", icon: "⌂" },
  { label: "My Adventures", href: "/wild-plan", icon: "◇" },
  { label: "Gear Lab", href: "/gear", icon: "▣" },
  { label: "My Stories", href: "/journal", icon: "▤" },
  { label: "Me", href: "/start-here", icon: "♙" },
];

export default function DigiRealPreview() {
  return (
    <main className="digireal-preview">
      <div className="digireal-artboard">
        {/* The reference image includes a phone bezel. Crop it using one fixed coordinate system. */}
        <img
          className="digireal-art"
          src="/digireal-mobile-approved-reference.png"
          alt="RoamLab DigiReal Adventure. Two illustrated explorers planning an adventure in the mountains."
          draggable={false}
        />
        <Link href="/start-here" className="digireal-hotspot account" aria-label="Account / get started" />
        <Link href="/start-here" className="digireal-hotspot menu" aria-label="Menu / get started" />
        {areas.map((area) => (
          <Link
            key={area.className}
            href={area.href}
            className={`digireal-hotspot ${area.className}`}
            aria-label={area.label}
          />
        ))}
      </div>
      <nav className="digireal-bottom-nav" aria-label="Mobile navigation">
        {tabs.map((tab, i) => (
          <Link key={tab.label} href={tab.href} className={i === 0 ? "active" : ""} aria-current={i === 0 ? "page" : undefined}>
            <span className="digireal-tab-icon" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
      <p className="digireal-preview-note">Visual interaction preview · New social features are not yet implemented.</p>
    </main>
  );
}
