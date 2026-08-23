import Hero from "@/components/Hero";
import StartHere from "@/components/StartHere";
import GearLab from "@/components/GearLab";
import VehicleSetup from "@/components/VehicleSetup";
import FieldGuides from "@/components/FieldGuides";

export default function Home() {
  return (
    <main>
      <Hero />
      <StartHere />
      <GearLab />
      <VehicleSetup />
      <FieldGuides />
    </main>
  );
}
