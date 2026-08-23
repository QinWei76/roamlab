import "./globals.css";

export const metadata={
 title:"RoamLab | Build Your Dream Car Camping System",
 description:"Research-driven gear guides for smarter outdoor systems."
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>
}
