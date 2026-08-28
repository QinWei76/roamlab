import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerContainer">
        <div className="footerTop">
          {/* BRAND */}
          <div className="footerBrand">
            <Link href="/" className="footerLogo">
              ROAMLAB
            </Link>

            <p>Build smarter vehicle camping systems.</p>

            <p className="footerSmall">
              Practical guides, gear research and simple systems for better
              adventures on the road.
            </p>
          </div>

          {/* EXPLORE */}
          <div className="footerColumn">
            <h3>EXPLORE</h3>

            <Link href="/start-here">Start Here</Link>

            <Link href="/gear-builder">Gear Builder</Link>

            <Link href="/gear/sleeping">Gear Lab</Link>
          </div>

          {/* SYSTEMS */}
          <div className="footerColumn">
            <h3>SYSTEMS</h3>

            <Link href="/gear/sleeping">Sleeping</Link>

            <Link href="/gear/power">Power</Link>

            <Link href="/gear/cooking">Cooking</Link>

            <Link href="/gear/storage">Storage</Link>

            <Link href="/gear/lighting">Lighting</Link>
          </div>

          {/* LEGAL */}
          <div className="footerColumn">
            <h3>LEGAL</h3>

            <Link href="/disclosure">Affiliate Disclosure</Link>

            <Link href="/privacy">Privacy Policy</Link>

            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>

        <div className="footerDivider" />

        <div className="footerBottom">
          <p>© 2026 RoamLab. All rights reserved.</p>

          <p className="footerAffiliate">
            Some links may earn us a commission.
          </p>
        </div>
      </div>
    </footer>
  );
}
