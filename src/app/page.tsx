import DiseaseDetector from "@/components/DiseaseDetector";
import HeroSection from "@/components/HeroSection";
import MarketIntelligenceSection from "@/components/MarketIntelligenceSection";
import PestDoctorSection from "@/components/PestDoctorSection";
import SmartRobotSection from "@/components/SmartRobotSection";
import CropShopSection from "@/components/CropShopSection";
import VoiceAISection from "@/components/VoiceAISection";
import FarmAdvisorSection from "@/components/FarmAdvisorSection";
import FertilizerCalcSection from "@/components/FertilizerCalcSection";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <HeroSection />

      <MarketIntelligenceSection />

      <PestDoctorSection />

      <SmartRobotSection />

      <CropShopSection />

      <VoiceAISection />

      <FarmAdvisorSection />

      <FertilizerCalcSection />

      <DiseaseDetector />
    </main>


  );
}