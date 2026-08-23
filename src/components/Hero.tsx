import Image from "next/image";
export default function Hero(){
return <section className="hero">
<Image src="/hero.jpg" alt="RoamLab car camping system" fill priority/>
<div className="overlay"/>
<div className="content">
<p>RESEARCH-DRIVEN GEAR GUIDES</p>
<h1 className="title">Build Your Dream<br/>Car Camping<br/>System</h1>
<p className="sub">Research-driven gear guides for smarter outdoor systems.</p>
<button className="btn">Build Your Setup →</button>
</div>
</section>
}
