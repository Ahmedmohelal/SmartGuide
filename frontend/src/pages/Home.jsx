import "../styles/home.css";
import {  
  HeroSection,
  ServicesSection,
  FeaturedPlacesSection,
  PartnersSection,
  AboutSection,
  ExperiencesSection,
  NewsSection,
  FaqSection,
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
      <FeaturedPlacesSection />
      <PartnersSection />
      <AboutSection />
      <ExperiencesSection />
      <NewsSection />
      <FaqSection />
      <AppDownloadSection />
      <NileCtaSection />
    </div>
  );
}
