import "../styles/home.css";
import {
  HeroSection,
  ServicesSection,
  ToursSliderSection,
  FeaturedPlacesSection,
  PartnersSection,
  AboutSection,
  ExperiencesSection,
  NewsSection,
  AppDownloadSection,
  NileCtaSection,
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
      <ToursSliderSection />
      <FeaturedPlacesSection />
      <PartnersSection />
      <AboutSection />
      <ExperiencesSection />
      <NewsSection />
      <AppDownloadSection />
      <NileCtaSection />
      
    </div>
  );
}
