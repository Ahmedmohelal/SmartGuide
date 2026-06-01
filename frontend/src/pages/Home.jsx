import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;

    const scrollToHash = () => {
      const target = document.querySelector(location.hash);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const frameId = requestAnimationFrame(scrollToHash);
    const settleTimer = window.setTimeout(scrollToHash, 250);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimer);
    };
  }, [location.hash]);

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
