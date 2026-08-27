"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


const budgets = [

  {
    id: "essential",
    number: "01",
    title: "Essential Setup",
    price: "$1,200+",
    description:
      "A simple starter setup for short trips and weekend adventures."
  },


  {
    id: "explorer",
    number: "02",
    title: "Explorer Setup",
    price: "$3,200+",
    description:
      "A balanced camping system with comfort and essential upgrades."
  },


  {
    id: "complete",
    number: "03",
    title: "Complete System",
    price: "$6,500+",
    description:
      "A full vehicle camping setup designed for longer journeys."
  }

];




function BudgetContent(){


  const searchParams = useSearchParams();


  const vehicle =
    searchParams.get("vehicle") || "suv";


  const style =
    searchParams.get("style") || "weekend";




  return (

    <main className="setupPage">



      {/* TOP */}

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

          {vehicle.toUpperCase()}
          {" · "}
          {style.toUpperCase()}

        </p>




        <h1>

          Choose your
          <br/>
          camping budget.

        </h1>



        <p>

          Select a system level that matches
          your adventure goals.

        </p>



      </section>









      {/* BUDGET CARDS */}



      <section className="styleSection">


        <div className="styleGrid">



        {
          budgets.map((budget)=>(


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

                  Choose →

                </div>



              </div>



            </Link>



          ))

        }



        </div>


      </section>





    </main>


  );

}





export default function BudgetPage(){


  return (

    <Suspense

      fallback={

        <main>

          Loading...

        </main>

      }

    >

      <BudgetContent />

    </Suspense>

  );

}
