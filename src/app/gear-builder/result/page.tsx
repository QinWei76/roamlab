"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";



const systems = [

  {
    id:"sleeping",

    title:"Sleeping System",

    image:"/sleeping.jpg",

    description:
    "Create a comfortable sleeping setup inside your vehicle.",

    items:[
      "Sleeping platform",
      "Comfort mattress",
      "Compact bedding"
    ]

  },



  {
    id:"power",

    title:"Power System",

    image:"/power.jpg",

    description:
    "Keep your devices powered wherever you travel.",

    items:[
      "Portable power station",
      "Solar charging",
      "Power accessories"
    ]

  },



  {
    id:"cooking",

    title:"Cooking System",

    image:"/cooking.jpg",

    description:
    "Build a simple outdoor kitchen.",

    items:[
      "Camp stove",
      "Cooking box",
      "Cooler setup"
    ]

  },



  {
    id:"storage",

    title:"Storage System",

    image:"/storage.jpg",

    description:
    "Organize your vehicle for faster adventures.",

    items:[
      "Storage boxes",
      "Cargo organization",
      "Modular setup"
    ]

  },



  {
    id:"lighting",

    title:"Lighting System",

    image:"/lighting.jpg",

    description:
    "Light up your campsite after sunset.",

    items:[
      "Camp lantern",
      "Rechargeable lights",
      "Headlamp"
    ]

  }

];







function calculateBudget(

  vehicle:string,

  style:string,

  budget:string

){


  let total = 3200;



  const v = vehicle.toLowerCase();

  const s = style.toLowerCase();

  const b = budget.toLowerCase();




  // Budget


  if(b.includes("essential")){

    total = 1200;

  }



  if(b.includes("explorer")){

    total = 3200;

  }



  if(b.includes("complete")){

    total = 6500;

  }






  // Vehicle


  if(v.includes("truck")){

    total +=300;

  }



  if(v.includes("van")){

    total +=800;

  }



  if(v.includes("ev")){

    total +=500;

  }







  // Style


  if(s.includes("off")){

    total +=700;

  }



  if(s.includes("road")){

    total +=900;

  }



  if(s.includes("base")){

    total +=1200;

  }




  return total.toLocaleString();


}









function ResultContent(){



  const searchParams = useSearchParams();




  const vehicle =

  searchParams.get("vehicle") || "suv";




  const style =

  searchParams.get("style") || "weekend";




  const budget =

  searchParams.get("budget") || "explorer";





  const price = calculateBudget(

    vehicle,

    style,

    budget

  );







return (



<main className="resultPage">





<section className="resultHero">



<div className="resultHeroContent">



<div className="setupStep">

YOUR CAMPING SYSTEM

</div>





<p className="setupVehicle">


{vehicle.toUpperCase()}

{" · "}

{style.toUpperCase()}

{" · "}

{budget.toUpperCase()}



</p>






<h1>

Your adventure

<br/>

starts here.


</h1>







<div className="budgetBox">


<span>

Estimated Setup

</span>




<strong>

${price}

</strong>



</div>




</div>



</section>









<section className="systemSection">



<div className="systemGrid">





{

systems.map((system)=>(


<div

key={system.id}

className="systemCard"

>



<div className="systemImage">


<Image

src={system.image}

alt={system.title}

width={900}

height={600}

className="systemImg"

/>



</div>









<div className="systemContent">



<h2>

{system.title}

</h2>





<p>

{system.description}

</p>







<ul>


{

system.items.map((item)=>(


<li key={item}>

✓ {item}

</li>


))


}



</ul>









<Link

href={`/gear/${system.id}`}

className="gearButton"

>


View Gear →

</Link>





</div>







</div>



))


}






</div>



</section>









<section className="saveSection">


<h2>

Save your camping system

</h2>




<p>

Get your personalized gear list and future upgrades.

</p>






<div className="emailBox">


<input

placeholder="Your email address"

/>




<button>

Save My Setup

</button>



</div>




</section>





</main>



);


}









export default function ResultPage(){



return (


<Suspense


fallback={

<main>

Loading...

</main>

}


>


<ResultContent />


</Suspense>


);


}
