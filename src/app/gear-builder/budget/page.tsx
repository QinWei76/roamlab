"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";


const budgets = [

  {
    id: "essential",
    number: "01",
    title: "Essential",
    price: "$500 - $1,500",
    description:
      "Start simple. Build the basics for comfortable weekend adventures.",
  },


  {
    id: "explorer",
    number: "02",
    title: "Explorer",
    price: "$1,500 - $5,000",
    description:
      "A balanced system with the gear you actually need for real adventures.",
    recommended: true,
  },


  {
    id: "complete",
    number: "03",
    title: "Complete System",
    price: "$5,000+",
    description:
      "A full vehicle camping setup designed for longer journeys.",
  },

];



function BudgetContent(){

  const searchParams = useSearchParams();


  const vehicle =
    searchParams.get("vehicle") || "SUV";


  const style =
    searchParams.get("style") || "weekend";



  return (

    <main className="setupPage">



      {/* TOP BAR */}

      <div className="setupTopbar">


        <Link
          href={`/gear-builder/setup?vehicle=${vehicle}`}
          className="backButton"
        >
          ← Back
        </Link>



        <div className="setupProgress">

          <span className="active">
            01 Vehicle
          </span>


          <span className="progressLine"/>


          <span className="active">
            02 Style
          </span>


          <span className="progressLine"/>


          <span className="active">
            03 Budget
          </span>


        </div>


      </div>





      {/* HERO */}


      <section className="setupHero">


        <div className="setupStep">
          STEP 03
        </div>



        <p className="setupVehicle">

          {vehicle.toUpperCase()} · {style.toUpperCase()}

        </p>



        <h1>

          What's your
          <br/>
          budget?

        </h1>



        <p>

          Choose your starting point and we will
          build the right camping system for you.

        </p>


      </section>







      {/* BUDGET OPTIONS */}


      <section className="styleSection">


        <div className="styleGrid">



          {budgets.map((budget)=>(


            <Link


              key={budget.id}


              href={`/gear-builder/result?vehicle=${vehicle}&style=${style}&budget=${budget.id}`}


              className="styleCard"


            >



              <div className="styleCardContent">



                <div className="styleNumber">

                  {budget.number}

                </div>





                <h2>

                  {budget.title}

                </h2>





                <h3>

                  {budget.price}

                </h3>





                <p>

                  {budget.description}

                </p>





                <div className="styleChoose">


                  {budget.recommended
                    ? "Recommended →"
                    : "Choose →"
                  }


                </div>



              </div>



            </Link>


          ))}



        </div>



      </section>




    </main>

  );

}





export default function BudgetPage(){


  return (

    <Suspense

      fallback={

        <main className="setupPage">

          Loading...

        </main>

      }

    >

      <BudgetContent/>

    </Suspense>

  );

}
