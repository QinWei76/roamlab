import Image from "next/image";

export default function Hero(){
 return <section className="hero">
  <Image src="/hero.jpg" alt="RoamLab SUV camping system" fill priority className="hero-image"/>
  <div className="hero-overlay"></div>
  <div className="hero-content">
   <p>RESEARCH-DRIVEN GEAR GUIDES</p>
   <h1>Build Your Dream<br/>Car Camping System</h1>
   <p>Research-driven gear guides for smarter outdoor systems.</p>
   <button className="btn">Build Your Setup</button>
  </div>
 </section>
}
