
import Link from "next/link";
import "./mobile-home.css";

function DesktopHome() {
  return (
    <main className="roam-page">
      <section className="roam-desk">
        <img
          src="/wild-desk.jpg"
          alt="RoamLab — Go Wild. Show It."
          className="roam-background"
          draggable={false}
        />

        <Link href="/badges" className="desk-zone zone-badge" aria-label="Achievements" />
        <Link href="/explore" className="desk-zone zone-explore" aria-label="Explore" />
        <Link href="/prepare" className="desk-zone zone-checklist" aria-label="Adventure Checklist" />
        <Link href="/ways-in" className="desk-zone zone-vehicle" aria-label="Ways In" />
        <Link href="/prepare" className="desk-zone zone-backpack" aria-label="Prepare" />
        <Link href="/safety" className="desk-zone zone-firstaid" aria-label="Safety" />
        <Link href="/learn" className="desk-zone zone-guide" aria-label="Learn" />
        <Link href="/journal" className="desk-zone zone-journal" aria-label="My Wild Journal" />
        <Link href="/stories" className="desk-zone zone-stories" aria-label="The Wild Wall" />
        <Link href="/plan" className="desk-zone zone-plan" aria-label="Plan Your Wild" />

        <Link href="/explore" className="top-zone top-explore" aria-label="Explore" />
        <Link href="/plan" className="top-zone top-plan" aria-label="Plan" />
        <Link href="/prepare" className="top-zone top-prepare" aria-label="Prepare" />
        <Link href="/safety" className="top-zone top-safety" aria-label="Safety" />
        <Link href="/learn" className="top-zone top-learn" aria-label="Learn" />
        <Link href="/journal" className="top-zone top-journal" aria-label="Journal" />
        <Link href="/stories" className="top-zone top-stories" aria-label="Stories" />
        <Link href="/badges" className="top-zone top-badges" aria-label="Badges" />
        <Link href="/signin" className="top-zone top-signin" aria-label="Sign In" />
        <Link href="/start-here" className="top-zone top-start" aria-label="Start Your Wild" />
        <Link href="/start-here" className="center-start-zone" aria-label="Start Your Wild" />
      </section>
    </main>
  );
}

type IconName =
  | "mountain"
  | "search"
  | "menu"
  | "map"
  | "image"
  | "backpack"
  | "book"
  | "trees"
  | "clipboard"
  | "shield"
  | "chevron";

function PocketIcon({
  name,
  size = 24,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    mountain: (
      <>
        <path d="m2 20 7-10 4 5 3-9 6 14H2Z" />
        <path d="m6 14 3-4 4 5 3-9 3 7" />
      </>
    ),
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
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m3 17 6-6 4 4 3-3 5 5" />
      </>
    ),
    backpack: (
      <>
        <rect x="5" y="7" width="14" height="15" rx="3" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2M5 11H3v7h2M19 11h2v7h-2" />
        <rect x="9" y="14" width="6" height="5" rx="1" />
      </>
    ),
    book: (
      <>
        <path d="M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Z" />
        <path d="M12 6v14" />
      </>
    ),
    trees: (
      <>
        <path d="m7 3-5 8h3l-4 6h12l-4-6h3L7 3ZM7 17v5" />
        <path d="m17 5-4 6h3l-3 5h10l-3-5h2l-5-6ZM17 16v6" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="m9 15 2 2 4-5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 3 6v6c0 5 3.5 8 9 10 5.5-2 9-5 9-10V6l-9-4Z" />
        <path d="m8 12 3 3 5-6" />
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

const primary = [
  {
    title: "Plan Your Wild",
    subtitle: "Routes · Destinations · Preparation",
    icon: "map" as IconName,
    href: "/wild-plan",
    className: "pocket-card-one",
  },
  {
    title: "Share Your Wild",
    subtitle: "Photos · Captions · Social Posts",
    icon: "image" as IconName,
    href: "",
    className: "pocket-card-two",
  },
  {
    title: "Gear Lab",
    subtitle: "Equipment · Recommendations",
    icon: "backpack" as IconName,
    href: "/gear",
    className: "pocket-card-three",
  },
  {
    title: "My Wild Stories",
    subtitle: "Travel Journals · Memories",
    icon: "book" as IconName,
    href: "/journal",
    className: "pocket-card-four",
  },
];

const secondary = [
  { title: "Explore", icon: "trees" as IconName, href: "/start-here/discover" },
  { title: "Prepare", icon: "clipboard" as IconName, href: "/prepare" },
  { title: "Safety", icon: "shield" as IconName, href: "/safety" },
  { title: "Learn", icon: "book" as IconName, href: "/learn" },
];

function MobileHome() {
  return (
    <main className="pocket-page">
      <div className="pocket-scene">
        <img
          src="/adventure-pocket-bg.png"
          alt=""
          className="pocket-scene-image"
          draggable={false}
        />

        <header className="pocket-topbar">
          <Link href="/" className="pocket-brand">
            <PocketIcon name="mountain" size={27} />
            <span>RoamLab</span>
          </Link>

          <div className="pocket-header-actions">
            <Link href="/start-here/discover" aria-label="Explore">
              <PocketIcon name="search" size={22} />
            </Link>
            <Link href="/start-here" aria-label="Get started">
              <PocketIcon name="menu" size={25} />
            </Link>
          </div>
        </header>

        <div className="pocket-hero-title">
          <h1>RoamLab</h1>
          <span className="pocket-red-stroke" />
          <p>
            Plan Your Wild.
            <br />
            Live Your Story.
          </p>
        </div>

        <nav className="pocket-main-links" aria-label="Main navigation">
          {primary.map((item) => {
            const content = (
              <>
                <span className="pocket-card-icon">
                  <PocketIcon name={item.icon} size={25} />
                </span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
                {item.href ? (
                  <span className="pocket-card-chevron">
                    <PocketIcon name="chevron" size={24} />
                  </span>
                ) : (
                  <span className="pocket-coming-soon">COMING SOON</span>
                )}
              </>
            );

            return item.href ? (
              <Link
                key={item.title}
                href={item.href}
                className={`pocket-paper-link ${item.className}`}
              >
                {content}
              </Link>
            ) : (
              <div
                key={item.title}
                className={`pocket-paper-link pocket-unavailable ${item.className}`}
                aria-label={`${item.title}, coming soon`}
              >
                {content}
              </div>
            );
          })}
        </nav>

        <nav className="pocket-footer-nav" aria-label="Quick navigation">
          {secondary.map((item) => (
            <Link key={item.title} href={item.href}>
              <PocketIcon name={item.icon} size={27} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
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
