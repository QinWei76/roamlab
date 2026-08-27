"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { products } from "@/data/products";



export default function ProductPage(){



  const params = useParams();



  const slug = params.slug as keyof typeof products;



  const product = products[slug];





  if(!product){


    return (

      <main className="gearPage">


        <section className="gearHero">


          <h1>

            Product Not Found

          </h1>


          <Link href="/gear-builder/result">

            ← Back

          </Link>


        </section>


      </main>

    );


  }






  return (

    <main className="productPage">







      {/* HERO */}


      <section className="productHero">



        <div className="productHeroContent">



          <Link

            href="/gear-builder/result"

            className="backButton"

          >

            ← Back to System

          </Link>






          <p className="productCategory">

            {product.category}

          </p>





          <h1>

            {product.name}

          </h1>






          <p className="productDescription">

            {product.description}

          </p>






        </div>



      </section>









      {/* PRODUCT DETAIL */}





      <section className="productDetail">





        <div className="productGrid">





          {/* IMAGE */}


          <div className="productImage">


            <img

              src={product.image}

              alt={product.name}

            />


          </div>









          {/* INFO */}



          <div className="productInfo">





            <div className="productPrice">


              {product.price}


            </div>







            <h2>

              Why We Recommend It

            </h2>






            <p>

              {product.recommendation}

            </p>








            <h2>

              Key Features

            </h2>







            <ul>


            {

              product.features.map((feature)=>(


                <li key={feature}>

                  ✓ {feature}

                </li>


              ))

            }


            </ul>








            <h2>

              Pros

            </h2>






            <ul>


            {

              product.pros.map((pro)=>(


                <li key={pro}>

                  ✓ {pro}

                </li>


              ))

            }


            </ul>









            <a

              href={product.link}

              className="gearButton"

            >

              Check Latest Price →

            </a>







          </div>







        </div>





      </section>








    </main>


  );

}
