export const metadata = {
  title: "RoamLab | Build Your Perfect Car Camping System",
  description: "Field-tested gear guides and outdoor setup recommendations."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
