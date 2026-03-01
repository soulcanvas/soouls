import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FooterSection from "./components/FooterSection";
import HeroSection from "./components/HeroSection";
import LandingNavbar from "./components/LandingNavbar";
import RiverOfTimeSection from "./components/RiverOfTimeSection";
import SpatialCanvasSection from "./components/SpatialCanvasSection";
import SundayReviewSection from "./components/SundayReviewSection";
import WaitlistSection from "./components/WaitlistSection";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main style={{ backgroundColor: "#FFFFFF" }}>
      <LandingNavbar />
      <HeroSection />
      <RiverOfTimeSection />
      <SpatialCanvasSection />
      <SundayReviewSection />
      <WaitlistSection />
      <FooterSection />
    </main>
  );
}
