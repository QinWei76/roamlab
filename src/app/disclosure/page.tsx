import Link from "next/link";

export default function DisclosurePage() {
  return (
    <main className="legalPage">
      <section className="legalHero">
        <div className="legalContainer">
          <Link href="/" className="backButton">
            ← Back to RoamLab
          </Link>

          <p className="legalEyebrow">ROAMLAB</p>

          <h1>Affiliate Disclosure</h1>

          <p className="legalIntro">
            RoamLab may earn a commission when you purchase products through
            certain links on this website.
          </p>
        </div>
      </section>

      <section className="legalContent">
        <div className="legalContainer">
          <h2>How RoamLab Makes Money</h2>

          <p>
            Some links on RoamLab may be affiliate links. This means that if
            you click a link and make a purchase, RoamLab may receive a small
            commission at no additional cost to you.
          </p>

          <p>
            These commissions help support the research, testing, development
            and maintenance of RoamLab.
          </p>

          <h2>Our Recommendations</h2>

          <p>
            Our goal is to help people build practical and reliable vehicle
            camping systems. Product recommendations are based on factors such
            as functionality, usability, compatibility, value and overall
            suitability for different camping setups.
          </p>

          <p>
            We aim to provide useful and honest information. Affiliate
            relationships do not guarantee that a product will receive a
            positive recommendation.
          </p>

          <h2>Prices and Availability</h2>

          <p>
            Product prices, availability and specifications may change at any
            time. Please check the retailer or manufacturer website for the
            latest information before making a purchase.
          </p>

          <h2>Questions</h2>

          <p>
            If you have questions about this disclosure, please contact
            RoamLab through our website.
          </p>
        </div>
      </section>
    </main>
  );
}
