import "../styles/home.css";
import {
  HeroSection,
  ServicesSection,
  ToursSliderSection,
  FeaturedPlacesSection,
  PartnersSection,
  AboutSection,
  OurGuidesSection,
  AppDownloadSection,
} from "../components/home";

export default function Home() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-white font-sans antialiased"
    >
      <HeroSection />
      <ServicesSection />

      <AboutSection />
      <PartnersSection />

      <FeaturedPlacesSection />
      <OurGuidesSection />

      <ToursSliderSection />
      <AppDownloadSection />
    </div>
  );
}
