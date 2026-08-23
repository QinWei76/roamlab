const vehicles = ["SUV","Truck","Van","EV"];
const systems = ["Power Systems","Sleep Systems","Storage Systems","Cooking Systems"];

export default function Home(){
 return <main>
  <section style={{padding:"80px 8%", background:"#f5f5f2"}}>
    <p>ROAMLAB OUTDOOR RESEARCH</p>
    <h1>Build Your Perfect<br/>Car Camping System</h1>
    <p>Field-tested gear guides for smarter outdoor adventures.</p>
    <button>Explore Gear</button>
    <button style={{marginLeft:12}}>Find Your Setup</button>
  </section>

  <section style={{padding:"50px 8%"}}>
    <h2>Build Around Your Vehicle</h2>
    <div>{vehicles.map(v=><div key={v}>{v}</div>)}</div>
  </section>

  <section style={{padding:"50px 8%", background:"#fafafa"}}>
    <h2>Gear Lab</h2>
    <div>{systems.map(s=><div key={s}>{s}</div>)}</div>
  </section>

  <footer style={{padding:"30px 8%"}}>
    © 2026 RoamLab · Affiliate Disclosure · Privacy
  </footer>
 </main>
}
