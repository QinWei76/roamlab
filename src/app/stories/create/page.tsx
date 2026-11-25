import Link from "next/link";
import { navigation } from "../../../config/navigation";
export default function Page() { const item = navigation.shareStory; return <main style={{minHeight:"100svh",padding:"2rem",background:"#21170e",color:"#fff0d9"}}><h1>{item.label}</h1><p>{item.description}</p><p>Coming soon</p><Link href="/">Back to Home</Link></main>; }
