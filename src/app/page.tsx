import DeskObject from "@/components/DeskObject";


export default function Home(){


return (

<main className="roam-page">


<div className="desk">


<img

src="/wild-desk.jpg"

className="background"

/>



<DeskObject

href="/badges"

image="/objects/badge.png"

alt="Badge"

className="badge"

/>



<DeskObject

href="/ways-in"

image="/objects/vehicle.png"

alt="Vehicle"

className="vehicle"

/>



<DeskObject

href="/prepare"

image="/objects/backpack.png"

alt="Backpack"

className="backpack"

/>



</div>


</main>

)

}
