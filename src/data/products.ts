"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { products } from "@/data/products";

export default function ProductPage() {
  const params = useParams();

  const slug = params.slug as keyof typeof products;

  const product = products[slug];

  if (!product) {
    return (
      <main className="productPage">
        <section className="productHero">
          <div className="productHeroContent">
            <Link href="/gear-builder/result" className="backButton">
              ← Back to System
            </Link>

            <p className="productCategory">GEAR LAB</p>

            <h1>Product Not Found</h1>

            <p className="productDescription">
              The product you are looking for does not exist.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="productPage">
      {/* HERO */}
      <section className="productHero">
        <div className="productHeroContent">
          <Link href="/gear-builder/result" className="backButton">
            ← Back to System
          </Link>

          <p className="productCategory">{product.category}</p>

          <h1>{product.name}</h1>

          <p className="productDescription">{product.description}</p>
        </div>
      </section>

      {/* PRODUCT DETAIL */}
      <section className="productDetail">
        <div className="productGrid">
          {/* IMAGE */}
          <div className="productImage">
            <img src={product.image} alt={product.name} />
          </div>

          {/* INFO */}
          <div className="productInfo">
            <div className="productPrice">{product.price}</div>

            <h2>Why We Recommend It</h2>

            <p>{product.recommendation}</p>

            <h2>Key Features</h2>

            <ul>
              {product.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>

            <h2>Pros</h2>

            <ul>
              {product.pros.map((pro) => (
                <li key={pro}>✓ {pro}</li>
              ))}
            </ul>

            {/* BUY OPTIONS */}
            <div className="buySection">
              <p className="buyLabel">WHERE TO BUY</p>

              <a
                href={product.amazonLink}
                className="gearButton"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check Amazon Price →
              </a>

              <a
                href={product.brandLink}
                className="brandButton"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Brand Website →
              </a>

              <Link
                href={product.similarLink}
                className="similarButton"
              >
                Browse Similar Gear →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
