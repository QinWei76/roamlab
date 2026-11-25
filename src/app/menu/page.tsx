import Link from "next/link";
import { navigation } from "../../config/navigation";
export default function MenuPage(){return <main style={{minHeight:"100svh",padding:"2rem",background:"#21170e",color:"#fff0d9"}}><h1>RoamLab Menu</h1><nav aria-label="Site navigation">{Object.values(navigation).map(item=><p key={item.id}><Link href={item.href}>{item.label}</Link></p>)}</nav></main>}
