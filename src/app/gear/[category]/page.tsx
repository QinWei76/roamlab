"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { gearData } from "@/data/gearData";

export default function GearCategoryPage() {
  const params = useParams();

  const category =
    params.category as keyof typeof gearData;

  const categoryData = gearData[category];

  if (!categoryData) {
    return (
      <main className="gearPage">
        <section className="gearHero">
          <div className="gearHeroContent">
            <Link
              href="/gear-builder/result"
              className="backButton"
            >
              ← Back to System
            </Link>

            <div className="setupStep">
              GEAR LAB
            </div>

            <h1>Gear Not Found</h1>

            <p>
              The gear category you are looking for
              does not exist.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="gearPage">

      {/* HERO */}
      <section className="gearHero">
        <div className="gearHeroContent">

          <Link
            href="/gear-builder/result"
            className="backButton"
          >
            ← Back to System
          </Link>

          <div className="setupStep">
            GEAR LAB
          </div>

          <h1>
            {categoryData.title}
          </h1>

          <p>
            {categoryData.description}
          </p>

        </div>
      </section>


      {/* PRODUCTS */}
      <section className="gearSection">

        <div className="gearGrid">

          {categoryData.products.map((product) => (
            <article
              key={product.slug}
              className="gearCard"
            >

              {/* IMAGE */}
              <div className="gearImage">
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>


              {/* CONTENT */}
              <div className="gearContent">

                <h2>
                  {product.name}
                </h2>

                <div className="gearPrice">
                  {product.price}
                </div>

                <p>
                  {product.description}
                </p>


                <ul>
                  {product.features.map((feature) => (
                    <li key={feature}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>


                <Link
                  href={`/gear/product/${product.slug}`}
                  className="gearButton"
                >
                  View Details →
                </Link>

              </div>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}
