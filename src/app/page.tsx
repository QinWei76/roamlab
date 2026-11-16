
import Link from "next/link";
import "./mobile-home.css";

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

type IconName =
  | "search"
  | "menu"
  | "map"
  | "image"
  | "tent"
  | "book"
  | "chevron";

function PocketIcon({
  name,
  size = 26,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1.5" />
        <path d="m3 18 6-7 4 4 3-3 5 6" />
      </>
    ),
    tent: (
      <>
        <path d="M12 3 2 21h20L12 3Z" />
        <path d="m12 3 4 18M12 13l-4 8" />
      </>
    ),
    book: (
      <>
        <path d="M12 6C9 4 6 4 2 5v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Z" />
        <path d="M12 6v14" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const services: {
  title: string;
  description: string;
  icon: IconName;
  href: string | null;
}[] = [
  {
    title: "Plan Your Wild",
    description: "Routes · Destinations · Preparation",
    icon: "map",
    href: "/wild-plan",
  },
  {
    title: "Share Your Wild",
    description: "Photos · Captions · Social Posts",
    icon: "image",
    href: null,
  },
  {
    title: "Gear Lab",
    description: "Equipment · Recommendations",
    icon: "tent",
    href: "/gear",
  },
  {
    title: "My Wild Stories",
    description: "Travel Journals · Memories",
    icon: "book",
    href: "/journal",
  },
];

function MobileHome() {
  return (
    <main className="pocket-v2">
      <header className="pocket-v2-header">
        <Link href="/" className="pocket-v2-brand" aria-label="RoamLab Home">
  <img
    src="/roamlab-logo-header.png"
    alt="RoamLab"
    className="pocket-v2-logo"
  />
</Link>

        <nav className="pocket-v2-header-actions" aria-label="Quick links">
          <Link href="/start-here/discover" aria-label="Explore">
            <PocketIcon name="search" />
          </Link>
          <Link href="/start-here" aria-label="Get started">
            <PocketIcon name="menu" />
          </Link>
        </nav>
      </header>

      <section className="pocket-v2-scene">
       <div className="pocket-v2-hero">
  <h1 className="pocket-v2-hero-title">
    <img
      src="/roamlab-script.png"
      alt="RoamLab"
      className="pocket-v2-script-image"
    />
  </h1>

  <p className="pocket-v2-slogan">
    <img
      src="/roamlab-slogan.png"
      alt="Plan Your Wild. Live Your Stories."
      className="pocket-v2-slogan-image"
    />
  </p>
</div>
      </section>

      <section className="pocket-v2-services" aria-label="Choose a service">
        <nav className="pocket-v2-grid">
          {services.map((service) => {
            const contents = (
              <>
                <span className="pocket-v2-icon">
                  <PocketIcon name={service.icon} size={34} />
                </span>
                <strong>{service.title}</strong>
                <small>{service.description}</small>
                {service.href ? (
                  <span className="pocket-v2-arrow">
                    <PocketIcon name="chevron" size={21} />
                  </span>
                ) : (
                  <span className="pocket-v2-soon">
                    COMING SOON
                  </span>
                )}
              </>
            );

            return service.href ? (
              <Link
                key={service.title}
                href={service.href}
                className="pocket-v2-card"
              >
                {contents}
              </Link>
            ) : (
              <div
                key={service.title}
                className="pocket-v2-card pocket-v2-disabled"
                aria-label={`${service.title} coming soon`}
              >
                {contents}
              </div>
            );
          })}
        </nav>
      </section>
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
